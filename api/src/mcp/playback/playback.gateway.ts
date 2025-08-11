import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";


const ORIGIN_ENV = process.env.CORS_ORIGIN?.trim();
const WS_ORIGIN = (() => {
  if (!ORIGIN_ENV) {
    return process.env.NODE_ENV === "production" ? [] : true;
  }
  const parts = ORIGIN_ENV
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts : (parts[0] ?? true);
})();

@WebSocketGateway({ cors: { origin: WS_ORIGIN }, path: "/socket.io" })
export class PlaybackGateway {
  @WebSocketServer() private server: Server;

  emitPlay(url: string, start_sec = 0, socketId?: string) {
    if (!this.server) return;
    if (socketId) {
      this.server.to(socketId).emit("play", { url, start_sec });
      return;
    }
    this.server.emit("play", { url, start_sec });
  }

  emitPause(socketId?: string) {
    if (!this.server) return;
    if (socketId) {
      this.server.to(socketId).emit("pause");
      return;
    }
    this.server.emit("pause");
  }

  emitResume(socketId?: string) {
    if (!this.server) return;
    if (socketId) {
      this.server.to(socketId).emit("resume");
      return;
    }
    this.server.emit("resume");
  }
}
