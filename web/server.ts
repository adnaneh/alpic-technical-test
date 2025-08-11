import next from "next";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import { createProxyServer } from "http-proxy";

const dev: boolean = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

type TargetSource =
  | "INTERNAL_API_URL"
  | "NEXT_PUBLIC_WS_URL"
  | "NEXT_PUBLIC_API_URL"
  | "BACKEND_URL"
  | "DEFAULT";

function resolveWsTarget(): { target: string; source: TargetSource; warnings: string[] } {
  const env = process.env;
  const candidates: { key: TargetSource; value: string | undefined }[] = [
    { key: "INTERNAL_API_URL", value: env.INTERNAL_API_URL },
    { key: "NEXT_PUBLIC_WS_URL", value: env.NEXT_PUBLIC_WS_URL },
    { key: "NEXT_PUBLIC_API_URL", value: env.NEXT_PUBLIC_API_URL },
    { key: "BACKEND_URL", value: env.BACKEND_URL },
  ];

  const warnings: string[] = [];
  const chosen = candidates.find((c) => !!c.value);
  const target = chosen?.value?.trim() || "http://localhost:3001";
  const source: TargetSource = chosen?.key || "DEFAULT";

  if (source === "DEFAULT") {
    warnings.push(
      "No WS target env provided; falling back to http://localhost:3001",
    );
  }

  // Basic sanity checks and hints
  try {
    const u = new URL(target);
    if (process.env.NODE_ENV === "production" && u.protocol === "http:") {
      warnings.push(
        `Using plain http for WS target in production: ${target}. If your backend is behind HTTPS, prefer https:// to avoid upgrade/redirect issues.`,
      );
    }
  } catch {
    warnings.push(`WS target is not a valid URL: ${target}`);
  }

  return { target, source, warnings };
}

const { target: WS_TARGET, source: WS_SOURCE, warnings: WS_WARNINGS } = resolveWsTarget();
const isSocketIO = (url: string): boolean =>
  url === "/socket.io" || url.startsWith("/socket.io/");

const proxy = createProxyServer({
  target: WS_TARGET,
  changeOrigin: true,
  ws: true,
  xfwd: true,
});

proxy.on(
  "error",
  (err: Error, _req?: IncomingMessage, res?: ServerResponse | Socket) => {
    console.error("Proxy error:", err);

    if (res instanceof ServerResponse) {
      try {
        res.writeHead(502, { "Content-Type": "text/plain" });
        res.end("Bad Gateway");
      } catch {}
    } else if (res instanceof Socket) {
      try {
        res.destroy();
      } catch {}
    }
  }
);

app.prepare().then(() => {
  const nextUpgrade = app.getUpgradeHandler();

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (isSocketIO(req.url ?? "")) {
      proxy.web(req, res);
      return;
    }
    handle(req, res);
  });

  server.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
    if (isSocketIO(req.url ?? "")) {
      proxy.ws(req, socket, head);
      return;
    }
    if (nextUpgrade) {
      nextUpgrade(req, socket, head);
      return;
    }
    try {
      socket.end();
    } catch {}
  });

  const port: number = Number(process.env.PORT ?? 3000);
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(
      `> Proxying /socket.io to ${WS_TARGET} (source: ${WS_SOURCE})`,
    );
    if (WS_WARNINGS.length) {
      for (const w of WS_WARNINGS) console.warn(`> WS config warning: ${w}`);
    }
  });
});
