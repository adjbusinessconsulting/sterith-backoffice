# Sterith Backoffice — Developer Handoff

Admin surface for the Prospera POS. This document plus the interactive spec (`Backoffice Inventori.dc.html`) and screenshots in `handoff/screenshots/` is the complete brief.

---

## 1. What to build (this milestone)

Inventori + Manajemen surfaces. Dashboard and Keuangan are **out of scope** — leave them as "Segera hadir" placeholders identical to the design.

### Routes

| Path | Screen | Notes |
| --- | --- | --- |
| `/` → redirect to `/inventori/ringkasan` | | |
| `/dashboard` | Dashboard | Placeholder only |
| `/inventori/ringkasan` | Ringkasan (hero) | KPIs, stock-flow map, low-stock, activity |
| `/inventori/gudang` | Gudang stock table | Warehouse — where stock lives first |
| `/inventori/toko` | Toko stock table | Derived; only mutated by Transfer or POS sales |
| `/inventori/opname` | Stok Opname | Physical count, owner-approval required |
| `/inventori/riwayat` | Riwayat Stok | Audit log |
| `/manajemen/staf` | Staf & Akses | Accounts + shifts |
| `/manajemen/produk` | Produk | POS-mirror card grid |
| `/manajemen/laporan` | Laporan | Riwayat & Kasir tabs |
| `/manajemen/keuangan` | Keuangan | Placeholder only |

Overlays (all as route-parallel dialogs, not separate pages):
- Stok Masuk — method → upload → AI reading → editable review → confirm
- Transfer Gudang → Toko
- Produk edit / Produk baru
- Tambah kasir

Screenshot map in `handoff/screenshots/`:
```
01-ringkasan.png              06-produk.png              11-stok-masuk-upload.png
02-gudang.png                 07-staf-akses.png          12-stok-masuk-ai-reading.png
03-toko.png                   08-laporan-riwayat.png     13-stok-masuk-review.png
04-stok-opname.png            09-laporan-kasir.png       14-transfer-overlay.png
05-riwayat-stok.png           10-stok-masuk-metode.png   15-produk-edit-modal.png
                                                         16-staf-tambah-modal.png
```

---

## 2. Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (customize tokens below)
- Prisma + Postgres (Neon or Supabase)
- NextAuth (email/password for owner + manajer)
- TanStack Query for server state, Zustand for UI overlays
- Anthropic SDK (`@anthropic-ai/sdk`) for the AI receipt scan
- Vercel Blob or Supabase Storage for product photos & invoice uploads

Kasir authentication is **PIN-based inside the POS**, not here. This project treats kasir accounts as records the owner manages; kasirs cannot log into the backoffice.

---

## 3. Design tokens

Follow `Backoffice Inventori.dc.html` exactly — every element there is inline-styled with these values. Extract into Tailwind config and shadcn theme:

```ts
// tailwind.config.ts colors
canvas:   '#eceadf',
surface:  '#f8f6ef',
sidebar:  '#f6f3ea',
card:     '#ffffff',
ink:      '#14203a',
gold:     '#e7c987',
goldDeep: '#b8934a',
goldMute: '#96762f',
muted:    '#8f897a',
muted2:   '#9b9484',
border:   '#e8e3d5',
border2:  '#e6e1d3',
danger:   '#b0492f',
dangerBg: '#f4e9e4',
success:  '#3f7d54',
successBg:'#e9f1ea',
warn:     '#a5772a',
warnBg:   '#f3ead0',
inkChip:  '#f1e7cd',
```

Fonts (Google Fonts):
- `EB Garamond` — headings, numeric cells (use `font-feature-settings: "onum"` for oldstyle figures)
- `Hanken Grotesk` — all UI text

Radii `10–16px`. Density is roomy. **No emoji, no gradient backgrounds.** Numbers in tables and card values use EB Garamond so the oldstyle figures land — that's the "Sterith" signature.

---

## 4. Data model (Prisma sketch)

