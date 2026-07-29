import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { dayWindow } from "@/lib/dayWindow";

// Activity log (log aktivitas) for the selected store-local day. The POS mirrors
// each event into activity_logs with { detail, actor } inside meta.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storeId } = session.user;
  const { searchParams } = new URL(req.url);
  const { from, to } = dayWindow(searchParams.get("date"), searchParams.get("tz"));

  try {
    const rows = await db.activityLog.findMany({
      where: { storeId, createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json(rows.map(r => {
      const meta = (r.meta ?? {}) as { detail?: string; actor?: string };
      return { id: r.id, type: r.type, detail: meta.detail ?? "", actor: meta.actor ?? "", createdAt: r.createdAt };
    }));
  } catch {
    return NextResponse.json([]);
  }
}
