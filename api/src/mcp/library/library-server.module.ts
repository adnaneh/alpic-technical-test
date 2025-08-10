import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { LibraryService } from './library.service';
import { LibraryMcpClientService } from './library.mcp-client.service';
import { GenericMcpClientService } from '../generic.mcp-client.service';
import { MCP_MODULE_ID } from '../mcp.constants';
import {
  LIBRARY_SERVER_NAME,
  LIBRARY_SERVER_VERSION,
  LIBRARY_API_PREFIX,
} from './library.constants';
import { getMcpModuleId } from '../mcp-id.util';

const LibraryServerDynamic = McpModule.forRoot({
  name: LIBRARY_SERVER_NAME,
  version: LIBRARY_SERVER_VERSION,
  apiPrefix: LIBRARY_API_PREFIX,
});

const MCP_MODULE_ID_VALUE = getMcpModuleId(LibraryServerDynamic);

@Module({
  imports: [LibraryServerDynamic],
  providers: [
    LibraryService,
    { provide: MCP_MODULE_ID, useValue: MCP_MODULE_ID_VALUE },
    { provide: LibraryMcpClientService, useClass: GenericMcpClientService },
  ],
  exports: [LibraryMcpClientService],
})
export class LibraryServerModule {}
