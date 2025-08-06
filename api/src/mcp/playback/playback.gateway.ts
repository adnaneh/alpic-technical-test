import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, path: '/socket.io' })
export class PlaybackGateway {
  @WebSocketServer() private server: Server;

  emitPlay(url: string, start_sec = 0) {
    this.server.emit('play', { url, start_sec });
  }

  emitPause() {
    this.server.emit('pause');
  }

  emitResume() {
    this.server.emit('resume');
  }
}
