import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { LibraryService } from './library/library.service';
import { PlaybackService } from './playback/playback.service';

@Module({
  controllers: [McpController],
  providers: [LibraryService, PlaybackService],
  exports: [LibraryService, PlaybackService], // Export for use in other modules
})
export class McpModule {}