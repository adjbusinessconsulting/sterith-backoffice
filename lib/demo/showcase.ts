// Sample catalog for the Showcase add-on demo. A lifestyle boutique ("Kanso")
// that resells Uniqlo apparel + Nike sneakers — realistic product names/prices/
// sizes so the demo reads as a real store. Photos are royalty-free Unsplash
// model/lookbook shots (free for commercial use), never rehosted brand catalog photos.

export type DemoSize = { size: string; stock: number };
export type DemoTag = "drop" | "restock" | "member";
export type DemoProduct = {
  id: string;
  brand: "Uniqlo" | "Nike";
  name: string;
  dept: "apparel" | "footwear";
  category: string;
  price: number;
  sizes: DemoSize[];
  tag?: DemoTag;
  image: string; // royalty-free Unsplash lookbook photo
};

export const SHOWCASE_DEMO_STORE = "Kanso Lifestyle";

// Unsplash lookbook photo → sized/optimized URL.
const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=700&q=70&auto=format&fit=crop`;

export const SHOWCASE_DEMO: DemoProduct[] = [
  // ── Apparel — Uniqlo (model lookbook shots) ───────────────────────
  { id: "u1", brand: "Uniqlo", name: "AIRism Cotton Oversized T-Shirt", dept: "apparel", category: "Atasan", price: 199900, tag: "restock",
    image: img("1521572163474-6864f9cf17ab"),
    sizes: [{ size: "S", stock: 2 }, { size: "M", stock: 0 }, { size: "L", stock: 5 }, { size: "XL", stock: 3 }] },
  { id: "u2", brand: "Uniqlo", name: "U Crew Neck Short-Sleeve T-Shirt", dept: "apparel", category: "Atasan", price: 149900,
    image: img("1622445275463-afa2ab738c34"),
    sizes: [{ size: "S", stock: 6 }, { size: "M", stock: 4 }, { size: "L", stock: 2 }, { size: "XL", stock: 1 }] },
  { id: "u3", brand: "Uniqlo", name: "Ultra Light Down Jacket", dept: "apparel", category: "Outerwear", price: 799900,
    image: img("1661181475147-bbd20ef65781"),
    sizes: [{ size: "S", stock: 1 }, { size: "M", stock: 2 }, { size: "L", stock: 0 }, { size: "XL", stock: 1 }] },
  { id: "u4", brand: "Uniqlo", name: "HEATTECH Crew Neck T-Shirt", dept: "apparel", category: "Inner", price: 149900,
    image: img("1622445272461-c6580cab8755"),
    sizes: [{ size: "S", stock: 8 }, { size: "M", stock: 5 }, { size: "L", stock: 4 }, { size: "XL", stock: 2 }] },
  { id: "u5", brand: "Uniqlo", name: "Slim-Fit Chino Pants", dept: "apparel", category: "Bawahan", price: 399900,
    image: img("1574180566232-aaad1b5b8450"),
    sizes: [{ size: "28", stock: 3 }, { size: "30", stock: 5 }, { size: "32", stock: 2 }, { size: "34", stock: 1 }] },
  { id: "u6", brand: "Uniqlo", name: "Selvedge Slim-Fit Jeans", dept: "apparel", category: "Bawahan", price: 499900,
    image: img("1576417677416-6ca3adfb5435"),
    sizes: [{ size: "30", stock: 2 }, { size: "32", stock: 0 }, { size: "34", stock: 1 }] },
  { id: "u7", brand: "Uniqlo", name: "Oxford Slim-Fit Shirt", dept: "apparel", category: "Atasan", price: 299900,
    image: img("1586790170083-2f9ceadc732d"),
    sizes: [{ size: "S", stock: 2 }, { size: "M", stock: 3 }, { size: "L", stock: 2 }, { size: "XL", stock: 0 }] },

  // ── Sneakers — Nike (on-feet lookbook shots) ──────────────────────
  { id: "n1", brand: "Nike", name: "Air Force 1 '07", dept: "footwear", category: "Sepatu", price: 1549000, tag: "restock",
    image: img("1626379616459-b2ce1d9decbc"),
    sizes: [{ size: "40", stock: 2 }, { size: "41", stock: 0 }, { size: "42", stock: 0 }, { size: "43", stock: 1 }, { size: "44", stock: 3 }] },
  { id: "n2", brand: "Nike", name: "Dunk Low Retro", dept: "footwear", category: "Sepatu", price: 1429000, tag: "drop",
    image: img("1463100099107-aa0980c362e6"),
    sizes: [{ size: "40", stock: 0 }, { size: "41", stock: 1 }, { size: "42", stock: 0 }, { size: "43", stock: 0 }, { size: "44", stock: 2 }] },
  { id: "n3", brand: "Nike", name: "Air Max 90", dept: "footwear", category: "Sepatu", price: 1899000,
    image: img("1562105962-2fbaaf107fe3"),
    sizes: [{ size: "40", stock: 3 }, { size: "41", stock: 2 }, { size: "42", stock: 4 }, { size: "43", stock: 1 }, { size: "44", stock: 2 }] },
  { id: "n4", brand: "Nike", name: "Air Jordan 1 Low", dept: "footwear", category: "Sepatu", price: 1729000, tag: "member",
    image: img("1626379625260-7111605463e8"),
    sizes: [{ size: "40", stock: 0 }, { size: "41", stock: 0 }, { size: "42", stock: 1 }, { size: "43", stock: 0 }, { size: "44", stock: 0 }] },
  { id: "n5", brand: "Nike", name: "Blazer Mid '77 Vintage", dept: "footwear", category: "Sepatu", price: 1309000,
    image: img("1633303518517-60c15527ebdc"),
    sizes: [{ size: "40", stock: 2 }, { size: "41", stock: 3 }, { size: "42", stock: 1 }, { size: "43", stock: 2 }, { size: "44", stock: 0 }] },
  { id: "n6", brand: "Nike", name: "Pegasus 41", dept: "footwear", category: "Sepatu", price: 1999000,
    image: img("1726279243973-e7323b28cf6a"),
    sizes: [{ size: "40", stock: 5 }, { size: "41", stock: 4 }, { size: "42", stock: 6 }, { size: "43", stock: 3 }, { size: "44", stock: 2 }] },
];

export const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
export const totalStock = (p: DemoProduct) => p.sizes.reduce((s, x) => s + x.stock, 0);

export const TAG_META: Record<DemoTag, { label: string; color: string; bg: string }> = {
  drop:    { label: "DROP",        color: "#b0492f", bg: "#f6e7e1" },
  restock: { label: "RESTOCK",     color: "#a5772a", bg: "#f4ecd6" },
  member:  { label: "MEMBER ONLY", color: "#5b4b8a", bg: "#ece8f5" },
};

export const productById = (id: string) => SHOWCASE_DEMO.find((p) => p.id === id);

// ── Reservasi (hold / order-ahead / drop) demo ──────────────────────
export type ResvKind = "hold" | "order" | "drop";
export type ResvStatus = "menunggu" | "siap" | "selesai" | "kadaluarsa";
export type DemoReservation = {
  id: string; customer: string; wa: string; productId: string; size: string;
  kind: ResvKind; status: ResvStatus; note: string;
};

export const RESV_KIND_META: Record<ResvKind, { label: string; color: string; bg: string }> = {
  hold:  { label: "Hold Item",   color: "#5b4b8a", bg: "#ece8f5" },
  order: { label: "Order-ahead", color: "#2a6f78", bg: "#e2f0f1" },
  drop:  { label: "Drop",        color: "#b0492f", bg: "#f6e7e1" },
};
export const RESV_STATUS_META: Record<ResvStatus, { label: string; color: string; bg: string }> = {
  menunggu:   { label: "Menunggu",     color: "#a5772a", bg: "#f4ecd6" },
  siap:       { label: "Siap diambil", color: "#3f7d54", bg: "#e9f1ea" },
  selesai:    { label: "Selesai",      color: "#8f897a", bg: "#f0ece3" },
  kadaluarsa: { label: "Kadaluarsa",   color: "#b0492f", bg: "#f6e7e1" },
};

export const SHOWCASE_RESERVATIONS: DemoReservation[] = [
  { id: "r1", customer: "Sarah Wijaya",  wa: "0812-3345-1180", productId: "n4", size: "42", kind: "drop",  status: "menunggu",   note: "Air Jordan 1 · member drop · hold s/d besok 17.00" },
  { id: "r2", customer: "Budi Santoso",  wa: "0857-9921-4408", productId: "n1", size: "43", kind: "hold",  status: "siap",       note: "Sudah disiapkan — tinggal diambil di toko" },
  { id: "r3", customer: "Rina Kusuma",   wa: "0813-2277-6650", productId: "u1", size: "L",  kind: "order", status: "menunggu",   note: "Order-ahead · ambil sore ini" },
  { id: "r4", customer: "Andi Pratama",  wa: "0821-4410-9002", productId: "n2", size: "44", kind: "drop",  status: "menunggu",   note: "Dunk Low drop · Jumat 20.00" },
  { id: "r5", customer: "Maya Sari",     wa: "0838-6612-3341", productId: "u3", size: "M",  kind: "hold",  status: "selesai",    note: "Sudah diambil 2 hari lalu" },
  { id: "r6", customer: "Dimas Aryo",    wa: "0819-5540-7781", productId: "n5", size: "41", kind: "hold",  status: "kadaluarsa", note: "Lewat batas waktu — item dilepas kembali" },
];

// Restock waitlist (for the Drops page later): who's waiting on which size.
export const SHOWCASE_WAITLIST: { productId: string; size: string; count: number }[] = [
  { productId: "n1", size: "42", count: 8 },
  { productId: "n1", size: "41", count: 5 },
  { productId: "u1", size: "M", count: 6 },
  { productId: "u7", size: "XL", count: 3 },
  { productId: "n2", size: "40", count: 4 },
];
