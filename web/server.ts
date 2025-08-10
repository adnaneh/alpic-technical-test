import next from "next";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import { createProxyServer } from "http-proxy";

const dev: boolean = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const WS_TARGET: string =
  process.env.NEXT_PUBLIC_WS_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.INTERNAL_API_URL ||
  "http://localhost:3001";
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
    console.log(`> Proxying /socket.io to ${WS_TARGET}`);
  });
});
