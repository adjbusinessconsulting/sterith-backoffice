"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useUIStore } from "@/store/ui";

interface Product {
  id: string; name: string; sku: string; unit: string; category: string;
  warehouseQty: number; storeQty: number; price: number;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
}

function fmtPrice(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

const CATS = ["Semua", "Sembako", "Minuman", "Snack", "Rokok"];

export default function ProdukPage() {
  const openModal = useUIStore(s => s.openModal);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Semua");

  function refresh() {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .catch(() => {});
  }

  useEffect(() => { refresh(); }, []);

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
    <div style={{ padding: "32px 36px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>
            KATALOG · {products.length} ITEM
          </p>
          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#14203a", lineHeight: 1.15, marginBottom: 6 }}>
            Produk toko
          </h1>
          <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 400 }}>
            Kelola produk, harga, dan stok — persis seperti yang dilihat kasir di POS.
          </p>
        </div>
        <button
          onClick={() => openModal("produk")}
          style={{
            height: 40, padding: "0 18px",
            background: "#14203a", border: "none",
            borderRadius: 10, fontSize: 13, fontWeight: 600,
            color: "#f8f6ef", cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
            fontFamily: "var(--font-hanken)", flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
          Produk baru
        </button>
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
        <p style={{ fontSize: 12.5, color: "#14203a", lineHeight: 1.6 }}>
          Tampilan ini <strong>sama persis</strong> dengan tampilan kasir di POS. Klik kartu produk untuk ubah harga, stok, atau foto.
        </p>
      </div>

      {/* Search */}
      <div style={{
        height: 42,
        background: "#fff", border: "1.5px solid #e8e3d5",
        borderRadius: 10, display: "flex", alignItems: "center", gap: 10, padding: "0 14px",
        marginBottom: 16,
      }}>
        <Search size={15} color="#8f897a" strokeWidth={1.8} />
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Cari produk..."
          style={{ flex: 1, border: "none", fontSize: 13.5, color: "#14203a", fontFamily: "var(--font-hanken)", background: "transparent" }}
        />
        <span style={{ fontSize: 10.5, color: "#8f897a", background: "#e8e3d5", padding: "2px 7px", borderRadius: 5 }}>CTRL + K</span>
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            height: 34, padding: "0 14px", borderRadius: 99,
            background: cat === c ? "#14203a" : "#fff",
            border: `1.5px solid ${cat === c ? "#14203a" : "#e8e3d5"}`,
            color: cat === c ? "#f8f6ef" : "#14203a",
            fontSize: 13, fontWeight: cat === c ? 600 : 400,
            cursor: "pointer", fontFamily: "var(--font-hanken)",
          }}>
            {c}{catCounts[c] ? ` · ${catCounts[c]}` : ""}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
        {filtered.map(p => (
          <button
            key={p.id}
            onClick={() => openModal("produk", p.id)}
            style={{
              background: "#f1e7cd", border: "1.5px solid #e8d9b8",
              borderRadius: 14, padding: 0, cursor: "pointer",
              textAlign: "left", overflow: "hidden",
              position: "relative",
            }}
          >
            <div style={{ padding: "14px 14px 0", display: "flex", justifyContent: "flex-end" }}>
              <span style={{ fontSize: 10.5, color: "#96762f", fontWeight: 600 }}>×{p.storeQty}</span>
            </div>
            <div style={{ padding: "8px 14px 10px", display: "flex", alignItems: "center", justifyContent: "center", height: 100 }}>
              <span style={{
                fontFamily: "var(--font-garamond)", fontSize: 52, fontWeight: 500,
                color: "#d4c099", lineHeight: 1, userSelect: "none",
              }}>
                {initials(p.name)}
              </span>
            </div>
            <div style={{ background: "#fff", borderTop: "1px solid #e8d9b8", padding: "10px 12px" }}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: "#14203a", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.name}
              </p>
              <p style={{ fontSize: 11, color: "#8f897a", marginBottom: 4 }}>{p.category}</p>
              <p style={{ fontFamily: "var(--font-garamond)", fontSize: 14, color: "#14203a", fontWeight: 500 }}>{fmtPrice(p.price)}</p>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: "60px 20px", textAlign: "center", color: "#8f897a", fontSize: 13 }}>
            {products.length === 0 ? "Belum ada produk. Tambah produk baru." : "Tidak ada hasil"}
          </div>
        )}
      </div>
    </div>
  );
}
