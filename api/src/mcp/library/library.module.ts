import { Module } from "@nestjs/common";
import { McpModule } from "@rekog/mcp-nest";
import { LibraryService } from "./library.service";
import {
  LIBRARY_SERVER_NAME,
  LIBRARY_SERVER_VERSION,
  LIBRARY_API_PREFIX,
} from "./library.constants";

const libraryMcpModule = McpModule.forRoot({
      name: LIBRARY_SERVER_NAME,
      version: LIBRARY_SERVER_VERSION,
      apiPrefix: LIBRARY_API_PREFIX,
      transport: [],
    })

@Module({
  imports: [libraryMcpModule],
  providers: [LibraryService],
  exports: [libraryMcpModule],
})
export class LibraryMcpModule {}