```prisma
model Business {
  id        String   @id @default(cuid())
  name      String
  location  String
  tier      Tier     @default(PREMIUM)
  users     User[]
  products  Product[]
  shifts    Shift[]
  createdAt DateTime @default(now())
}

enum Tier { FREE STANDARD PREMIUM }

model User {
  id         String   @id @default(cuid())
  businessId String
  business   Business @relation(fields:[businessId], references:[id])
  name       String
  role       Role
  email      String?  @unique   // owner/manajer only
  passwordH  String?             // owner/manajer only
  pinHash    String?             // kasir only
  createdAt  DateTime @default(now())
  deletedAt  DateTime?
}
enum Role { OWNER MANAJER KASIR }

model Product {
  id          String   @id @default(cuid())
  businessId  String
  sku         String
  name        String
  unit        String
  category    String
  price       Int                        // rupiah, integer
  threshold   Int      @default(10)
  photoUrl    String?
  warehouseQty Int     @default(0)       // Gudang
  storeQty    Int      @default(0)       // Toko
  soldToday   Int      @default(0)       // rolling counter (or derive)
  createdAt   DateTime @default(now())
  deletedAt   DateTime?
  @@unique([businessId, sku])
}

model Shift {
  id         String @id @default(cuid())
  businessId String
  name       String       // "Shift 1"
  startTime  String       // "06:00"
  endTime    String       // "14:00"
  assignedId String?
}

model StockMovement {
  id         String   @id @default(cuid())
  businessId String
  type       MvmtType
  productId  String
  qty        Int                          // signed: +in, -out; opname is delta
  fromLoc    Location?                    // WAREHOUSE | STORE | null
  toLoc      Location?
  byUserId   String
  meta       Json?                        // supplier, invoice ref, notes, etc.
  createdAt  DateTime @default(now())
}
enum MvmtType { MASUK TRANSFER TERJUAL RUSAK OPNAME }
enum Location { WAREHOUSE STORE }

model Opname {
  id          String   @id @default(cuid())
  businessId  String
  location    Location
  status      OpnameStatus @default(DRAFT)
  createdById String
  approvedById String?
  createdAt   DateTime @default(now())
  approvedAt  DateTime?
  lines       OpnameLine[]
}
enum OpnameStatus { DRAFT PENDING APPROVED }

model OpnameLine {
  id         String @id @default(cuid())
  opnameId   String
  opname     Opname @relation(fields:[opnameId], references:[id])
  productId  String
  systemQty  Int
  physicalQty Int
}

model Transaction {
  id         String   @id @default(cuid())
  businessId String
  no         String                       // "#TRX-0001"
  kasirId    String
  shiftId    String?
  method     PayMethod                    // TUNAI | QRIS
  total      Int
  items      Json                         // [{productId, name, qty, price}]
  createdAt  DateTime @default(now())
}
enum PayMethod { TUNAI QRIS }

model CashDrawer {
  id         String   @id @default(cuid())
  businessId String
  entryType  CashType                     // OPEN | IN | OUT | AUTO_SALES | CLOSE
  amount     Int
  note       String?
  byUserId   String
  shiftId    String?
  createdAt  DateTime @default(now())
}
enum CashType { OPEN IN OUT AUTO_SALES CLOSE }
```

**Invariants** (enforce with DB transactions):
- Every stock mutation writes a `StockMovement`. That table is the audit log for Riwayat.
- `Transfer` = one txn, two movements or one movement with `fromLoc=WAREHOUSE, toLoc=STORE`. Decrement `warehouseQty`, increment `storeQty`.
- `Terjual` = movement with `fromLoc=STORE, qty` negative on store. Written by the POS, not the backoffice.
- `Opname` approval writes one `StockMovement` per changed line with `type=OPNAME, meta:{ opnameId, systemBefore, physicalAfter }`.

---

## 5. API endpoints

REST via Next.js route handlers (`/app/api/**/route.ts`). All auth-guarded; the current user's `businessId` scopes every query. Return camelCase JSON.

```
GET    /api/products?q=&cat=&location=warehouse|store
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
POST   /api/products/:id/photo         (multipart)

POST   /api/stock/masuk                 body: { supplier, items:[{productId?|name, qty, price, sku?}] }
POST   /api/stock/transfer              body: { items:[{productId, qty}] }
POST   /api/stock/damage                body: { productId, qty, location, note }

POST   /api/opname                       body: { location, lines:[{productId, physicalQty}] }
POST   /api/opname/:id/approve

GET    /api/movements?type=&from=&to=&kasirId=&location=&limit=&cursor=
GET    /api/movements/export.csv

GET    /api/staff
POST   /api/staff                         body: { name, role, pin?|password? }
DELETE /api/staff/:id

GET    /api/shifts
POST   /api/shifts
PATCH  /api/shifts/:id
DELETE /api/shifts/:id

GET    /api/reports/summary?date=          (KPI strip)
GET    /api/reports/transactions?date=&shiftId=&kasirId=&method=
GET    /api/reports/cash?date=&kasirId=

POST   /api/ai/scan-receipt                (multipart: image)
  → 200 { supplier, invoiceNo?, lines:[{name, qty, unitPrice, skuGuess?}] }
```

