import { Controller, Get, Post, Body } from '@nestjs/common';
import { LibraryService } from './library/library.service';
import { PlaybackService } from './playback/playback.service';

interface ToolCallRequest {
  name: string;
  arguments?: any;
}

@Controller('mcp')
export class McpController {
  constructor(
    private readonly libraryService: LibraryService,
    private readonly playbackService: PlaybackService,
  ) {}

  @Get('tools')
  getTools() {
    return {
      ...this.libraryService.getToolDefinitions(),
      ...this.playbackService.getToolDefinitions(),
    };
  }

  @Post('call')
  async callTool(@Body() body: ToolCallRequest) {
    const { name, arguments: args = {} } = body;
    
    // Route to appropriate service based on tool name
    if (this.playbackService.handles(name)) {
      return this.playbackService.execute(name, args);
    }
    
    if (this.libraryService.handles(name)) {
      return this.libraryService.execute(name, args);
    }
    
    throw new Error(`Unknown tool: ${name}`);
  }
}