# Prospera POS — Complete Product & Pricing Documentation

## Brand
**Name:** Prospera Business Consulting
**Product:** Prospera POS

---

## Tier Structure Overview

4 tiers: **Free / Standard / Premium / Enterprise**

**Pricing philosophy:**
- Launch prices are temporary early-bird pricing to drive adoption
- Regular prices kick in after a defined milestone (date TBD)
- Enterprise is Contact Sales only — not publicly priced

---

## FREE TIER

**Price:** Rp 0 (forever free)

**Target user:** Tiny warung, single owner, just starting out digitally

**Receipt branding:** Prospera watermark on all receipts, cannot be removed

| Feature | Status |
|---|---|
| Payment Methods | ✓ All (Tunai, QRIS, Debit, E-Wallet, Transfer) |
| Shift Management | ✓ Full Pindah Shift + Tutup Toko flows |
| Product Catalog | ✓ Unlimited products |
| Laporan | ✓ Daily total summary only (total transactions + total revenue). No per-shift, per-payment-method, or per-kasir breakdown |
| Transaction History | ✓ 1 day only — expires next day at 23:59, permanently deleted after |
| Export Reports | ✗ Not available |
| Low Stock Alerts | ✗ Not available |
| Photo on Cash Movement | ✗ Not available |
| Hutang (store credit) | ✗ Not available |
| WhatsApp Receipt Sharing | ✗ Not available |
| Custom Receipt Branding | ✗ Not available |
| Backoffice | ✗ Not available |
| AI Features | 🔲 TBD |

**Upgrade pressure points:** No export, no full Laporan breakdown, very short history window, no Hutang, no WhatsApp sharing

---

## STANDARD TIER

**Price:**
- Launch (early bird): **Rp 50.000/month**
- Regular: **Rp 100.000/month**

**Target user:** Warung serius — a growing single-outlet owner who needs proper records and customer-friendly features

**Receipt branding:** Owner's own logo on receipt, but "Powered by Prospera Business Consulting" text remains at the bottom. Cannot be fully removed at this tier.

| Feature | Status |
|---|---|
| Payment Methods | ✓ All |
| Shift Management | ✓ Full Pindah Shift + Tutup Toko flows |
| Product Catalog | ✓ Unlimited products |
| Laporan | ✓ Full breakdown (per shift, per payment method, per kasir) |
| Transaction History | ✓ 3 days — expires at 23:59 on the 3rd day |
| Export Reports | ✓ Available |
| Photo on Cash Movement | ✓ Available |
| Hutang (store credit) | ✓ Available |
| WhatsApp Receipt Sharing | ✓ Available |
| Custom Receipt Branding | ✓ Owner logo yes — "Powered by Prospera Business Consulting" stays |
| Low Stock Alerts | ✗ Not available |
| Backoffice | ✗ Not available |
| AI Features | 🔲 TBD |

**Competitive note:** Cheapest paid tier in the Indonesian POS market. Kasir Pintar Pro (closest competitor) starts at Rp 55rb with more limited features.

---

## PREMIUM TIER

**Price:**
- Launch (early bird): **Rp 150.000/month**
- Regular: **Rp 200.000/month**

**Target user:** Inventory-serious owner who needs to track stock properly and manage staff access to Backoffice

**Receipt branding:** Same as Standard — own logo, "Powered by Prospera Business Consulting" stays

| Feature | Status |
|---|---|
| Payment Methods | ✓ All |
| Shift Management | ✓ Full Pindah Shift + Tutup Toko flows |
| Product Catalog | ✓ Unlimited products |
| Laporan | ✓ Full breakdown (per shift, per payment method, per kasir) |
| Transaction History | ✓ 1 month |
| Export Reports | ✓ Available |
| Photo on Cash Movement | ✓ Available |
| Hutang (store credit) | ✓ Available |
| WhatsApp Receipt Sharing | ✓ Available |
| Custom Receipt Branding | ✓ Owner logo yes — "Powered by Prospera Business Consulting" stays |
| Low Stock Alerts | ✓ Available (tied to inventory system) |
| Backoffice | ✓ Full access with multi-account + permissions system |
| Inventory Management | ✓ Full Warehouse + Store system with AI receipt scan |
| AI Features | 🔲 TBD (AI receipt scan for Stock In confirmed) |

---

### Backoffice Account & Permission System (Premium+)

