import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storeId } = session.user;
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");

  const dateStart = dateParam ? new Date(dateParam) : new Date();
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(dateStart);
  dateEnd.setHours(23, 59, 59, 999);

  const sales = await db.sale.findMany({
    where: {
      storeId,
      createdAt: { gte: dateStart, lte: dateEnd },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(sales);
}
