import { z } from 'zod';
import { LibraryService } from './library/library.service';
import { PlaybackService } from './playback/playback.service';
import { LIBRARY_TOOLS } from './library/library.tools';
import { PLAYBACK_TOOLS } from './playback/playback.tools';

export function buildMcpTools(
  libraryService: LibraryService, 
  playbackService: PlaybackService,
  emitToolCall?: (name: string, description: string) => void
) {
  const tools: Record<string, any> = {};

  // Build library tools
  Object.entries(LIBRARY_TOOLS).forEach(([name, toolDef]) => {
    tools[name] = {
      description: toolDef.description,
      inputSchema: toolDef.parameters,
      async execute(args: any) {
        try {
          emitToolCall?.(name, getToolDescription(name, args));
          return await libraryService.execute(name as any, args);
        } catch (error: any) {
          return `Failed to execute ${name}: ${error.message}`;
        }
      }
    };
  });

  // Build playback tools
  Object.entries(PLAYBACK_TOOLS).forEach(([name, toolDef]) => {
    tools[name] = {
      description: toolDef.description,
      inputSchema: toolDef.parameters,
      async execute(args: any) {
        try {
          emitToolCall?.(name, getToolDescription(name, args));
          const result = await playbackService.execute(name as any, args);
          return getSuccessMessage(name, args, result);
        } catch (error: any) {
          return `Failed to execute ${name}: ${error.message}`;
        }
      }
    };
  });

  return tools;
}

function getToolDescription(toolName: string, args?: any): string {
  switch (toolName) {
    case 'get_catalog':
      return 'Fetching complete audiobook catalog...';
    case 'list_books':
      return `Searching for books: "${args?.query || ''}"`;
    case 'list_chapters':
      return `Getting chapters for book ${args?.book_id}...`;
    case 'get_chapter_audio':
      return `Getting audio for book ${args?.book_id}, chapter ${args?.chap_id}...`;
    case 'play':
      return `Starting audio playback: ${args?.url ? (args.url.includes('/') ? args.url.split('/').pop() : args.url) : 'audio file'}`;
    case 'pause':
      return 'Pausing audio playback...';
    case 'resume':
      return 'Resuming audio playback...';
    case 'status':
      return 'Checking playback status...';
    default:
      return `Executing ${toolName}...`;
  }
}

function getSuccessMessage(toolName: string, args?: any, result?: any): string {
  switch (toolName) {
    case 'play':
      return `Started playing audio from ${args?.url} at ${args?.start_sec || 0}s`;
    case 'pause':
      return 'Audio playback paused';
    case 'resume':
      return 'Audio playback resumed';
    case 'status':
      return `Current status: ${result?.status || 'unknown'}, URL: ${result?.url || 'none'}`;
    default:
      return `${toolName} completed successfully`;
  }
}