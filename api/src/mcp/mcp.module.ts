import { Module } from "@nestjs/common";
import { McpClientService } from "./mcp-client.service";
import { LibraryServerModule } from "./library/library-server.module";
import { PlaybackServerModule } from "./playback/playback-server.module";

@Module({
  imports: [LibraryServerModule, PlaybackServerModule],
  providers: [McpClientService],
  exports: [McpClientService],
})
export class McpModule {}
