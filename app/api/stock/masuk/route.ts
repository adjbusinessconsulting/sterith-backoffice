import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { recordMovement } from "@/lib/movement";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const { storeId, id: userId } = session.user;
  const { supplier, items } = await req.json() as {
    supplier: string;
    items: { name: string; qty: number; unitPrice: number; sku?: string | null }[];
  };

  await db.$transaction(async (tx) => {
    for (const item of items) {
      let product = item.sku
        ? await tx.product.findFirst({ where: { storeId, sku: item.sku, deletedAt: null } })
        : null;

      if (!product) {
        const id = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const sku = item.sku?.trim() || `NEW${Date.now()}`;
        const initials = item.name.slice(0, 2).toUpperCase();
        product = await tx.product.create({
          data: { id, storeId, name: item.name, sku, unit: "pcs", category: "Sembako", price: item.unitPrice, monogram: initials },
        });
      }

      await recordMovement(tx, {
        storeId,
        type: "MASUK",
        productId: product.id,
        qty: item.qty,
        toLoc: "WAREHOUSE",
        byUserId: userId,
        meta: { supplier, unitPrice: item.unitPrice },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
