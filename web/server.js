// server.js
const http = require("http");
const httpProxy = require("http-proxy");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const INTERNAL_API = process.env.INTERNAL_API_URL || "http://localhost:3001";
const isSocketIO = (url = "") => url === "/socket.io" || url.startsWith("/socket.io/");

const proxy = httpProxy.createProxyServer({
  target: INTERNAL_API,
  changeOrigin: true,
  ws: true,
  xfwd: true,
});

proxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err?.message || err);
  if (res?.writeHead) {
    try { res.writeHead(502, { "Content-Type": "text/plain" }); res.end("Bad Gateway"); } catch {}
  } else if (res?.destroy) {
    try { res.destroy(); } catch {}
  }
});

app.prepare().then(() => {
  const nextUpgrade = app.getUpgradeHandler?.();
  
  const server = http.createServer((req, res) => {
    if (isSocketIO(req.url)) return proxy.web(req, res);
    return handle(req, res);
  });

  server.on("upgrade", (req, socket, head) => {
    if (isSocketIO(req.url)) return proxy.ws(req, socket, head);
    if (nextUpgrade) return nextUpgrade(req, socket, head);
    try { socket.end(); } catch {}
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Proxying /socket.io to ${INTERNAL_API}`);
  });
});
