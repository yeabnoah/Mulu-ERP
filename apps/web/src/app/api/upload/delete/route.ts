import { NextResponse } from "next/server";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function POST(request: Request) {
  if (!SERVER_URL) {
    return NextResponse.json(
      { error: "Server URL not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const res = await fetch(`${SERVER_URL}/api/upload/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Upload delete proxy error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed" },
      { status: 500 }
    );
  }
}
