import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storeId } = session.user;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const entries = await db.cashDrawer.findMany({
    where: { storeId, createdAt: { gte: todayStart } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json(entries);
}
