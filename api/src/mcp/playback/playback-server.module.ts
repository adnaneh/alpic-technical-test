import { Module } from "@nestjs/common";
import { McpModule } from "@rekog/mcp-nest";
import { PlaybackService } from "./playback.service";
import { PlaybackGateway } from "./playback.gateway";
import { PlaybackMcpClientService } from "./playback.mcp-client.service";
import { GenericMcpClientService } from "../generic.mcp-client.service";
import { MCP_MODULE_ID } from "../mcp.constants";
import {
  PLAYBACK_SERVER_NAME,
  PLAYBACK_SERVER_VERSION,
  PLAYBACK_API_PREFIX,
} from "./playback.constants";
import { getMcpModuleId } from "../mcp-id.util";

const PlaybackServerDynamic = McpModule.forRoot({
  name: PLAYBACK_SERVER_NAME,
  version: PLAYBACK_SERVER_VERSION,
  apiPrefix: PLAYBACK_API_PREFIX,
});

const MCP_MODULE_ID_VALUE = getMcpModuleId(PlaybackServerDynamic);

@Module({
  imports: [PlaybackServerDynamic],
  providers: [
    PlaybackService,
    PlaybackGateway,
    { provide: MCP_MODULE_ID, useValue: MCP_MODULE_ID_VALUE },
    { provide: PlaybackMcpClientService, useClass: GenericMcpClientService },
  ],
  exports: [PlaybackMcpClientService],
})
export class PlaybackServerModule {}
