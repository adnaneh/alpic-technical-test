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

export async function POST(req: NextRequest) {
  const backend = process.env.INTERNAL_API_URL;
  if (!backend) {
    console.error("BACKEND_URL is not set");
    return NextResponse.json({ error: "Backend service is not configured" }, { status: 503 });
  }

  try {
    const body = await req.text();

    const fwd = stripHopByHop(new Headers(req.headers));
    fwd.set("content-type", "application/json");
    if (!fwd.has("accept")) fwd.set("accept", "text/event-stream, application/x-ndjson, */*");

    const upstream = await fetch(`${backend}/api/chat`, { method: "POST", headers: fwd, body });

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