---

## 6. AI receipt scan

Call Claude Sonnet 4.5 (or Haiku 4.5 for cost — spec calls it Haiku 4.5) with vision. Server-side only; never expose the API key.

```ts
// /app/api/ai/scan-receipt/route.ts (sketch)
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();

const SYSTEM = `Kamu membaca faktur/struk supplier untuk toko sembako di Indonesia.
Kembalikan JSON dengan schema: {supplier, invoiceNo, lines:[{name, qty, unitPrice}]}.
Harga dalam rupiah (integer, tanpa titik). Jangan tebak jika tidak yakin — kosongkan.`;

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("image") as File;
  const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2048,
    system: SYSTEM,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: file.type, data: b64 }},
        { type: "text", text: "Ekstrak faktur ini. Balas hanya JSON valid, tanpa penjelasan." }
      ]
    }]
  });
  const json = JSON.parse(msg.content[0].text);
  // Fuzzy-match line.name → existing Product.sku (Fuse.js or trigram)
  return Response.json(json);
}
```

Show a live-progress state on the frontend while the request is in flight (see `12-stok-masuk-ai-reading.png`). Do **not** stream; a spinner + progress bar is enough. Ask the user to review before it commits (see `13-stok-masuk-review.png`).

Only OWNER can approve a stok masuk (matches the pricing MD: owner-level permission required to approve).

---

## 7. Permissions

| Action | Owner | Manajer | Kasir |
| --- | --- | --- | --- |
| View Ringkasan | ✓ | ✓ | — |
| Edit/create products | ✓ | ✓ | — |
| Stok Masuk (approve) | ✓ | — | — |
| Transfer Gudang → Toko | ✓ | ✓ | — |
| Approve Opname | ✓ | — | — |
| Manage staff & shifts | ✓ | — | — |
| View Laporan | ✓ | ✓ | own shift only |
| POS transactions | ✓ | ✓ | ✓ |

Kasirs use the POS only (not this project).

---

## 8. Seed script

`prisma/seed.ts` should mirror the data in the design so screenshots are reproducible:

- 1 business: "Toko Sembako Maju" (Palu Timur), Premium tier
- 3 users: Anthony D. (owner), Aerith D. (kasir, Shift 2), Stevany Carolin (kasir, Shift 3)
- 3 shifts: Shift 1 06:00–14:00, Shift 2 14:00–22:00, Shift 3 22:00–06:00
- 16 products across Sembako / Minuman / Snack / Rokok. The `renderVals` block in the .dc.html has the full list — copy the array verbatim.
- 6 sample transactions matching `08-laporan-riwayat.png`
- A cash-drawer session matching `09-laporan-kasir.png`

---

## 9. Build order

1. Scaffold + Tailwind + shadcn + Prisma + NextAuth + Anthropic SDK
2. Sidebar shell + top strip + placeholder pages
3. Ringkasan (read-only against seed data)
4. Gudang + Toko tables (read-only)
5. Produk grid + edit modal (full CRUD)
6. Stok Masuk manual flow (no AI yet) → wire AI
7. Transfer overlay
8. Stok Opname
9. Riwayat Stok (paginated)
10. Staf & Akses + shift editor
11. Laporan Riwayat + Kasir
12. Photo upload wiring, CSV export, polish

Every stock write goes through a single `recordMovement(tx, {...})` helper so the audit log stays consistent.

---

## 10. Reference files

- `Backoffice Inventori.dc.html` — the interactive spec. Open it in a browser; every screen is clickable.
- `support.js` — its runtime (ships with the .dc.html so it opens locally).
- `assets/sterith-mark.png`, `assets/sterith-horizontal-light.png` — logo.
- `uploads/prospera-pos-pricing.md` — product/pricing rules, inventory model, AI scan definition, tiers.
- POS visual references: `uploads/01-owner-login.png`, `02-kasir-pin-login.png`, `03-sales-jual.png`, `06-produk.png`, `07-laporan-riwayat.png`, `08-laporan-kasir-uang-kas.png`, `09-pindah-shift.png`. **The backoffice Produk and Laporan screens must match these POS screens 1:1.**

Copy visual details from the .dc.html rather than approximating — every spacing, radius, and font weight is intentional.
