import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { dayWindow } from "@/lib/dayWindow";

// Today's cash movements (uang kas) from the table the POS actually writes:
// kas_entries (masuk / keluar / hutang_settle), newest first.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storeId } = session.user;
  const { searchParams } = new URL(req.url);
  const { from, to } = dayWindow(searchParams.get("date"), searchParams.get("tz"));

  let entries: Awaited<ReturnType<typeof db.kasEntry.findMany>> = [];
  try {
    entries = await db.kasEntry.findMany({
      where: { storeId, createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch { /* kas_entries not migrated on this DB — return empty */ }

  const rows = entries.map(e => ({
    id: e.id,
    type: e.type,                                   // masuk | keluar | hutang_settle
    amount: e.type === "keluar" ? -e.amount : e.amount,
    label: e.label,
    description: e.description,
    cashierName: e.cashierName,
    hasPhoto: !!e.photoUrl,
    createdAt: e.createdAt,
  }));

  return NextResponse.json(rows);
}
