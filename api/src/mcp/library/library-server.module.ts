import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { getMcpModuleId } from '../mcp-id.util';
import { LibraryService } from './library.service';
import {
  LIBRARY_SERVER_NAME,
  LIBRARY_SERVER_VERSION,
  LIBRARY_API_PREFIX,
} from './library.constants';

const LibraryServerDynamic = McpModule.forRoot({
  name: LIBRARY_SERVER_NAME,
  version: LIBRARY_SERVER_VERSION,
  apiPrefix: LIBRARY_API_PREFIX,
  sseEndpoint: 'events',
  messagesEndpoint: 'messages',
  mcpEndpoint: 'mcp',
});

export const LIBRARY_MCP_MODULE_ID = getMcpModuleId(LibraryServerDynamic);

@Module({
  imports: [LibraryServerDynamic],
  providers: [LibraryService],
  exports: [LibraryService, McpModule],
})
export class LibraryServerModule {}
