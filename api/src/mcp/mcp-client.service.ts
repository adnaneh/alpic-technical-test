// mcp-client.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { z } from "zod";
import type { Tool } from "ai";
import {
  McpRegistryService,
  ToolMetadata,
  DiscoveredTool,
} from "@rekog/mcp-nest";

@Injectable()
export class McpClientService {
  constructor(
    private readonly registry: McpRegistryService,
    private readonly moduleRef: ModuleRef
  ) {}

  /** Build a name->Tool map with real `execute` bound to service methods. */
  listAllToolDefs(): Record<string, Tool> {
    const defs: Record<string, Tool> = {};

    for (const moduleId of this.getAllModuleIds()) {
      const discovered = this.registry.getTools(
        moduleId
      );

      for (const t of discovered) {
        defs[t.metadata.name] = this.bindTool(moduleId, t);
      }
    }

    return defs;
  }

  /** Bind a discovered tool to its provider method. Fail fast on misconfig. */
  private bindTool(
    moduleId: string,
    t: DiscoveredTool<ToolMetadata>
  ): Tool {
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

  /** Get all module IDs discovered by the registry (reflection fallback). */
  private getAllModuleIds(): string[] {
    const reg: any = this.registry;
    const map = reg.discoveredToolsByMcpModuleId;
    return map instanceof Map ? Array.from(map.keys()) : [];
  }
}
