import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { type Tool } from "ai";
import { ToolMetadata, DiscoveredTool, ResourceMetadata } from "@rekog/mcp-nest";
import { PlaybackMcpClientService } from "./playback/playback.mcp-client.service";
import { LibraryMcpClientService } from "./library/library.mcp-client.service";
import z from "zod";

@Injectable()
export class McpClientService {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly playbackTools: PlaybackMcpClientService,
    private readonly libraryTools: LibraryMcpClientService
  ) {}

  listAllToolDefs(): Record<string, Tool> {
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
      toolDefs[t.metadata.name] = this.bindTool(t);
    }

    return toolDefs;
  }

  private bindTool(
    t: DiscoveredTool<ToolMetadata | ResourceMetadata>
  ): Tool {
    const instance = this.moduleRef.get(t.providerClass, { strict: false });
    const fn = instance?.[t.methodName];

    const inputSchema =
      'parameters' in (t.metadata as any) && (t.metadata as any).parameters
        ? (t.metadata as any).parameters
        : z.object({});

    return {
      description: t.metadata.description,
      inputSchema,
      execute: async (args: unknown) =>
        fn.call(instance, await inputSchema.parseAsync(args)),
    };
  }
}
