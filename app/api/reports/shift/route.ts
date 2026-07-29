import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { dayWindow } from "@/lib/dayWindow";

// Tutup shift note for the selected business date (one row per store/day).
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storeId } = session.user;
  const { searchParams } = new URL(req.url);
  const { ymd } = dayWindow(searchParams.get("date"), searchParams.get("tz"));

  try {
    const row = await db.shiftClosing.findUnique({
      where: { storeId_businessDate: { storeId, businessDate: new Date(`${ymd}T00:00:00.000Z`) } },
    });
    return NextResponse.json(row ?? null);
  } catch {
    return NextResponse.json(null);
  }
}
