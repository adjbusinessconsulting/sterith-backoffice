import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// Aggregated analytics for the Premium Backoffice (Sales Dashboard, Per-Kasir,
// Product Performance). Read-only — computed from existing sales/items data.
// GET /api/analytics?days=7|30|90
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storeId } = session.user;
  const url = new URL(req.url);
  const fromParam = url.searchParams.get("from");   // YYYY-MM-DD (store-local day)
  const toParam = url.searchParams.get("to");
  // Minutes east of UTC for the store's zone (WIB = 420), sent by the client. All
  // day math runs in this zone so a picked date means the STORE's calendar day,
  // not the server's UTC day.
  const offMs = (parseInt(url.searchParams.get("tz") ?? "0", 10) || 0) * 60000;
  const DAY = 86400000;
  // Which local YYYY-MM-DD a UTC instant falls on, in the store's zone.
  const localDayKey = (d: Date) => new Date(d.getTime() + offMs).toISOString().slice(0, 10);
  // UTC instant of the local midnight that starts a given local YYYY-MM-DD.
  const localMidnight = (ymd: string) => new Date(`${ymd}T00:00:00.000Z`).getTime() - offMs;

  let from: Date;
  let to: Date;
  let days: number;
  if (fromParam && toParam && !isNaN(localMidnight(fromParam)) && !isNaN(localMidnight(toParam))) {
    from = new Date(localMidnight(fromParam));
    to = new Date(localMidnight(toParam) + DAY - 1);       // through the end of the local 'to' day
    if (to < from) { const t = from; from = to; to = t; }  // guard reversed input
    days = Math.min(Math.floor((to.getTime() - from.getTime()) / DAY) + 1, 400);
  } else {
    const daysParam = parseInt(url.searchParams.get("days") ?? "30", 10);
    days = [1, 7, 30, 90, 365].includes(daysParam) ? daysParam : 30;
    from = new Date(localMidnight(localDayKey(new Date())) - (days - 1) * DAY);
    to = new Date();
  }

  const [sales, products] = await Promise.all([
    db.sale.findMany({
      where: { storeId, createdAt: { gte: from, lte: to } },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    }),
    db.product.findMany({
      where: { storeId, active: true, deletedAt: null },
      select: { id: true, name: true, emoji: true, category: true, stock: true, storeQty: true },
    }),
  ]);

  // ── Totals ──
  const revenue = sales.reduce((s, x) => s + x.total, 0);
  const transactions = sales.length;
  const itemsSold = sales.reduce((s, x) => s + x.items.reduce((a, i) => a + i.qty, 0), 0);
  const avgBasket = transactions ? Math.round(revenue / transactions) : 0;

  // ── Daily series (every local day in range, zero-filled) ──
  const dailyMap = new Map<string, { revenue: number; transactions: number }>();
  for (let i = 0; i < days; i++) {
    dailyMap.set(localDayKey(new Date(from.getTime() + i * DAY)), { revenue: 0, transactions: 0 });
  }
  // ── Hourly buckets (0–23) ──
  const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: h, revenue: 0, transactions: 0 }));
  // ── Payment mix ──
  const payMap = new Map<string, { revenue: number; count: number }>();
  // ── Per-cashier ──
  const cashierMap = new Map<string, { cashierId: string; cashierName: string; revenue: number; transactions: number; shifts: Record<number, number> }>();
  // ── Product performance ──
  const productMap = new Map<string, { productId: string; productName: string; qty: number; revenue: number }>();
  const soldIds = new Set<string>();

  for (const s of sales) {
    const key = localDayKey(new Date(s.createdAt));
    const dbucket = dailyMap.get(key);
    if (dbucket) { dbucket.revenue += s.total; dbucket.transactions += 1; }

    const h = new Date(new Date(s.createdAt).getTime() + offMs).getUTCHours();
    hourly[h].revenue += s.total; hourly[h].transactions += 1;

    const pm = payMap.get(s.paymentMethod) ?? { revenue: 0, count: 0 };
    pm.revenue += s.total; pm.count += 1; payMap.set(s.paymentMethod, pm);

    const c = cashierMap.get(s.cashierId) ?? { cashierId: s.cashierId, cashierName: s.cashierName, revenue: 0, transactions: 0, shifts: {} };
    c.revenue += s.total; c.transactions += 1;
    if (s.shift != null) c.shifts[s.shift] = (c.shifts[s.shift] ?? 0) + s.total;
    cashierMap.set(s.cashierId, c);

    for (const it of s.items) {
      soldIds.add(it.productId);
      const p = productMap.get(it.productId) ?? { productId: it.productId, productName: it.productName, qty: 0, revenue: 0 };
      p.qty += it.qty; p.revenue += it.subtotal; productMap.set(it.productId, p);
    }
  }

  const daily = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }));
  const paymentMix = Array.from(payMap.entries())
    .map(([method, v]) => ({ method, ...v }))
    .sort((a, b) => b.revenue - a.revenue);
  const cashiers = Array.from(cashierMap.values())
    .map(c => ({ ...c, avgBasket: c.transactions ? Math.round(c.revenue / c.transactions) : 0 }))
    .sort((a, b) => b.revenue - a.revenue);
  const productPerf = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);
  const deadStock = products
    .filter(p => !soldIds.has(p.id))
    .map(p => ({ id: p.id, name: p.name, emoji: p.emoji, category: p.category, stock: p.storeQty || p.stock }))
    .sort((a, b) => b.stock - a.stock);

  return NextResponse.json({
    range: { days, from: from.toISOString(), to: to.toISOString() },
    totals: { revenue, transactions, avgBasket, itemsSold },
    daily,
    hourly,
    paymentMix,
    cashiers,
    products: productPerf,
    deadStock,
  });
}
