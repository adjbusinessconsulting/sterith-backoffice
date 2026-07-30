import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { dayWindow } from "@/lib/dayWindow";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storeId } = session.user;
  const { searchParams } = new URL(req.url);
  const { from, to } = dayWindow(searchParams.get("date"), searchParams.get("tz"));

  const sales = await db.sale.findMany({
    where: {
      storeId,
      createdAt: { gte: from, lte: to },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: { select: { productName: true, qty: true, price: true, subtotal: true } } },
  });

  // Shape it for the Laporan table (no / kasir / item / metode / total). The raw
  // Prisma fields are trxId / cashierName / paymentMethod, and items is a relation
  // that must be joined — without this the table only had waktu + total.
  const rows = sales.map((s) => ({
    id: s.id,
    no: s.trxId,
    createdAt: s.createdAt,
    cashierName: s.cashierName,
    method: s.paymentMethod,                      // "tunai" | "qris"
    shift: s.shift,
    total: s.total,
    customerName: s.customerName,
    voided: s.voided,
    items: s.items.map((i) => ({ name: i.productName, qty: i.qty, price: i.price, subtotal: i.subtotal })),
  }));

  return NextResponse.json(rows);
}
