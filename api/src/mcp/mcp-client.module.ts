import { Module } from "@nestjs/common";
import { McpClientService } from "./mcp-client.service";
import { LibraryMcpModule } from "./library/library.module";
import { PlaybackMcpModule } from "./playback/playback.module";

@Module({
  imports: [LibraryMcpModule, PlaybackMcpModule],
  providers: [McpClientService],
  exports: [McpClientService],
})
export class McpClientModule {}
