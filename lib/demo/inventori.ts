// Sample stock data for the Inventori Lengkap add-on demo (Kanso store).

export type InvProduct = {
  sku: string; name: string; category: string; unit: string;
  warehouseQty: number; storeQty: number; threshold: number; price: number;
};

export const INV_PRODUCTS: InvProduct[] = [
  { sku: "KNS-001", name: "Air Force 1 '07", category: "Sepatu", unit: "pasang", warehouseQty: 12, storeQty: 6, threshold: 5, price: 1549000 },
  { sku: "KNS-002", name: "Dunk Low Retro", category: "Sepatu", unit: "pasang", warehouseQty: 3, storeQty: 2, threshold: 5, price: 1429000 },
  { sku: "KNS-003", name: "Air Max 90", category: "Sepatu", unit: "pasang", warehouseQty: 8, storeQty: 5, threshold: 5, price: 1899000 },
  { sku: "KNS-004", name: "Air Jordan 1 Low", category: "Sepatu", unit: "pasang", warehouseQty: 1, storeQty: 1, threshold: 5, price: 1729000 },
  { sku: "KNS-005", name: "Blazer Mid '77", category: "Sepatu", unit: "pasang", warehouseQty: 6, storeQty: 3, threshold: 5, price: 1309000 },
  { sku: "KNS-006", name: "Pegasus 41", category: "Sepatu", unit: "pasang", warehouseQty: 14, storeQty: 8, threshold: 5, price: 1999000 },
  { sku: "KNS-010", name: "AIRism Oversized Tee", category: "Atasan", unit: "pcs", warehouseQty: 40, storeQty: 22, threshold: 10, price: 199900 },
  { sku: "KNS-011", name: "U Crew Neck Tee", category: "Atasan", unit: "pcs", warehouseQty: 55, storeQty: 30, threshold: 10, price: 149900 },
  { sku: "KNS-012", name: "Ultra Light Down Jacket", category: "Outerwear", unit: "pcs", warehouseQty: 8, storeQty: 4, threshold: 5, price: 799900 },
  { sku: "KNS-013", name: "HEATTECH Tee", category: "Inner", unit: "pcs", warehouseQty: 30, storeQty: 18, threshold: 10, price: 149900 },
  { sku: "KNS-014", name: "Slim-Fit Chino Pants", category: "Bawahan", unit: "pcs", warehouseQty: 4, storeQty: 3, threshold: 8, price: 399900 },
  { sku: "KNS-015", name: "Selvedge Slim Jeans", category: "Bawahan", unit: "pcs", warehouseQty: 6, storeQty: 2, threshold: 6, price: 499900 },
];

export type MoveType = "MASUK" | "KELUAR" | "TRANSFER" | "RUSAK";
export type InvMovement = { id: string; type: MoveType; name: string; qty: number; note: string; date: string; by: string };
export const MOVE_META: Record<MoveType, { label: string; color: string; bg: string }> = {
  MASUK:    { label: "Masuk",    color: "#3f7d54", bg: "#e9f1ea" },
  KELUAR:   { label: "Keluar",   color: "#b0492f", bg: "#f6e7e1" },
  TRANSFER: { label: "Transfer", color: "#2a6f78", bg: "#e2f0f1" },
  RUSAK:    { label: "Rusak",    color: "#a5772a", bg: "#f4ecd6" },
};
export const INV_MOVEMENTS: InvMovement[] = [
  { id: "m1", type: "MASUK", name: "Air Force 1 '07", qty: 12, note: "Stok masuk ke gudang", date: "14 Jul · 09.20", by: "Owner" },
  { id: "m2", type: "TRANSFER", name: "AIRism Oversized Tee", qty: 20, note: "Gudang → Toko", date: "14 Jul · 08.55", by: "Owner" },
  { id: "m3", type: "KELUAR", name: "Dunk Low Retro", qty: 2, note: "Penjualan POS", date: "13 Jul · 17.42", by: "Kasir (auto)" },
  { id: "m4", type: "RUSAK", name: "Slim-Fit Chino Pants", qty: 1, note: "Cacat produksi", date: "12 Jul · 14.10", by: "Owner" },
  { id: "m5", type: "MASUK", name: "Pegasus 41", qty: 6, note: "Stok masuk ke gudang", date: "11 Jul · 10.05", by: "Owner" },
  { id: "m6", type: "TRANSFER", name: "U Crew Neck Tee", qty: 15, note: "Gudang → Toko", date: "10 Jul · 09.30", by: "Owner" },
  { id: "m7", type: "KELUAR", name: "Air Max 90", qty: 3, note: "Penjualan POS", date: "10 Jul · 16.20", by: "Kasir (auto)" },
  { id: "m8", type: "MASUK", name: "HEATTECH Tee", qty: 30, note: "Stok masuk ke gudang", date: "8 Jul · 11.15", by: "Owner" },
];

export type OpnameRow = { name: string; sistem: number; hitung: number };
export const INV_OPNAME: OpnameRow[] = [
  { name: "Air Force 1 '07", sistem: 6, hitung: 6 },
  { name: "Dunk Low Retro", sistem: 2, hitung: 1 },
  { name: "AIRism Oversized Tee", sistem: 22, hitung: 24 },
  { name: "Slim-Fit Chino Pants", sistem: 3, hitung: 3 },
  { name: "Air Max 90", sistem: 5, hitung: 4 },
];

export const invStatus = (total: number, threshold: number) => {
  if (total === 0) return { label: "Habis", color: "#b0492f", bg: "#f4e9e4" };
  if (total < threshold) return { label: "Rendah", color: "#a5772a", bg: "#f3ead0" };
  return { label: "Aman", color: "#3f7d54", bg: "#e9f1ea" };
};
export const initials = (name: string) => name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
