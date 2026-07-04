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
  const q = searchParams.get("q") ?? "";
  const cat = searchParams.get("cat") ?? "";

  const products = await db.product.findMany({
    where: {
      businessId,
      deletedAt: null,
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {}),
      ...(cat ? { category: cat } : {}),
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const businessId = session.user.businessId;
  if (!businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();

  const sku = body.sku?.trim() || `NEW${Date.now()}`;
  const product = await db.product.create({
    data: {
      businessId,
      name: body.name,
      sku,
      unit: body.unit ?? "pcs",
      category: body.category ?? "Sembako",
      price: body.price ?? 0,
      threshold: body.threshold ?? 10,
      storeQty: body.storeQty ?? 0,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
