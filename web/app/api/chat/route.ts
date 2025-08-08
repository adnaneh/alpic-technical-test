import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backend = process.env.BACKEND_URL;
  
  if (!backend) {
    console.error("BACKEND_URL environment variable is not set");
    return NextResponse.json(
      { error: "Backend service is not configured" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(`${backend}/api/chat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: await req.text(),
    });

    return new Response(res.body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Error proxying to backend:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend service" },
      { status: 502 }
    );
  }
}