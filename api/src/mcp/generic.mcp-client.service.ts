import { Inject, Injectable } from "@nestjs/common";
import {
  McpRegistryService,
  DiscoveredTool,
  ToolMetadata,
  ResourceMetadata,
} from "@rekog/mcp-nest";
import { MCP_MODULE_ID } from "./mcp.constants";

@Injectable()
export class GenericMcpClientService {
  constructor(
    private readonly registry: McpRegistryService,
    @Inject(MCP_MODULE_ID) private readonly mcpModuleId: string,
  ) {}

  getTools(): DiscoveredTool<ToolMetadata>[] {
    return this.registry.getTools(this.mcpModuleId);
  }

  getResources(): DiscoveredTool<ResourceMetadata>[] {
    return this.registry.getResources(this.mcpModuleId);
  }
}
