// Sample CRM data for the add-on demo — Kanso's customers + loyalty program.
// Pseudo data (privacy), consistent with the Showcase demo store.

export type CrmTier = "Silver" | "Gold" | "Platinum";
export type CrmSegment = "aktif" | "jarang" | "besar";

export type DemoCustomer = {
  id: string; name: string; wa: string; joined: string;
  orders: number; spent: number; points: number;
  tier: CrmTier; segment: CrmSegment; lastVisit: string;
  history: { date: string; item: string; amount: number }[];
};

export const TIER_META: Record<CrmTier, { color: string; bg: string }> = {
  Silver:   { color: "#7a7a86", bg: "#eef0f2" },
  Gold:     { color: "#a5772a", bg: "#f4ecd6" },
  Platinum: { color: "#5b4b8a", bg: "#ece8f5" },
};
export const SEGMENT_META: Record<CrmSegment, { label: string; color: string; bg: string }> = {
  aktif:  { label: "Aktif",         color: "#3f7d54", bg: "#e9f1ea" },
  jarang: { label: "Jarang datang", color: "#a5772a", bg: "#f4ecd6" },
  besar:  { label: "Pembeli besar", color: "#5b4b8a", bg: "#ece8f5" },
};

export const CRM_CUSTOMERS: DemoCustomer[] = [
  { id: "c1", name: "Sarah Wijaya", wa: "0812-3345-1180", joined: "Mar 2025", orders: 14, spent: 8420000, points: 8420, tier: "Platinum", segment: "besar", lastVisit: "2 hari lalu",
    history: [{ date: "12 Jul", item: "Air Jordan 1 Low · 42", amount: 1729000 }, { date: "28 Jun", item: "AIRism Oversized Tee · L", amount: 199900 }, { date: "3 Jun", item: "Air Force 1 '07 · 42", amount: 1549000 }] },
  { id: "c2", name: "Putri Ananda", wa: "0811-2290-4471", joined: "Jan 2025", orders: 18, spent: 9610000, points: 9610, tier: "Platinum", segment: "besar", lastVisit: "kemarin",
    history: [{ date: "13 Jul", item: "Ultra Light Down Jacket · M", amount: 799900 }, { date: "1 Jul", item: "Air Max 90 · 40", amount: 1899000 }] },
  { id: "c3", name: "Citra Dewi", wa: "0813-7781-2093", joined: "Feb 2025", orders: 13, spent: 7130000, points: 7130, tier: "Platinum", segment: "besar", lastVisit: "5 hari lalu",
    history: [{ date: "8 Jul", item: "Blazer Mid '77 · 39", amount: 1309000 }, { date: "20 Jun", item: "Selvedge Jeans · 30", amount: 499900 }] },
  { id: "c4", name: "Budi Santoso", wa: "0857-9921-4408", joined: "Apr 2025", orders: 9, spent: 4210000, points: 4210, tier: "Gold", segment: "aktif", lastVisit: "hari ini",
    history: [{ date: "14 Jul", item: "Air Force 1 '07 · 43", amount: 1549000 }, { date: "2 Jul", item: "U Crew Neck Tee · M", amount: 149900 }] },
  { id: "c5", name: "Rina Kusuma", wa: "0813-2277-6650", joined: "May 2025", orders: 11, spent: 3820000, points: 3820, tier: "Gold", segment: "aktif", lastVisit: "hari ini",
    history: [{ date: "14 Jul", item: "AIRism Tee · L", amount: 199900 }, { date: "5 Jul", item: "Chino Pants · 30", amount: 399900 }] },
  { id: "c6", name: "Maya Sari", wa: "0838-6612-3341", joined: "Mar 2025", orders: 7, spent: 3120000, points: 3120, tier: "Gold", segment: "aktif", lastVisit: "3 hari lalu",
    history: [{ date: "11 Jul", item: "Ultra Light Down Jacket · M", amount: 799900 }] },
  { id: "c7", name: "Nadia Putri", wa: "0852-3390-7752", joined: "Jun 2025", orders: 8, spent: 2940000, points: 2940, tier: "Gold", segment: "aktif", lastVisit: "kemarin",
    history: [{ date: "13 Jul", item: "Oxford Slim Shirt · M", amount: 299900 }, { date: "30 Jun", item: "Pegasus 41 · 41", amount: 1999000 }] },
  { id: "c8", name: "Reza Fauzi", wa: "0821-8843-1120", joined: "Jun 2025", orders: 5, spent: 1620000, points: 1620, tier: "Silver", segment: "aktif", lastVisit: "4 hari lalu",
    history: [{ date: "10 Jul", item: "Dunk Low Retro · 44", amount: 1429000 }] },
  { id: "c9", name: "Bayu Saputra", wa: "0819-2214-8890", joined: "May 2025", orders: 4, spent: 1330000, points: 1330, tier: "Silver", segment: "aktif", lastVisit: "kemarin",
    history: [{ date: "13 Jul", item: "HEATTECH Tee · L", amount: 149900 }] },
  { id: "c10", name: "Andi Pratama", wa: "0821-4410-9002", joined: "Feb 2025", orders: 3, spent: 1210000, points: 1210, tier: "Silver", segment: "jarang", lastVisit: "3 minggu lalu",
    history: [{ date: "22 Jun", item: "U Crew Neck Tee · XL", amount: 149900 }] },
  { id: "c11", name: "Fajar Nugroho", wa: "0812-5540-7781", joined: "Jan 2025", orders: 2, spent: 720000, points: 720, tier: "Silver", segment: "jarang", lastVisit: "1 bulan lalu",
    history: [{ date: "10 Jun", item: "Chino Pants · 32", amount: 399900 }] },
  { id: "c12", name: "Dimas Aryo", wa: "0819-5540-7781", joined: "Apr 2025", orders: 2, spent: 910000, points: 910, tier: "Silver", segment: "jarang", lastVisit: "2 minggu lalu",
    history: [{ date: "1 Jul", item: "Blazer Mid '77 · 41", amount: 1309000 }] },
];

export const rupiahShort = (n: number) => {
  if (n >= 1000000) return "Rp " + (n / 1000000).toFixed(1).replace(".0", "") + " jt";
  if (n >= 1000) return "Rp " + Math.round(n / 1000) + "rb";
  return "Rp " + n;
};

// Loyalty program config (demo)
export const LOYALTY = {
  earn: "Rp 1.000 = 1 poin",
  tiers: [
    { name: "Silver" as CrmTier, threshold: 0, perks: "Poin belanja · notifikasi restok" },
    { name: "Gold" as CrmTier, threshold: 2000, perks: "Semua Silver · gratis ongkir pickup · voucher ulang tahun" },
    { name: "Platinum" as CrmTier, threshold: 6000, perks: "Semua Gold · akses awal drop · hold prioritas" },
  ],
  rewards: [
    { name: "Voucher Rp 25.000", cost: 250 },
    { name: "Voucher Rp 50.000", cost: 500 },
    { name: "Gratis ongkir pickup", cost: 150 },
    { name: "Akses awal drop (member)", cost: 1000 },
  ],
};
