import { NextResponse } from "next/server";
import { BO_BUILD } from "@/lib/build";

// Returns the server's current build so an open page can detect a new deploy.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ build: BO_BUILD }, { headers: { "Cache-Control": "no-store" } });
}
