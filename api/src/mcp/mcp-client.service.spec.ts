import { McpClientService } from "./mcp-client.service";
import type { ModelMessage } from "ai";
import type {
  DiscoveredTool,
  ToolMetadata,
  ResourceMetadata,
} from "@rekog/mcp-nest";
import { McpRegistryService } from "@rekog/mcp-nest";
import { Test } from "@nestjs/testing";
import z from "zod";

class ProviderA {
  doThing({ x }: { x: number }) {
    return x + 1;
  }
}

class ProviderB {
  readResource() {
    return "ok";
  }
}

describe("McpClientService", () => {
  it("listAllToolDefs binds tools and resources and executes with validation", async () => {
    const toolMeta: ToolMetadata = {
      name: "do_thing",
      description: "desc",
      parameters: z.object({ x: z.number() }),
    };
    const resMeta: ResourceMetadata = {
      name: "res",
      description: "desc",
      uri: "mcp://res",
      mimeType: "text/plain",
    };

    const discoveredTool: DiscoveredTool<ToolMetadata> = {
      type: "tool",
      metadata: toolMeta,
      providerClass: ProviderA,
      methodName: "doThing",
    };
    const discoveredRes: DiscoveredTool<ResourceMetadata> = {
      type: "resource",
      metadata: resMeta,
      providerClass: ProviderB,
      methodName: "readResource",
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        McpClientService,
        ProviderA,
        ProviderB,
        {
          provide: McpRegistryService,
          useValue: {
            getMcpModuleIds: () => ["playback"],
            getTools: (id: string): DiscoveredTool<ToolMetadata>[] =>
              id === "playback" ? [discoveredTool] : [],
            getResources: (id: string): DiscoveredTool<ResourceMetadata>[] =>
              id === "playback" ? [discoveredRes] : [],
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(McpClientService);
    const defs = service.listAllToolDefs();

    expect(Object.keys(defs).sort()).toEqual(["do_thing", "res"]);

    const toolOpts: { toolCallId: string; messages: ModelMessage[] } = {
      toolCallId: "t1",
      messages: [],
    };
    await expect(defs["do_thing"].execute({ x: 1 }, toolOpts)).resolves.toBe(2);
    await expect(
      defs["do_thing"].execute({ x: "a" }, toolOpts),
    ).rejects.toBeTruthy();

    await expect(defs["res"].execute({}, toolOpts)).resolves.toBe("ok");
  });
});
