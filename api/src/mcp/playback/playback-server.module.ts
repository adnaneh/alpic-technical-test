import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { PlaybackService } from './playback.service';
import { PlaybackGateway } from './playback.gateway';
import {
  PLAYBACK_SERVER_NAME,
  PLAYBACK_SERVER_VERSION,
  PLAYBACK_API_PREFIX,
} from './playback.constants';

@Module({
  imports: [
    McpModule.forRoot({
      name: PLAYBACK_SERVER_NAME,
      version: PLAYBACK_SERVER_VERSION,
      apiPrefix: PLAYBACK_API_PREFIX,
      sseEndpoint: 'events',
      messagesEndpoint: 'messages',
      mcpEndpoint: 'mcp',
    }),
  ],
  providers: [PlaybackService, PlaybackGateway],
  exports: [PlaybackService, PlaybackGateway, McpModule],
})
export class PlaybackServerModule {}
