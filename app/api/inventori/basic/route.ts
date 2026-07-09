import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// Basic Inventori (bundled): daily ledger read view + Tambah Stok.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;

  let threshold = 5;
  try {
    const rows = await db.$queryRaw<{ t: number }[]>`
      select coalesce(low_stock_threshold, 5)::int as t from stores where id = ${storeId}::uuid`;
    if (rows[0]?.t != null) threshold = rows[0].t;
  } catch { /* low_stock_threshold column may not exist yet */ }

  const products = await db.product.findMany({
    where: { storeId, active: true, deletedAt: null },
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, sku: true, category: true, unit: true,
      stock: true, stockAwal: true, stockTambahan: true, stockTerjual: true,
    },
  });

  return NextResponse.json({ threshold, products });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, qty } = await req.json().catch(() => ({}));
  const n = parseInt(qty, 10);
  if (!id || !n || n <= 0) return NextResponse.json({ error: "Jumlah tidak valid" }, { status: 400 });

  const p = await db.product.findFirst({ where: { id, storeId: session.user.storeId } });
  if (!p) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });

  await db.product.update({
    where: { id },
    data: { stock: (p.stock ?? 0) + n, stockTambahan: (p.stockTambahan ?? 0) + n, stockDate: new Date() },
  });
  return NextResponse.json({ ok: true });
}
