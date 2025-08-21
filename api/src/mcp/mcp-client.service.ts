import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { type Tool } from "ai";
import {
  ToolMetadata,
  DiscoveredTool,
  ResourceMetadata,
  McpRegistryService,
} from "@rekog/mcp-nest";
import z from "zod";
import type { ToolCallContext } from "./mcp-context";

@Injectable()
export class McpClientService {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly registry: McpRegistryService,
  ) {}

  listAllToolDefs(ctx?: ToolCallContext): Record<string, Tool> {
    const toolDefs: Record<string, Tool> = {};

    const moduleIds = this.registry.getMcpModuleIds();
    const allTools: Array<
      DiscoveredTool<ToolMetadata | ResourceMetadata>
    > = [];

    for (const id of moduleIds) {
      const tools = this.registry.getTools(id);
      const resources = this.registry.getResources(id);
      allTools.push(...tools, ...resources);
    }

    for (const t of allTools) {
      toolDefs[t.metadata.name] = this.bindTool(t, ctx);
    }

    return toolDefs;
  }

  private bindTool(
    t: DiscoveredTool<ToolMetadata | ResourceMetadata>,
    ctx?: ToolCallContext,
  ): Tool {
    const instance = this.moduleRef.get(t.providerClass, { strict: false });
    const fn = instance?.[t.methodName];

    const inputSchema = this.isToolMetadata(t.metadata)
      ? (t.metadata.parameters ?? z.object({}))
      : z.object({});

    const tool: Tool = {
      description: t.metadata.description,
      inputSchema,
      execute: async (args: unknown) => {
        const parsed = await inputSchema.parseAsync(args);
        return fn.call(instance, parsed, ctx);
      },
    };
    return tool;
  }

  private isToolMetadata(
    meta: ToolMetadata | ResourceMetadata,
  ): meta is ToolMetadata {
    return "parameters" in meta;
  }
}
