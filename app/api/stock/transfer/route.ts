import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { recordMovement } from "@/lib/movement";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = session.user.businessId;
  if (!businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const userId = session.user.id;
  const { items } = await req.json() as {
    items: { productId: string; qty: number }[];
  };

  await db.$transaction(async (tx) => {
    for (const item of items) {
      if (item.qty <= 0) continue;

      const product = await tx.product.findFirst({
        where: { id: item.productId, businessId, deletedAt: null },
      });
      if (!product || product.warehouseQty < item.qty) continue;

      await recordMovement(tx, {
        businessId,
        type: "TRANSFER",
        productId: item.productId,
        qty: item.qty,
        fromLoc: "WAREHOUSE",
        toLoc: "STORE",
        byUserId: userId,
      });
    }
  });

  return NextResponse.json({ ok: true });
}
