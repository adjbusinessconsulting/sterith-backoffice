import { PrismaClient, Role, MvmtType, Location, PayMethod, CashType, ActivityType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding…");

  // --- Master Office admin (no businessId) ---
  const masterPw = await bcrypt.hash("MasterAdmin2024!", 10);
  await db.user.create({
    data: {
      businessId: null,
      name: "Rizki Ramadhani",
      role: Role.MASTER_ADMIN,
      email: "rizki@sterith.com",
      passwordH: masterPw,
    },
  });

  // --- Business ---
  const biz = await db.business.create({
    data: {
      clientCode: "PLU-001",
      name: "Toko Sembako Maju",
      location: "Palu Timur",
      phone: "081234567890",
      tier: "PREMIUM",
      syncedAt: new Date(),
    },
  });

  // --- Users ---
  const ownerPw = await bcrypt.hash("Sterith2024!", 10);
  const aerithPin = await bcrypt.hash("1234", 10);
  const stevanyPin = await bcrypt.hash("5678", 10);

  const owner = await db.user.create({
    data: {
      businessId: biz.id,
      name: "Anthony D.",
      role: Role.OWNER,
      email: "adjbusinessconsulting@gmail.com",
      passwordH: ownerPw,
    },
  });

  const aerith = await db.user.create({
    data: {
      businessId: biz.id,
      name: "Aerith D.",
      role: Role.KASIR,
      pinHash: aerithPin,
    },
  });

  const stevany = await db.user.create({
    data: {
      businessId: biz.id,
      name: "Stevany Carolin",
      role: Role.KASIR,
      pinHash: stevanyPin,
    },
  });

  // --- Shifts ---
  const shift1 = await db.shift.create({
    data: { businessId: biz.id, name: "Shift 1", startTime: "06:00", endTime: "14:00" },
  });
  const shift2 = await db.shift.create({
    data: {
      businessId: biz.id,
      name: "Shift 2",
      startTime: "14:00",
      endTime: "22:00",
      assignedId: aerith.id,
    },
  });
  const shift3 = await db.shift.create({
    data: {
      businessId: biz.id,
      name: "Shift 3",
      startTime: "22:00",
      endTime: "06:00",
      assignedId: stevany.id,
    },
  });
  void shift1; void shift3;

  // --- Products ---
  const productDefs = [
    { sku: "BRS001", name: "Beras Pandan 5kg",   unit: "karung", category: "Sembako", price: 75000,  threshold: 20, warehouseQty: 42, storeQty: 40, soldToday: 6  },
    { sku: "MNY008", name: "Bimoli 2L",           unit: "botol",  category: "Sembako", price: 38000,  threshold: 20, warehouseQty: 18, storeQty: 24, soldToday: 4  },
    { sku: "SSU012", name: "Susu Bendera 1L",     unit: "botol",  category: "Sembako", price: 22000,  threshold: 12, warehouseQty: 5,  storeQty: 3,  soldToday: 5  },
    { sku: "MIE003", name: "Indomie Goreng",      unit: "pcs",    category: "Snack",   price: 3500,   threshold: 60, warehouseQty: 300,storeQty: 128,soldToday: 40 },
    { sku: "AIR011", name: "Aqua 600ml",          unit: "botol",  category: "Minuman", price: 4000,   threshold: 50, warehouseQty: 240,storeQty: 64, soldToday: 30 },
    { sku: "TLR004", name: "Telur Ayam 1kg",      unit: "kg",     category: "Sembako", price: 28000,  threshold: 12, warehouseQty: 20, storeQty: 6,  soldToday: 5  },
    { sku: "GLA006", name: "Gula Pasir 1kg",      unit: "plastik",category: "Sembako", price: 14500,  threshold: 12, warehouseQty: 52, storeQty: 8,  soldToday: 9  },
    { sku: "TEH015", name: "Teh Pucuk 350ml",     unit: "botol",  category: "Minuman", price: 5000,   threshold: 40, warehouseQty: 180,storeQty: 52, soldToday: 22 },
    { sku: "KOP021", name: "Kopi Kapal Api",      unit: "renceng",category: "Minuman", price: 12000,  threshold: 20, warehouseQty: 90, storeQty: 24, soldToday: 8  },
    { sku: "MIE022", name: "Mie Sedaap Soto",     unit: "pcs",    category: "Snack",   price: 3200,   threshold: 60, warehouseQty: 260,storeQty: 96, soldToday: 28 },
    { sku: "KEC031", name: "Kecap Bango 220ml",   unit: "botol",  category: "Sembako", price: 9500,   threshold: 10, warehouseQty: 14, storeQty: 0,  soldToday: 3  },
    { sku: "KRP041", name: "Kerupuk Udang",       unit: "bungkus",category: "Snack",   price: 6000,   threshold: 15, warehouseQty: 40, storeQty: 18, soldToday: 5  },
    { sku: "RKK051", name: "Rokok Sampoerna",     unit: "bungkus",category: "Rokok",   price: 28000,  threshold: 30, warehouseQty: 120,storeQty: 34, soldToday: 18 },
    { sku: "SBN061", name: "Sabun Lifebuoy",      unit: "pcs",    category: "Sembako", price: 4500,   threshold: 15, warehouseQty: 60, storeQty: 22, soldToday: 6  },
    { sku: "RIN071", name: "Rinso 800g",          unit: "bungkus",category: "Sembako", price: 18000,  threshold: 12, warehouseQty: 30, storeQty: 11, soldToday: 4  },
    { sku: "MNY081", name: "Minyakita 1L",        unit: "pouch",  category: "Sembako", price: 16000,  threshold: 15, warehouseQty: 8,  storeQty: 9,  soldToday: 7  },
  ];

  const products: Record<string, string> = {};
  for (const p of productDefs) {
    const created = await db.product.create({ data: { businessId: biz.id, ...p } });
    products[p.sku] = created.id;
  }

  // --- Helper: date today at specific hour:min ---
  function today(h: number, m = 0) {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }

  // --- Stock Movements (for Riwayat) ---
  const movements = [
    { type: MvmtType.MASUK,    productId: products.TEH015, qty:  48, fromLoc: null,             toLoc: Location.WAREHOUSE, byUserId: owner.id,   createdAt: today(8, 5),  meta: { note: "Manual" } },
    { type: MvmtType.TRANSFER, productId: products.RKK051, qty:  40, fromLoc: Location.WAREHOUSE, toLoc: Location.STORE,     byUserId: aerith.id,  createdAt: today(9, 40), meta: {} },
    { type: MvmtType.OPNAME,   productId: products.TLR004, qty:  -3, fromLoc: Location.WAREHOUSE, toLoc: null,               byUserId: owner.id,   createdAt: today(10, 52), meta: { note: "Koreksi opname" } },
    { type: MvmtType.RUSAK,    productId: products.MNY008, qty:  -2, fromLoc: Location.WAREHOUSE, toLoc: null,               byUserId: owner.id,   createdAt: today(11, 30), meta: { note: "Botol bocor" } },
    { type: MvmtType.TERJUAL,  productId: products.MIE003, qty: -24, fromLoc: Location.STORE,     toLoc: null,               byUserId: aerith.id,  createdAt: today(12, 15), meta: { shift: "Shift 2" } },
    { type: MvmtType.MASUK,    productId: products.GLA006, qty:  30, fromLoc: null,             toLoc: Location.WAREHOUSE, byUserId: owner.id,   createdAt: today(13, 47), meta: { supplier: "UD Sejahtera", method: "AI scan" } },
    { type: MvmtType.MASUK,    productId: products.BRS001, qty:  20, fromLoc: null,             toLoc: Location.WAREHOUSE, byUserId: owner.id,   createdAt: today(13, 48), meta: { supplier: "UD Sejahtera", method: "AI scan" } },
    { type: MvmtType.TRANSFER, productId: products.AIR011, qty:  60, fromLoc: Location.WAREHOUSE, toLoc: Location.STORE,     byUserId: aerith.id,  createdAt: today(14, 20), meta: {} },
  ];

  for (const mv of movements) {
    await db.stockMovement.create({ data: { businessId: biz.id, ...mv } });
  }

  // --- Transactions ---
  const trxDefs = [
    {
      no: "#TRX-0006", kasirId: owner.id, shiftId: shift2.id, method: PayMethod.TUNAI, total: 24500,
      createdAt: today(9, 30),
      items: [{ name: "Kecap Bango 220ml", qty: 1, price: 9500 }, { name: "Teh Pucuk 350ml", qty: 3, price: 5000 }],
    },
    {
      no: "#TRX-0005", kasirId: owner.id, shiftId: shift2.id, method: PayMethod.QRIS, total: 97000,
      createdAt: today(10, 48),
      items: [{ name: "Bimoli 2L", qty: 2, price: 38000 }, { name: "Indomie Goreng", qty: 6, price: 3500 }],
    },
    {
      no: "#TRX-0004", kasirId: owner.id, shiftId: shift2.id, method: PayMethod.TUNAI, total: 215000,
      createdAt: today(11, 22),
      items: [
        { name: "Beras Pandan 5kg", qty: 1, price: 75000 },
        { name: "Gula Pasir 1kg", qty: 2, price: 14500 },
        { name: "Aqua 600ml", qty: 4, price: 4000 },
        { name: "Indomie Goreng", qty: 4, price: 3500 },
      ],
    },
    {
      no: "#TRX-0003", kasirId: aerith.id, shiftId: shift2.id, method: PayMethod.TUNAI, total: 28000,
      createdAt: today(13, 41),
      items: [{ name: "Telur Ayam 1kg", qty: 1, price: 28000 }],
    },
    {
      no: "#TRX-0002", kasirId: aerith.id, shiftId: shift2.id, method: PayMethod.QRIS, total: 47500,
      createdAt: today(14, 18),
      items: [{ name: "Bimoli 2L", qty: 1, price: 38000 }, { name: "Kecap Bango 220ml", qty: 1, price: 9500 }],
    },
    {
      no: "#TRX-0001", kasirId: aerith.id, shiftId: shift2.id, method: PayMethod.TUNAI, total: 160000,
      createdAt: today(14, 34),
      items: [
        { name: "Beras Pandan 5kg", qty: 1, price: 75000 },
        { name: "Bimoli 2L", qty: 2, price: 38000 },
        { name: "Aqua 600ml", qty: 3, price: 4000 },
        { name: "Telur Ayam 1kg", qty: 1, price: 28000 },
      ],
    },
  ];

  for (const t of trxDefs) {
    await db.transaction.create({ data: { businessId: biz.id, ...t } });
  }

  // --- Cash Drawer ---
  // saldo = (500000 + 2695000) - (100000 + 15000) = 3080000
  const cashDefs = [
    { entryType: CashType.OPEN,       amount: 500000,  note: "Modal awal shift",              byUserId: owner.id,  shiftId: shift2.id, createdAt: today(14, 0)  },
    { entryType: CashType.AUTO_SALES, amount: 2695000, note: "Penjualan tunai otomatis",       byUserId: aerith.id, shiftId: shift2.id, createdAt: today(16, 42) },
    { entryType: CashType.OUT,        amount: 100000,  note: "Beli es batu · supplier",        byUserId: aerith.id, shiftId: shift2.id, createdAt: today(14, 48) },
    { entryType: CashType.OUT,        amount: 15000,   note: "Bayar parkir & retribusi · operasional", byUserId: aerith.id, shiftId: shift2.id, createdAt: today(15, 30) },
  ];

  for (const c of cashDefs) {
    await db.cashDrawer.create({ data: { businessId: biz.id, ...c } });
  }

  // --- Activity Logs (for Master Office timeline) ---
  const activityDefs = [
    { type: ActivityType.TIER_CHANGED,      byUserId: null,      createdAt: today(10, 0),  meta: { oldTier: "STANDARD", newTier: "PREMIUM" } },
    { type: ActivityType.KASIR_ADDED,       byUserId: owner.id,  createdAt: today(10, 5),  meta: { kasirName: "Aerith D." } },
    { type: ActivityType.PAYMENT_RECEIVED,  byUserId: null,      createdAt: today(11, 0),  meta: { amount: 150000, period: "Juli 2026" } },
    { type: ActivityType.SYNC_RESTORED,     byUserId: null,      createdAt: today(14, 5),  meta: {} },
  ];
  for (const a of activityDefs) {
    await db.activityLog.create({ data: { businessId: biz.id, ...a } });
  }

  console.log("Done. Business:", biz.id);
  console.log("Master admin: rizki@sterith.com / MasterAdmin2024!");
  console.log("Owner:", owner.email, "/ password: Sterith2024!");
  console.log("Aerith PIN: 1234  |  Stevany PIN: 5678");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
