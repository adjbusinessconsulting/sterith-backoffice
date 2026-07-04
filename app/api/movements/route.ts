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
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const movements = await db.stockMovement.findMany({
    where: {
      businessId,
      ...(type ? { type: type as "MASUK" | "TRANSFER" | "TERJUAL" | "RUSAK" | "OPNAME" } : {}),
    },
    include: {
      product: { select: { name: true, sku: true } },
      byUser: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(movements);
}
