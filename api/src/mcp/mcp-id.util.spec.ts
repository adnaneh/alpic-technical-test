import { getMcpModuleId } from "./mcp-id.util";
import type { Provider, DynamicModule } from "@nestjs/common";

describe("getMcpModuleId", () => {
  it("returns value when provider is present", () => {
    class DummyModule {}
    const providers: Provider[] = [
      { provide: "MCP_MODULE_ID", useValue: "abc" },
    ];
    const mod: DynamicModule = { module: DummyModule, providers };
    expect(getMcpModuleId(mod)).toBe("abc");
  });

  it("throws when provider missing", () => {
    class DummyModule {}
    const providers: Provider[] = [{ provide: "OTHER", useValue: "x" }];
    const mod: DynamicModule = { module: DummyModule, providers };
    expect(() => getMcpModuleId(mod)).toThrow(
      "MCP_MODULE_ID value provider not found",
    );
  });
});
