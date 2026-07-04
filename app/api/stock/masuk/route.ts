import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { recordMovement } from "@/lib/movement";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const businessId = session.user.businessId;
  if (!businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const userId = session.user.id;
  const { supplier, items } = await req.json() as {
    supplier: string;
    items: { name: string; qty: number; unitPrice: number; sku?: string | null }[];
  };

  await db.$transaction(async (tx) => {
    for (const item of items) {
      let product = item.sku
        ? await tx.product.findFirst({ where: { businessId, sku: item.sku, deletedAt: null } })
        : null;

      if (!product) {
        const sku = item.sku?.trim() || `NEW${Date.now()}`;
        product = await tx.product.create({
          data: { businessId, name: item.name, sku, unit: "pcs", category: "Sembako", price: item.unitPrice },
        });
      }

      await recordMovement(tx, {
        businessId,
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
