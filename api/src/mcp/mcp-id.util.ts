import type { DynamicModule, ValueProvider } from '@nestjs/common';

export function getMcpModuleId(mod: DynamicModule): string {
  const vp = mod.providers?.find(
    p => typeof p === 'object' && (p as ValueProvider).provide === 'MCP_MODULE_ID'
  ) as ValueProvider<string> | undefined;

  if (!vp?.useValue) {
    throw new Error('MCP_MODULE_ID value provider not found on DynamicModule');
  }
  return vp.useValue;
}