import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { hasAddOn } from "@/lib/addons";
import LockedSection from "@/components/LockedSection";
import RingkasanClient from "./RingkasanClient";

async function getData(storeId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

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

export default async function RingkasanPage() {
  const session = await getServerSession(authOptions);
  if (!hasAddOn(session?.user?.addOns, "inventori")) return <LockedSection requiredAddOn="inventori" />;
  const storeId = session?.user?.storeId ?? "";
  const data = await getData(storeId);
  return <RingkasanClient data={data} />;
}
