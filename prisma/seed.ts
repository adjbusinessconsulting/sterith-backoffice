/**
 * Seed script for development / demo.
 *
 * Owner auth is handled by Supabase Auth — the owner must already exist in
 * auth.users. Set OWNER_AUTH_ID in .env.local to your Supabase auth user UUID.
 * The seed links stores.owner_id to that UUID.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const OWNER_AUTH_ID = process.env.OWNER_AUTH_ID ?? "00000000-0000-0000-0000-000000000001";

async function main() {
  console.log("Seeding…");

  // --- Store ---
  const store = await db.store.create({
    data: {
      clientCode: "PLU-001",
      name: "Toko Sembako Maju",
      address: "Jl. Diponegoro No. 24, Palu Timur",
      phone: "081234567890",
      ownerId: OWNER_AUTH_ID,
      tier: "free",
      status: "active",
      syncedAt: new Date(),
    },
  });

  // --- Cashiers ---
  const aerith = await db.cashier.create({
    data: {
      storeId: store.id,
      name: "Aerith D.",
      initials: "AE",
      role: "kasir",
      pin: "1234",
      active: true,
    },
  });

  const stevany = await db.cashier.create({
    data: {
      storeId: store.id,
      name: "Stevany Carolin",
      initials: "ST",
      role: "kasir",
      pin: "5678",
      active: true,
    },
  });

  // --- Shifts ---
  await db.shift.createMany({
    data: [
      { storeId: store.id, name: "Shift 1", startTime: "06:00", endTime: "14:00" },
      { storeId: store.id, name: "Shift 2", startTime: "14:00", endTime: "22:00", assignedCashierId: aerith.id },
      { storeId: store.id, name: "Shift 3", startTime: "22:00", endTime: "06:00", assignedCashierId: stevany.id },
    ],
  });

  // --- Products ---
  const productDefs = [
    { id: "BRS001", sku: "BRS001", name: "Beras Pandan 5kg",   monogram: "Bp", unit: "karung", category: "Sembako", price: 75000,  threshold: 20, warehouseQty: 42, storeQty: 40, stock: 40, soldToday: 6  },
    { id: "MNY008", sku: "MNY008", name: "Bimoli 2L",           monogram: "Bm", unit: "botol",  category: "Sembako", price: 38000,  threshold: 20, warehouseQty: 18, storeQty: 24, stock: 24, soldToday: 4  },
    { id: "SSU012", sku: "SSU012", name: "Susu Bendera 1L",     monogram: "Sb", unit: "botol",  category: "Sembako", price: 22000,  threshold: 12, warehouseQty: 5,  storeQty: 3,  stock: 3,  soldToday: 5  },
    { id: "MIE003", sku: "MIE003", name: "Indomie Goreng",      monogram: "Ig", unit: "pcs",    category: "Snack",   price: 3500,   threshold: 60, warehouseQty: 300,storeQty: 128,stock: 128,soldToday: 40 },
    { id: "AIR011", sku: "AIR011", name: "Aqua 600ml",          monogram: "Aq", unit: "botol",  category: "Minuman", price: 4000,   threshold: 50, warehouseQty: 240,storeQty: 64, stock: 64, soldToday: 30 },
    { id: "TLR004", sku: "TLR004", name: "Telur Ayam 1kg",      monogram: "Tl", unit: "kg",     category: "Sembako", price: 28000,  threshold: 12, warehouseQty: 20, storeQty: 6,  stock: 6,  soldToday: 5  },
    { id: "GLA006", sku: "GLA006", name: "Gula Pasir 1kg",      monogram: "Gp", unit: "plastik",category: "Sembako", price: 14500,  threshold: 12, warehouseQty: 52, storeQty: 8,  stock: 8,  soldToday: 9  },
    { id: "TEH015", sku: "TEH015", name: "Teh Pucuk 350ml",     monogram: "Tp", unit: "botol",  category: "Minuman", price: 5000,   threshold: 40, warehouseQty: 180,storeQty: 52, stock: 52, soldToday: 22 },
    { id: "KOP021", sku: "KOP021", name: "Kopi Kapal Api",      monogram: "Kk", unit: "renceng",category: "Minuman", price: 12000,  threshold: 20, warehouseQty: 90, storeQty: 24, stock: 24, soldToday: 8  },
    { id: "MIE022", sku: "MIE022", name: "Mie Sedaap Soto",     monogram: "Ms", unit: "pcs",    category: "Snack",   price: 3200,   threshold: 60, warehouseQty: 260,storeQty: 96, stock: 96, soldToday: 28 },
    { id: "KEC031", sku: "KEC031", name: "Kecap Bango 220ml",   monogram: "Kb", unit: "botol",  category: "Sembako", price: 9500,   threshold: 10, warehouseQty: 14, storeQty: 0,  stock: 0,  soldToday: 3  },
    { id: "KRP041", sku: "KRP041", name: "Kerupuk Udang",       monogram: "Ku", unit: "bungkus",category: "Snack",   price: 6000,   threshold: 15, warehouseQty: 40, storeQty: 18, stock: 18, soldToday: 5  },
    { id: "RKK051", sku: "RKK051", name: "Rokok Sampoerna",     monogram: "Rs", unit: "bungkus",category: "Rokok",   price: 28000,  threshold: 30, warehouseQty: 120,storeQty: 34, stock: 34, soldToday: 18 },
    { id: "SBN061", sku: "SBN061", name: "Sabun Lifebuoy",      monogram: "Sl", unit: "pcs",    category: "Sembako", price: 4500,   threshold: 15, warehouseQty: 60, storeQty: 22, stock: 22, soldToday: 6  },
    { id: "RIN071", sku: "RIN071", name: "Rinso 800g",          monogram: "Rn", unit: "bungkus",category: "Sembako", price: 18000,  threshold: 12, warehouseQty: 30, storeQty: 11, stock: 11, soldToday: 4  },
    { id: "MNY081", sku: "MNY081", name: "Minyakita 1L",        monogram: "Mn", unit: "pouch",  category: "Sembako", price: 16000,  threshold: 15, warehouseQty: 8,  storeQty: 9,  stock: 9,  soldToday: 7  },
  ];

  for (const p of productDefs) {
    await db.product.create({ data: { storeId: store.id, active: true, ...p } });
  }

  // --- Helper: today at hh:mm ---
  function today(h: number, m = 0) {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }

  // --- Stock Movements (Riwayat) ---
  await db.stockMovement.createMany({
    data: [
      { storeId: store.id, type: "MASUK",    productId: "TEH015", qty:  48, toLoc: "WAREHOUSE",  byUserId: OWNER_AUTH_ID, createdAt: today(8, 5),   meta: { note: "Manual" } },
      { storeId: store.id, type: "TRANSFER", productId: "RKK051", qty:  40, fromLoc: "WAREHOUSE", toLoc: "STORE", byUserId: aerith.id, createdAt: today(9, 40), meta: {} },
      { storeId: store.id, type: "OPNAME",   productId: "TLR004", qty:  -3, fromLoc: "WAREHOUSE", byUserId: OWNER_AUTH_ID, createdAt: today(10, 52), meta: { note: "Koreksi opname" } },
      { storeId: store.id, type: "RUSAK",    productId: "MNY008", qty:  -2, fromLoc: "WAREHOUSE", byUserId: OWNER_AUTH_ID, createdAt: today(11, 30), meta: { note: "Botol bocor" } },
      { storeId: store.id, type: "TERJUAL",  productId: "MIE003", qty: -24, fromLoc: "STORE",     byUserId: aerith.id, createdAt: today(12, 15), meta: { shift: 2 } },
      { storeId: store.id, type: "MASUK",    productId: "GLA006", qty:  30, toLoc: "WAREHOUSE",  byUserId: OWNER_AUTH_ID, createdAt: today(13, 47), meta: { supplier: "UD Sejahtera", method: "AI scan" } },
      { storeId: store.id, type: "MASUK",    productId: "BRS001", qty:  20, toLoc: "WAREHOUSE",  byUserId: OWNER_AUTH_ID, createdAt: today(13, 48), meta: { supplier: "UD Sejahtera", method: "AI scan" } },
      { storeId: store.id, type: "TRANSFER", productId: "AIR011", qty:  60, fromLoc: "WAREHOUSE", toLoc: "STORE", byUserId: aerith.id, createdAt: today(14, 20), meta: {} },
    ],
  });

  // --- Sales ---
  const salesDefs = [
    { trxId: "#TRX-0006", cashierId: OWNER_AUTH_ID, cashierName: "Anthony D.", shift: 2, paymentMethod: "TUNAI",  cashReceived: 25000,  changeAmount: 500,  total: 24500,  createdAt: today(9, 30)  },
    { trxId: "#TRX-0005", cashierId: OWNER_AUTH_ID, cashierName: "Anthony D.", shift: 2, paymentMethod: "QRIS",   cashReceived: 97000,  changeAmount: 0,    total: 97000,  createdAt: today(10, 48) },
    { trxId: "#TRX-0004", cashierId: OWNER_AUTH_ID, cashierName: "Anthony D.", shift: 2, paymentMethod: "TUNAI",  cashReceived: 220000, changeAmount: 5000, total: 215000, createdAt: today(11, 22) },
    { trxId: "#TRX-0003", cashierId: aerith.id,     cashierName: "Aerith D.", shift: 2, paymentMethod: "TUNAI",  cashReceived: 30000,  changeAmount: 2000, total: 28000,  createdAt: today(13, 41) },
    { trxId: "#TRX-0002", cashierId: aerith.id,     cashierName: "Aerith D.", shift: 2, paymentMethod: "QRIS",   cashReceived: 47500,  changeAmount: 0,    total: 47500,  createdAt: today(14, 18) },
    { trxId: "#TRX-0001", cashierId: aerith.id,     cashierName: "Aerith D.", shift: 2, paymentMethod: "TUNAI",  cashReceived: 170000, changeAmount: 10000,total: 160000, createdAt: today(14, 34) },
  ];

  for (const s of salesDefs) {
    const sale = await db.sale.create({ data: { storeId: store.id, ...s } });

    // Minimal sale items
    if (s.trxId === "#TRX-0001") {
      await db.saleItem.createMany({ data: [
        { saleId: sale.id, productId: "BRS001", productName: "Beras Pandan 5kg", price: 75000, qty: 1, subtotal: 75000 },
        { saleId: sale.id, productId: "MNY008", productName: "Bimoli 2L",         price: 38000, qty: 2, subtotal: 76000 },
        { saleId: sale.id, productId: "AIR011", productName: "Aqua 600ml",        price: 4000,  qty: 3, subtotal: 12000 },
        { saleId: sale.id, productId: "TLR004", productName: "Telur Ayam 1kg",    price: 28000, qty: 1, subtotal: 28000 },
      ]});
    }
  }

  // --- Cash Drawer ---
  await db.cashDrawer.createMany({
    data: [
      { storeId: store.id, entryType: "OPEN",       amount: 500000,  note: "Modal awal shift",                    byUserId: OWNER_AUTH_ID, createdAt: today(14, 0)  },
      { storeId: store.id, entryType: "AUTO_SALES", amount: 2695000, note: "Penjualan tunai otomatis",            byUserId: aerith.id,     createdAt: today(16, 42) },
      { storeId: store.id, entryType: "OUT",         amount: 100000,  note: "Beli es batu · supplier",             byUserId: aerith.id,     createdAt: today(14, 48) },
      { storeId: store.id, entryType: "OUT",         amount: 15000,   note: "Bayar parkir & retribusi · operasional", byUserId: aerith.id, createdAt: today(15, 30) },
    ],
  });

  // --- Activity Logs ---
  await db.activityLog.createMany({
    data: [
      { storeId: store.id, type: "TIER_CHANGED",     byUserId: null,            createdAt: today(10, 0),  meta: { oldTier: "STANDARD", newTier: "PREMIUM" } },
      { storeId: store.id, type: "KASIR_ADDED",      byUserId: OWNER_AUTH_ID,   createdAt: today(10, 5),  meta: { kasirName: "Aerith D." } },
      { storeId: store.id, type: "PAYMENT_RECEIVED", byUserId: null,            createdAt: today(11, 0),  meta: { amount: 150000 } },
      { storeId: store.id, type: "SYNC_RESTORED",    byUserId: null,            createdAt: today(14, 5),  meta: {} },
    ],
  });

  console.log("Done.");
  console.log("Store ID:", store.id);
  console.log("Aerith cashier ID:", aerith.id);
  console.log("Note: set OWNER_AUTH_ID in .env.local to your Supabase auth.users UUID");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
