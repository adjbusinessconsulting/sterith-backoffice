import { Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";

interface MovementParams {
  storeId: string;
  type: "MASUK" | "TRANSFER" | "TERJUAL" | "RUSAK" | "OPNAME";
  productId: string;
  qty: number;
  fromLoc?: "WAREHOUSE" | "STORE";
  toLoc?: "WAREHOUSE" | "STORE";
  byUserId: string;
  meta?: Record<string, unknown>;
}

export async function recordMovement(
  tx: Omit<typeof db, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  params: MovementParams
) {
  const { storeId, type, productId, qty, fromLoc, toLoc, byUserId, meta } = params;

  await tx.stockMovement.create({
    data: {
      storeId, type, productId, qty,
      fromLoc: fromLoc ?? null,
      toLoc: toLoc ?? null,
      byUserId,
      meta: (meta ?? null) as Prisma.InputJsonValue,
    },
  });

  if (type === "MASUK" && toLoc === "WAREHOUSE") {
    await tx.product.update({
      where: { id: productId },
      data: { warehouseQty: { increment: qty } },
    });
  }

  if (type === "TRANSFER") {
    await tx.product.update({
      where: { id: productId },
      data: {
        warehouseQty: { decrement: qty },
        storeQty: { increment: qty },
        stock: { increment: qty },
      },
    });
  }

  if (type === "RUSAK") {
    const field = fromLoc === "STORE" ? "storeQty" : "warehouseQty";
    await tx.product.update({ where: { id: productId }, data: { [field]: { decrement: qty } } });
  }

  if (type === "TERJUAL") {
    await tx.product.update({
      where: { id: productId },
      data: {
        storeQty: { decrement: qty },
        stock: { decrement: qty },
        soldToday: { increment: qty },
      },
    });
  }

  if (type === "OPNAME") {
    const field = fromLoc === "STORE" ? "storeQty" : "warehouseQty";
    await tx.product.update({ where: { id: productId }, data: { [field]: { increment: qty } } });
  }
}
