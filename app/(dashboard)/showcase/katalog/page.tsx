"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { hasAddOn } from "@/lib/addons";
import DemoBanner from "@/components/DemoBanner";
import { SHOWCASE_DEMO, SHOWCASE_DEMO_STORE, TAG_META, rupiah, totalStock, type DemoProduct } from "@/lib/demo/showcase";

type Dept = "all" | "apparel" | "footwear";

export default function KatalogPage() {
  const { data: session } = useSession();
  const owned = hasAddOn(session?.user?.addOns, "showcase");

  const [dept, setDept] = useState<Dept>("all");
  const [q, setQ] = useState("");
  const [nudge, setNudge] = useState<string | null>(null);

  // Soft gate: writes look real but nudge to activate the add-on (demo).
  function softGate(what: string) {
    setNudge(`${what} tersedia setelah Showcase aktif — ini mode demo.`);
    setTimeout(() => setNudge(null), 2600);
  }

  const list = SHOWCASE_DEMO.filter(
    (p) => (dept === "all" || p.dept === dept) && (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase()))
  );

  const DEPTS: { id: Dept; label: string }[] = [
    { id: "all", label: "Semua" },
    { id: "apparel", label: "Apparel" },
    { id: "footwear", label: "Sneakers" },
  ];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>SHOWCASE · KATALOG</p>
          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#14203a", lineHeight: 1.15, marginBottom: 6 }}>Katalog & Etalase</h1>
          <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 460 }}>Etalase produk untuk aplikasi pelanggan — foto lookbook & stok live dari POS.</p>
        </div>
        <button onClick={() => softGate("Tambah produk")} style={{ height: 40, padding: "0 18px", background: "#14203a", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#f8f6ef", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-hanken)", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
          Tambah Produk
        </button>
      </div>

      <DemoBanner owned={owned} addOn="showcase" storeName={SHOWCASE_DEMO_STORE} />

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {DEPTS.map((d) => (
            <button key={d.id} onClick={() => setDept(d.id)} style={{ height: 34, padding: "0 14px", borderRadius: 99, background: dept === d.id ? "#14203a" : "#fff", border: `1.5px solid ${dept === d.id ? "#14203a" : "#e8e3d5"}`, color: dept === d.id ? "#f8f6ef" : "#14203a", fontSize: 13, fontWeight: dept === d.id ? 600 : 400, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>{d.label}</button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 180, height: 40, background: "#fff", border: "1.5px solid #e8e3d5", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8f897a" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk atau brand..." style={{ flex: 1, border: "none", fontSize: 13.5, color: "#14203a", fontFamily: "var(--font-hanken)", background: "transparent", outline: "none" }} />
        </div>
      </div>

      {/* Product grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {list.map((p) => <Card key={p.id} p={p} onOpen={() => softGate("Kelola produk")} />)}
      </div>

      {nudge && (
        <div style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 1000, background: "#14203a", color: "#f8f6ef", fontSize: 13, fontWeight: 500, padding: "11px 18px", borderRadius: 11, boxShadow: "0 12px 40px rgba(20,32,58,0.4)", fontFamily: "var(--font-hanken)" }}>
          {nudge}
        </div>
      )}
    </div>
  );
}

function Card({ p, onOpen }: { p: DemoProduct; onOpen: () => void }) {
  const tag = p.tag ? TAG_META[p.tag] : null;
  const total = totalStock(p);
  return (
    <button onClick={onOpen} style={{ textAlign: "left", background: "#fff", border: "1px solid #e8e3d5", borderRadius: 14, overflow: "hidden", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column" }}>
      {/* Photo */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 4", background: "#f1ede4", overflow: "hidden" }}>
        <img src={p.image} alt={p.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        {tag && (
          <span style={{ position: "absolute", top: 10, left: 10, fontSize: 8.5, letterSpacing: "0.1em", fontWeight: 800, color: tag.color, background: tag.bg, padding: "3px 8px", borderRadius: 5 }}>{tag.label}</span>
        )}
        {total === 0 && (
          <span style={{ position: "absolute", top: 10, right: 10, fontSize: 8.5, letterSpacing: "0.08em", fontWeight: 800, color: "#fff", background: "rgba(20,32,58,0.75)", padding: "3px 8px", borderRadius: 5 }}>HABIS</span>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: "12px 13px 14px", display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
        <div>
          <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#96762f", fontWeight: 700 }}>{p.brand}</span>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#14203a", lineHeight: 1.3, marginTop: 2 }}>{p.name}</p>
        </div>
        <p style={{ fontFamily: "var(--font-garamond)", fontSize: 17, fontWeight: 600, color: "#14203a" }}>{rupiah(p.price)}</p>
        {/* Per-size live stock — the wired-to-POS detail */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "auto" }}>
          {p.sizes.map((s) => {
            const out = s.stock === 0;
            return (
              <span key={s.size} title={out ? "Habis" : `Sisa ${s.stock}`} style={{ fontSize: 10.5, fontWeight: 600, fontFamily: "var(--font-hanken)", padding: "2px 7px", borderRadius: 6, border: `1px solid ${out ? "#ece7dd" : "rgba(63,125,84,0.3)"}`, background: out ? "#f6f3ec" : "rgba(63,125,84,0.08)", color: out ? "#b7b0a4" : "#3f7d54", textDecoration: out ? "line-through" : "none" }}>
                {s.size}{out ? "" : ` · ${s.stock}`}
              </span>
            );
          })}
        </div>
      </div>
    </button>
  );
}
