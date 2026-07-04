import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = session.user.businessId;
  if (!businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");

  const dateStart = dateParam ? new Date(dateParam) : new Date();
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(dateStart);
  dateEnd.setHours(23, 59, 59, 999);

  const transactions = await db.transaction.findMany({
    where: {
      businessId,
      createdAt: { gte: dateStart, lte: dateEnd },
    },
    include: {
      kasir: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(transactions);
}
