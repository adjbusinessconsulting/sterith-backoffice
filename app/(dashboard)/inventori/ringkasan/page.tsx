import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { hasAddOn } from "@/lib/addons";
import InventoriDemo from "@/components/InventoriDemo";
import RingkasanClient from "./RingkasanClient";

async function getData(storeId: string, tzMin: number) {
  // Store-local "today" / "this month": the server runs in UTC, so shift by the
  // device's tz offset (minutes east of UTC) the client passes. tzMin 0 (first
  // paint before the client appends ?tz) falls back to UTC and self-corrects.
  const offMs = tzMin * 60000;
  const nowLocal = new Date(Date.now() + offMs);
  const ymd = nowLocal.toISOString().slice(0, 10);
  const todayStart = new Date(new Date(`${ymd}T00:00:00.000Z`).getTime() - offMs);
  const monthStart = new Date(Date.UTC(nowLocal.getUTCFullYear(), nowLocal.getUTCMonth(), 1) - offMs);

  const [products, transferToday, rusakMonth, recentMovements] = await Promise.all([
    db.product.findMany({ where: { storeId, deletedAt: null, active: true } }),
    db.stockMovement.findMany({
      where: { storeId, type: "TRANSFER", createdAt: { gte: todayStart } },
    }),
    db.stockMovement.count({ where: { storeId, type: "RUSAK", createdAt: { gte: monthStart } } }),
    db.stockMovement.findMany({
      where: { storeId },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const itemAktif = products.filter(p => p.warehouseQty > 0 || p.storeQty > 0).length;
  const stokRendah = products.filter(p => (p.warehouseQty + p.storeQty) > 0 && (p.warehouseQty + p.storeQty) < p.threshold).length;
  const transferQty = transferToday.reduce((s, m) => s + m.qty, 0);
  const warehouseSKU = products.filter(p => p.warehouseQty > 0).length;
  const storeSKU = products.filter(p => p.storeQty > 0).length;

  const lowStockProducts = products
    .filter(p => (p.warehouseQty + p.storeQty) > 0 && (p.warehouseQty + p.storeQty) < p.threshold)
    .slice(0, 5);

  return {
    itemAktif,
    stokRendah,
    transferHariIni: transferToday.length,
    transferQty,
    rusakBulanIni: rusakMonth,
    warehouseSKU,
    storeSKU,
    supplierCount: 24,
    lowStockProducts,
    recentMovements,
  };
}

export default async function RingkasanPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  const session = await getServerSession(authOptions);
  if (!hasAddOn(session?.user?.addOns, "inventori")) return <InventoriDemo section="ringkasan" />;
  const storeId = session?.user?.storeId ?? "";
  const sp = (await searchParams) ?? {};
  const tzMin = parseInt(sp.tz ?? "", 10);
  const data = await getData(storeId, Number.isFinite(tzMin) ? tzMin : 0);
  return <RingkasanClient data={data} />;
}
