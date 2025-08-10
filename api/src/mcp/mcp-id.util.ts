import type { DynamicModule, Provider, ValueProvider } from "@nestjs/common";

const MCP_MODULE_ID = "MCP_MODULE_ID";

function isMcpIdValueProvider(p: Provider): p is ValueProvider<string> {
  return (
    typeof p === "object" && p.provide === MCP_MODULE_ID && "useValue" in p
  );
}

export function getMcpModuleId(mod: DynamicModule): string {
  const vp = mod.providers?.find(isMcpIdValueProvider);
  if (!vp) {
    throw new Error("MCP_MODULE_ID value provider not found on DynamicModule");
  }
  return vp.useValue;
}
