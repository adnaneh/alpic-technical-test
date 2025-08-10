import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { type Tool } from "ai";
import {
  ToolMetadata,
  DiscoveredTool,
  ResourceMetadata,
} from "@rekog/mcp-nest";
import { PlaybackMcpClientService } from "./playback/playback.mcp-client.service";
import { LibraryMcpClientService } from "./library/library.mcp-client.service";
import z from "zod";
import type { ToolCallContext } from "./mcp-context";

@Injectable()
export class McpClientService {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly playbackTools: PlaybackMcpClientService,
    private readonly libraryTools: LibraryMcpClientService,
  ) {}

  listAllToolDefs(ctx?: ToolCallContext): Record<string, Tool> {
    const toolDefs: Record<string, Tool> = {};

    const playbackDiscovered = this.playbackTools.getTools();
    const libraryDiscovered = this.libraryTools.getTools();
    const playbackResources = this.playbackTools.getResources();
    const libraryResources = this.libraryTools.getResources();
    const allTools = [
      ...playbackDiscovered,
      ...libraryDiscovered,
      ...playbackResources,
      ...libraryResources,
    ];

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
