import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const product = await db.product.findFirst({ where: { id: params.id, storeId: session.user.storeId } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { storeId } = session.user;
  const body = await req.json();
  const result = await db.product.updateMany({
    where: { id: params.id, storeId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.sku !== undefined && { sku: body.sku }),
      ...(body.unit !== undefined && { unit: body.unit }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.threshold !== undefined && { threshold: body.threshold }),
      ...(body.storeQty !== undefined && { storeQty: body.storeQty, stock: body.storeQty }),
      ...(body.warehouseQty !== undefined && { warehouseQty: body.warehouseQty }),
    },
  });
  return NextResponse.json({ updated: result.count });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { storeId } = session.user;
  await db.product.updateMany({
    where: { id: params.id, storeId },
    data: { deletedAt: new Date(), active: false },
  });
  return NextResponse.json({ ok: true });
}