- 1 owner account created by default, tied to the purchase email
- Owner can create additional Backoffice accounts for staff
- Owner assigns specific permissions per account (e.g. one staff can only do warehouse transfers, not see full reports)
- Permission system is granular — owner controls exactly what each account can and cannot do

---

### Inventory Management System (Premium+)

**Two-level inventory structure:**

#### Level 1 — Warehouse Inventory
This is where all stock first enters the business.

**Stock In methods:**
- Manual entry by owner or permitted staff
- AI receipt scan — owner photographs supplier invoice/receipt, Claude AI reads it and auto-fills product names, quantities, and prices

**Stock Out categories:**
- Transfer to Store (Warehouse Out = Store In, real-time sync)
- Damaged / Lost (separate category, still deducts from Warehouse stock)

#### Level 2 — Store Inventory
Operational stock that the POS uses day-to-day.

**Stock In:** Only via transfer from Warehouse

**Stock Out categories:**
- Sold — auto-deducted when a POS transaction completes (real-time)
- Damaged / Lost (separate category)

#### Full Stock Flow
```
Supplier → Warehouse Stock In (manual or AI scan)
Warehouse → Store Transfer (owner or permitted staff only)
Store → POS Sale (auto deduct, real-time)
```

#### Stock Opname
- Owner or permitted staff does a physical manual count
- System shows discrepancy (system quantity vs physical count)
- Owner reviews and approves which number becomes the real stock
- Requires owner-level permission to approve

#### AI in Inventory
- Powered by **Claude Haiku 4.5**
- Use case: reads supplier receipt photos and auto-fills Stock In data
- Cost to Prospera: negligible — under Rp 1 per scan, under $1/month at UMKM scale

---

## ENTERPRISE TIER

**Price:** Contact Sales (no public price)

**Target user:** Multi-outlet chains, franchises, businesses with multiple separate entities that need centralized oversight

| Feature | Status |
|---|---|
| Everything in Premium | ✓ |
| Full Backoffice (no limitations) | ✓ |
| Multiple businesses under one Backoffice | ✓ |
| Unified dashboard across all businesses/outlets | ✓ |
| Simple PnL / Finance System | ✓ (detail TBD) |
| Dedicated Account Manager | ✓ |
| Custom Integrations (accounting, ERP) | ✓ (detail TBD) |
| SLA + Onboarding & Training | ✓ |
| Full White-label Branding | 🔲 TBD |
| Custom Contract Pricing | ✓ |

> **Note:** Enterprise tier full feature interview not yet conducted. Features above are directional only.

---

## COMPETITIVE LANDSCAPE

| Competitor | Free Tier | Cheapest Paid | Mid | Top |
|---|---|---|---|---|
| Kasir Pintar | ✓ (limited) | Rp 55rb/mo | — | Rp 300rb/mo |
| Olsera | ✗ | Rp 128rb/mo | Rp 218rb/mo | Rp 298rb/mo |
| Majoo | ✗ | Rp 149rb/mo | Rp 299rb/mo | Rp 599rb/mo |
| Moka POS | ✗ | Rp 299rb/mo | Rp 499rb/mo | Rp 799rb/mo |
| **Prospera** | **✓** | **Rp 50rb → 100rb** | **Rp 150rb → 200rb** | **Contact Sales** |

### Prospera's Key Differentiators

1. **Only player** with both a free tier AND the cheapest paid tier in the market
2. **Backoffice with granular permission system** — no competitor at this price range offers this
3. **AI-powered receipt scan for inventory** — no competitor offers this at all
4. **Two-level Warehouse + Store inventory system** — more sophisticated than competitors at this price point

---

## WHAT IS STILL TBD

| Item | Status |
|---|---|
| AI features per tier (Free, Standard, Premium, Enterprise) | 🔲 Not finalized |
| Enterprise tier full feature list | 🔲 Interview not done |
| Enterprise pricing model / floor price | 🔲 Not defined |
| Launch vs regular price switchover date | 🔲 Not defined for any tier |
| Multi-outlet structure in Enterprise Backoffice | 🔲 Not defined |
| PnL system detail for Enterprise | 🔲 Not defined |
| Full white-label branding removal tier | 🔲 Not assigned |

---

## NEXT STEPS

1. Decide AI features per tier (Free → Standard → Premium → Enterprise)
2. Conduct Enterprise tier feature interview
3. Define Enterprise PnL system in detail
4. Decide which tier gets full white-label (no Prospera branding at all)
5. Set launch-to-regular price switchover dates
