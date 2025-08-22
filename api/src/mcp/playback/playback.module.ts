import { Module } from "@nestjs/common";
import { McpModule } from "@rekog/mcp-nest";
import { PlaybackService } from "./playback.service";
import { PlaybackGateway } from "./playback.gateway";
import {
  PLAYBACK_SERVER_NAME,
  PLAYBACK_SERVER_VERSION,
  PLAYBACK_API_PREFIX,
} from "./playback.constants";

const playbackMcpModule = McpModule.forRoot({
  name: PLAYBACK_SERVER_NAME,
  version: PLAYBACK_SERVER_VERSION,
  apiPrefix: PLAYBACK_API_PREFIX,
  transport: [],
});

@Module({
  imports: [playbackMcpModule],
  providers: [PlaybackService, PlaybackGateway],
  exports: [playbackMcpModule],
})
export class PlaybackMcpModule {}
