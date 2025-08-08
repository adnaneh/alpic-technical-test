// mcp-client.service.ts
import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { z } from "zod";
import type { Tool } from "ai";
import {
  McpRegistryService,
  ToolMetadata,
  DiscoveredTool,
} from "@rekog/mcp-nest";
import { LIBRARY_MCP_MODULE_ID } from "./library/library-server.module";
import { PLAYBACK_MCP_MODULE_ID } from "./playback/playback-server.module";

@Injectable()
export class McpClientService {
  private readonly mcpModuleIds = [LIBRARY_MCP_MODULE_ID, PLAYBACK_MCP_MODULE_ID];

  constructor(
    private readonly registry: McpRegistryService,
    private readonly moduleRef: ModuleRef
  ) {}

  /** Build a name->Tool map with real `execute` bound to service methods. */
  listAllToolDefs(): Record<string, Tool> {
    const defs: Record<string, Tool> = {};

    for (const moduleId of this.mcpModuleIds) {
      const discovered = this.registry.getTools(moduleId);

      for (const t of discovered) {
        defs[t.metadata.name] = this.bindTool(moduleId, t);
      }
    }

    return defs;
  }

  private bindTool(moduleId: string, t: DiscoveredTool<ToolMetadata>): Tool {
    const found: { providerClass: any; methodName: string } =
      this.registry.findTool(moduleId, t.metadata.name);

    const instance = this.moduleRef.get(found.providerClass, { strict: false });
    const fn = instance?.[found.methodName];

    const inputSchema = t.metadata.parameters ?? z.object({});

    return {
      description: t.metadata.description,
      inputSchema,
      execute: async (args: unknown) =>
        fn.call(instance, await inputSchema.parseAsync(args)),
    };
  }
}
