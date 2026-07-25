import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storeId } = session.user;
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");

  const dateStart = dateParam ? new Date(dateParam) : new Date();
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(dateStart);
  dateEnd.setHours(23, 59, 59, 999);

  const sales = await db.sale.findMany({
    where: {
      storeId,
      createdAt: { gte: dateStart, lte: dateEnd },
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
    items: s.items.map((i) => ({ name: i.productName, qty: i.qty, price: i.price, subtotal: i.subtotal })),
  }));

  return NextResponse.json(rows);
}
