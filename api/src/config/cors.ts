export type CorsOrigin = boolean | string | string[];

export function getCorsOrigin(): CorsOrigin {
  const env = process.env.CORS_ORIGIN?.trim();
  if (!env) {
    return process.env.NODE_ENV === "production" ? [] : true;
  }
  const parts = env.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    return process.env.NODE_ENV === "production" ? [] : true;
  }
  return parts.length > 1 ? parts : parts[0];
}

