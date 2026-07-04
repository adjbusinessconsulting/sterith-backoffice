import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const businessId = session.user.businessId;
  if (!businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const product = await db.product.findFirst({ where: { id: params.id, businessId } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const businessId = session.user.businessId;
  if (!businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const product = await db.product.updateMany({
    where: { id: params.id, businessId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.sku !== undefined && { sku: body.sku }),
      ...(body.unit !== undefined && { unit: body.unit }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.threshold !== undefined && { threshold: body.threshold }),
      ...(body.storeQty !== undefined && { storeQty: body.storeQty }),
      ...(body.warehouseQty !== undefined && { warehouseQty: body.warehouseQty }),
    },
  });
  return NextResponse.json({ updated: product.count });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const businessId = session.user.businessId;
  if (!businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await db.product.updateMany({
    where: { id: params.id, businessId },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
