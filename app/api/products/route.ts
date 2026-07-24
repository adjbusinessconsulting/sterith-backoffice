import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { storeId } = session.user;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const cat = searchParams.get("cat") ?? "";

  try {
    const products = await db.product.findMany({
      where: {
        storeId,
        active: true,
        deletedAt: null,
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {}),
        ...(cat ? { category: cat } : {}),
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(products);
  } catch (e) {
    console.error("GET /api/products failed:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "server_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { storeId } = session.user;
  const body = await req.json();

  const sku = body.sku?.trim() || `NEW${Date.now()}`;
  const id = `prod_${Date.now()}`;
  try {
    const product = await db.product.create({
      data: {
        id,
        storeId,
        name: body.name,
        sku,
        unit: body.unit ?? "pcs",
        category: body.category ?? "Sembako",
        price: body.price ?? 0,
        threshold: body.threshold ?? 10,
        storeQty: body.storeQty ?? 0,
        stock: body.storeQty ?? 0,
        monogram: body.name ? body.name.slice(0, 2).toUpperCase() : "??",
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    console.error("POST /api/products failed:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "server_error" }, { status: 500 });
  }
}
