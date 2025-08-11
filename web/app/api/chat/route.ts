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

function resolveBackend(): { url: string | null; warnings: string[] } {
  const env = process.env as Record<string, string | undefined>;
  const candidates: { key: string; value?: string }[] = [
    { key: "INTERNAL_API_URL", value: env["INTERNAL_API_URL"] },
    { key: "NEXT_PUBLIC_API_URL", value: env["NEXT_PUBLIC_API_URL"] },
    { key: "BACKEND_URL", value: env["BACKEND_URL"] },
  ];
  const warnings: string[] = [];
  const chosen = candidates.find((c) => !!c.value);
  const raw = chosen?.value?.trim();
  if (!raw) return { url: null, warnings };

  let target = raw;
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw);
  if (!hasScheme) {
    const preferHttp = /\.railway\.internal(?::\d+)?(\/|$)/.test(raw) || /localhost/.test(raw);
    const proto = preferHttp ? "http://" : (process.env.NODE_ENV === "production" ? "https://" : "http://");
    target = `${proto}${raw}`;
    warnings.push(`Normalized backend by adding scheme: ${target}`);
  }
  try {
    const u = new URL(target);
    if (u.hostname.endsWith(".railway.internal") && !u.port) {
      const hintedPort = (env["INTERNAL_API_PORT"] || "3000").trim();
      u.port = hintedPort;
      const updated = u.toString().replace(/\/$/, "");
      const src = env["INTERNAL_API_PORT"] ? `INTERNAL_API_PORT=${hintedPort}` : `default :${hintedPort}`;
      warnings.push(`No port specified for railway.internal; using ${src} -> ${updated}`);
      target = updated;
    }
  } catch {
    warnings.push(`Backend URL is invalid: ${target}`);
    return { url: null, warnings };
  }
  return { url: target, warnings };
}

export async function POST(req: NextRequest) {
  const { url: backend, warnings } = resolveBackend();
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
