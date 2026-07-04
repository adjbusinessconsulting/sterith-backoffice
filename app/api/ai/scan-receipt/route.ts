import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "AI feature not configured" }, { status: 503 });
}
