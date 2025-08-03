import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { PLAYBACK_TOOLS, PlaybackToolName } from './playback.tools';

export interface AudioState {
  url: string | null;
  startSec: number;
  status: 'idle' | 'playing' | 'paused';
}

@Injectable()
export class PlaybackService {
  private state: AudioState = { url: null, startSec: 0, status: 'idle' };
  private io: Server;

  setIoServer(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  getStatus() {
    return this.state;
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('UI connected', socket.id);
      
      // Push current state so a freshly loaded page stays in sync
      if (this.state.url) {
        socket.emit(this.state.status === 'paused' ? 'pause' : 'play', {
          url: this.state.url,
          start_sec: this.state.startSec
        });
      }
      
      // Listen for audio state updates from the client
      socket.on('audio-state-update', ({ status }) => {
        console.log('Audio state update from client:', status);
        this.state.status = status;
      });
    });
  }

  async play(args: { url: string; start_sec?: number }) {
    const url = String(args.url ?? '');
    const start_sec = Number(args.start_sec ?? 0);
    
    if (!url) {
      throw new Error('url is required');
    }

    console.log('🎵 PlaybackService.play called:', { url: url.substring(0, 100), start_sec });
    
    this.state.url = url;
    this.state.startSec = start_sec;
    this.state.status = 'playing';

    if (this.io) {
      console.log('📡 Emitting play event via Socket.IO');
      this.io.emit('play', { url, start_sec });
    } else {
      console.error('❌ Socket.IO not initialized!');
    }
    
    return {};
  }

  async pause() {
    this.state.status = 'paused';
    this.io.emit('pause', {});
    return {};
  }

  async resume() {
    this.state.status = 'playing';
    this.io.emit('resume', {});
    return {};
  }

  // MCP Tool Provider Interface
  getToolDefinitions() {
    return PLAYBACK_TOOLS;
  }

  handles(toolName: string): toolName is PlaybackToolName {
    return toolName in PLAYBACK_TOOLS;
  }

  async execute(toolName: PlaybackToolName, args: any) {
    switch (toolName) {
      case 'play':
        return this.play(args);
      case 'pause':
        return this.pause();
      case 'resume':
        return this.resume();
      case 'status':
        return this.getStatus();
      default:
        throw new Error(`Unknown playback tool: ${toolName}`);
    }
  }
}