import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-connection",
  "transfer-encoding",
  "upgrade",
  "te",
  "trailer",
]);

const stripHopByHop = (h: Headers) => {
  const out = new Headers(h);
  for (const k of HOP_BY_HOP) out.delete(k);
  return out;
};

function resolveBackendApi(): { url: string | null; warnings: string[] } {
  const warnings: string[] = [];
  const raw = process.env.INTERNAL_API_URL?.trim();
  if (!raw) return { url: null, warnings };
  try {
    new URL(raw);
    return { url: raw, warnings };
  } catch {
    warnings.push(`Invalid INTERNAL_API_URL: ${raw}`);
    return { url: null, warnings };
  }
}

export async function POST(req: NextRequest) {
  const { url: backend, warnings } = resolveBackendApi();
  if (!backend) {
    console.error("Backend URL is not set or invalid");
    for (const w of warnings) console.warn(w);
    return NextResponse.json({ error: "Backend service is not configured" }, { status: 503 });
  }

  try {
    const body = await req.text();

    const fwd = stripHopByHop(new Headers(req.headers));
    fwd.set("content-type", "application/json");
    if (!fwd.has("accept")) fwd.set("accept", "text/event-stream, application/x-ndjson, */*");

    const target = new URL("/api/chat", backend).toString();
    const upstream = await fetch(target, {
      method: "POST",
      headers: fwd,
      body,
      signal: req.signal,
    });

    const resHeaders = stripHopByHop(new Headers(upstream.headers));
    resHeaders.delete("content-encoding");
    resHeaders.delete("content-length");
    if (!resHeaders.has("x-accel-buffering")) resHeaders.set("x-accel-buffering", "no");
    if (!resHeaders.has("cache-control")) resHeaders.set("cache-control", "no-cache, no-transform");
    if (!resHeaders.has("content-type")) resHeaders.set("content-type", "text/event-stream");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Backend service unavailable" }, { status: 502 });
  }
}
