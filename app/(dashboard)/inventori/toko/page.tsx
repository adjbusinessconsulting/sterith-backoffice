"use client";
import { useState, useEffect } from "react";
import { Search, MoreVertical } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useSession } from "next-auth/react";
import { hasAddOn } from "@/lib/addons";
import InventoriDemo from "@/components/InventoriDemo";

interface Product {
  id: string; name: string; sku: string; unit: string; category: string;
  warehouseQty: number; storeQty: number; soldToday: number; threshold: number; price: number;
}

function statusOf(p: Product) {
  if (p.storeQty === 0) return { label: "Habis", color: "#b0492f", bg: "#f4e9e4" };
  if (p.storeQty < p.threshold) return { label: "Rendah", color: "#a5772a", bg: "#f3ead0" };
  return { label: "Aman", color: "#3f7d54", bg: "#e9f1ea" };
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
}

const CATS = ["Semua", "Sembako", "Minuman", "Snack", "Rokok"];

export default function TokoPage() {
  const { data: session } = useSession();
  const openModal = useUIStore(s => s.openModal);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Semua");

  const hasInv = hasAddOn(session?.user?.addOns, 'inventori');

  useEffect(() => {
    if (!hasInv) return;
    fetch(`/api/products?location=store`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .catch(() => {});
  }, [hasInv]);

  if (!hasInv) return <InventoriDemo section="toko" />;

  const filtered = products.filter(p => {
    const matchCat = cat === "Semua" || p.category === cat;
    const q = query.toLowerCase();
    return matchCat && (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  });

  const catCounts = CATS.reduce((acc, c) => {
    acc[c] = c === "Semua" ? products.length : products.filter(p => p.category === c).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>
            INVENTORI · TOKO
          </p>
          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#0D1117", lineHeight: 1.15, marginBottom: 6 }}>
            Stok toko
          </h1>
          <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 340 }}>
            Stok operasional yang dipakai POS sehari-hari.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => openModal("transfer")}
            style={{
              height: 40, padding: "0 18px",
              background: "#fff", border: "1.5px solid #e8e3d5",
              borderRadius: 10, fontSize: 13, fontWeight: 500,
              color: "#0D1117", cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              fontFamily: "var(--font-hanken)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 16l-4-4 4-4M17 8l4 4-4 4M3 12h18"/></svg>
            Transfer ke Toko
          </button>
          <button
            onClick={() => openModal("stokMasuk")}
            style={{
              height: 40, padding: "0 18px",
              background: "#0D1117", border: "none",
              borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: "#f8f6ef", cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              fontFamily: "var(--font-hanken)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
            Stok Masuk
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        background: "#f8f6ef", border: "1px solid #e8e3d5", borderRadius: 10,
        padding: "12px 16px", marginBottom: 20,
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
        </svg>
        <p style={{ fontSize: 12.5, color: "#0D1117", lineHeight: 1.6 }}>
          Stok toko hanya bertambah lewat <strong>transfer dari gudang</strong>, dan berkurang otomatis saat terjual di POS.
        </p>
      </div>

      {/* Search + AI scan */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{
          flex: 1, height: 42,
          background: "#fff", border: "1.5px solid #e8e3d5",
          borderRadius: 10, display: "flex", alignItems: "center", gap: 10, padding: "0 14px",
        }}>
          <Search size={15} color="#8f897a" strokeWidth={1.8} />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Cari produk atau SKU..."
            style={{ flex: 1, border: "none", fontSize: 13.5, color: "#0D1117", fontFamily: "var(--font-hanken)", background: "transparent" }}
          />
        </div>
        <button
          onClick={() => openModal("stokMasuk")}
          style={{
            height: 42, padding: "0 16px",
            background: "#fff", border: "1.5px solid #e8e3d5",
            borderRadius: 10, fontSize: 13, fontWeight: 500,
            color: "#0D1117", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            fontFamily: "var(--font-hanken)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span style={{ color: "#b8934a" }}>Scan struk (AI)</span>
        </button>
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            height: 34, padding: "0 14px", borderRadius: 99,
            background: cat === c ? "#0D1117" : "#fff",
            border: `1.5px solid ${cat === c ? "#0D1117" : "#e8e3d5"}`,
            color: cat === c ? "#f8f6ef" : "#0D1117",
            fontSize: 13, fontWeight: cat === c ? 600 : 400,
            cursor: "pointer", fontFamily: "var(--font-hanken)",
          }}>
            {c}{catCounts[c] ? ` · ${catCounts[c]}` : ""}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bo-table-scroll" style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f0ebe0" }}>
              {["NAMA PRODUK", "SKU", "STOK TOKO", "STATUS", ""].map(h => (
                <th key={h} style={{
                  padding: "11px 16px", textAlign: "left",
                  fontSize: 9.5, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "#8f897a", fontWeight: 600,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "40px 16px", textAlign: "center", color: "#8f897a", fontSize: 13 }}>
                  {products.length === 0 ? "Belum ada data" : "Tidak ada hasil"}
                </td>
              </tr>
            )}
            {filtered.map(p => {
              const status = statusOf(p);
              return (
                <tr key={p.id} style={{ borderBottom: "1px solid #f8f5ef" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontFamily: "var(--font-garamond)", fontSize: 13, fontWeight: 600, color: "#b8934a" }}>
                          {initials(p.name)}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontSize: 13.5, fontWeight: 500, color: "#0D1117" }}>{p.name}</p>
                        <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 1 }}>{p.category} · {p.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12.5, color: "#8f897a" }}>{p.sku}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ fontFamily: "var(--font-garamond)", fontSize: 20, fontWeight: 500, color: "#0D1117" }}>{p.storeQty}</p>
                    <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 1 }}>terjual {p.soldToday}</p>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: status.color, background: status.bg, padding: "3px 10px", borderRadius: 99 }}>
                      {status.label}
                    </span>
                  </td>
                  <td style={{ padding: "14px 10px", width: 36 }}>
                    <button style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: "#8f897a", borderRadius: 6 }}>
                      <MoreVertical size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
