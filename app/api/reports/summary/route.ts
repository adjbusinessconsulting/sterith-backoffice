import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { dayWindow } from "@/lib/dayWindow";

// Store performance for a given (store-local) day. Saldo laci mirrors the POS
// Kas screen exactly: modal awal + penjualan tunai + kas masuk − kas keluar.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storeId } = session.user;
  const { searchParams } = new URL(req.url);
  const { from, to, ymd } = dayWindow(searchParams.get("date"), searchParams.get("tz"));

  const sales = await db.sale.findMany({ where: { storeId, createdAt: { gte: from, lte: to } }, select: { total: true, paymentMethod: true } });
  // kas_entries / day_opens may not be migrated on every store's DB — degrade to
  // zeros rather than 500 the whole page if a table is missing.
  let kas: { type: string; amount: number }[] = [];
  let modalAwal = 0;
  try { kas = await db.kasEntry.findMany({ where: { storeId, createdAt: { gte: from, lte: to } }, select: { type: true, amount: true } }); } catch {}
  try {
    const d = await db.dayOpen.findUnique({ where: { storeId_businessDate: { storeId, businessDate: new Date(`${ymd}T00:00:00.000Z`) } }, select: { modalAwal: true } });
    modalAwal = d?.modalAwal ?? 0;
  } catch {}

  const totalOmzet = sales.reduce((s, t) => s + t.total, 0);
  const transaksi = sales.length;
  const rataRata = transaksi > 0 ? Math.round(totalOmzet / transaksi) : 0;

  // Drawer (physical cash): opening float + cash sales + manual cash-in − cash-out.
  const autoTunai = sales.filter(s => s.paymentMethod?.toLowerCase() === "tunai").reduce((a, s) => a + s.total, 0);
  const kasMasuk = kas.filter(k => k.type === "masuk" || k.type === "hutang_settle").reduce((a, k) => a + k.amount, 0);
  const kasKeluar = kas.filter(k => k.type === "keluar").reduce((a, k) => a + k.amount, 0);
  const saldoLaci = modalAwal + autoTunai + kasMasuk - kasKeluar;

  return NextResponse.json({ totalOmzet, transaksi, rataRata, saldoLaci, modalAwal, autoTunai, kasMasuk, kasKeluar });
}
