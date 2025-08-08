// server.js
const http = require("http");
const httpProxy = require("http-proxy");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Use BACKEND_URL for both HTTP and WS
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const BACKEND_WS_URL = BACKEND_URL.replace(/^http/, "ws");

console.log("Backend URL:", BACKEND_URL);
console.log("Backend WS URL:", BACKEND_WS_URL);

const proxy = httpProxy.createProxyServer({
  target: BACKEND_URL,
  changeOrigin: true,
  ws: true,
});

// Handle proxy errors
proxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err);
  if (res.writeHead) {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Bad Gateway");
  }
});

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith("/socket.io")) {
      // Proxy Socket.IO HTTP requests (polling) to backend
      proxy.web(req, res, { target: BACKEND_URL });
    } else {
      // Let Next.js handle everything else
      handle(req, res);
    }
  });

  // Proxy WebSocket upgrades to backend
  server.on("upgrade", (req, socket, head) => {
    if (req.url.startsWith("/socket.io")) {
      proxy.ws(req, socket, head, { target: BACKEND_WS_URL });
    } else {
      socket.destroy();
    }
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Proxying /socket.io to ${BACKEND_URL}`);
  });
});