import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = session.user.businessId;
  if (!businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [transactions, cashEntries] = await Promise.all([
    db.transaction.findMany({ where: { businessId, createdAt: { gte: todayStart } } }),
    db.cashDrawer.findMany({ where: { businessId, createdAt: { gte: todayStart } } }),
  ]);

  const totalOmzet = transactions.reduce((s, t) => s + t.total, 0);
  const transaksi = transactions.length;
  const rataRata = transaksi > 0 ? Math.round(totalOmzet / transaksi) : 0;

  const kasukEntries = cashEntries.filter(e => ["IN", "AUTO_SALES", "OPEN"].includes(e.entryType));
  const keluarEntries = cashEntries.filter(e => e.entryType === "OUT");
  const kasukTotal = kasukEntries.reduce((s, e) => s + e.amount, 0);
  const keluarTotal = keluarEntries.reduce((s, e) => s + e.amount, 0);
  const saldoLaci = kasukTotal - keluarTotal;

  return NextResponse.json({ totalOmzet, transaksi, rataRata, saldoLaci, kasukTotal, keluarTotal });
}
