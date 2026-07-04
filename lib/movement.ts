import { Prisma, MvmtType, Location } from "@prisma/client";
import { db } from "@/lib/prisma";

interface MovementParams {
  businessId: string;
  type: MvmtType;
  productId: string;
  qty: number;
  fromLoc?: Location;
  toLoc?: Location;
  byUserId: string;
  meta?: Record<string, unknown>;
}

export async function recordMovement(
  tx: Omit<typeof db, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  params: MovementParams
) {
  const { businessId, type, productId, qty, fromLoc, toLoc, byUserId, meta } = params;

  await tx.stockMovement.create({
    data: { businessId, type, productId, qty, fromLoc, toLoc, byUserId, meta: meta as Prisma.InputJsonValue },
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
      },
    });
  }

  if (type === "RUSAK") {
    if (fromLoc === "WAREHOUSE") {
      await tx.product.update({ where: { id: productId }, data: { warehouseQty: { decrement: qty } } });
    } else {
      await tx.product.update({ where: { id: productId }, data: { storeQty: { decrement: qty } } });
    }
  }

  if (type === "TERJUAL") {
    await tx.product.update({
      where: { id: productId },
      data: { storeQty: { decrement: qty }, soldToday: { increment: qty } },
    });
  }

  if (type === "OPNAME") {
    if (fromLoc === "WAREHOUSE") {
      await tx.product.update({ where: { id: productId }, data: { warehouseQty: { increment: qty } } });
    } else {
      await tx.product.update({ where: { id: productId }, data: { storeQty: { increment: qty } } });
    }
  }
}
