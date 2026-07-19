"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { hasAddOn } from "@/lib/addons";
import DemoBanner from "@/components/DemoBanner";
import ShopperApp from "@/components/ShopperApp";
import { SHOWCASE_DEMO, SHOWCASE_DEMO_STORE, TAG_META, rupiah, totalStock, type DemoProduct } from "@/lib/demo/showcase";

type Dept = "all" | "apparel" | "footwear";
const clone = (): DemoProduct[] => SHOWCASE_DEMO.map((p) => ({ ...p, sizes: p.sizes.map((s) => ({ ...s })) }));

export default function KatalogPage() {
  const { data: session } = useSession();
  const owned = hasAddOn(session?.user?.addOns, "showcase");

  const [catalog, setCatalog] = useState<DemoProduct[]>(clone);
  const [dept, setDept] = useState<Dept>("all");
  const [q, setQ] = useState("");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [featured, setFeatured] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);

  const patch = (id: string, fn: (p: DemoProduct) => DemoProduct) => setCatalog((c) => c.map((p) => (p.id === id ? fn(p) : p)));
  const setPrice = (id: string, price: number) => patch(id, (p) => ({ ...p, price }));
  const bumpSize = (id: string, size: string, d: number) => patch(id, (p) => ({ ...p, sizes: p.sizes.map((s) => (s.size === size ? { ...s, stock: Math.max(0, s.stock + d) } : s)) }));
  const toggle = (set: Set<string>, setSet: (s: Set<string>) => void, id: string) => { const n = new Set(set); if (n.has(id)) n.delete(id); else n.add(id); setSet(n); };

  const list = catalog.filter((p) => (dept === "all" || p.dept === dept) && (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase())));
  // Phone etalase: featured first (as the customer would see the merchandised order).
  const phoneProducts = [...catalog].sort((a, b) => (featured.has(b.id) ? 1 : 0) - (featured.has(a.id) ? 1 : 0));
  const DEPTS: { id: Dept; label: string }[] = [{ id: "all", label: "Semua" }, { id: "apparel", label: "Apparel" }, { id: "footwear", label: "Sneakers" }];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1220 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>SHOWCASE · KATALOG</p>
          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#0D1117", lineHeight: 1.15, marginBottom: 6 }}>Katalog & Etalase</h1>
          <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 500 }}>Atur etalase — setiap perubahan langsung terlihat di HP pelanggan. Klik produk untuk pratinjau · ubah harga & stok · ★ unggulkan · 👁 tampil/sembunyikan.</p>
        </div>
      </div>

      <DemoBanner owned={owned} addOn="showcase" storeName={SHOWCASE_DEMO_STORE} />

      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {DEPTS.map((d) => (
            <button key={d.id} onClick={() => setDept(d.id)} style={{ height: 34, padding: "0 14px", borderRadius: 99, background: dept === d.id ? "#0D1117" : "#fff", border: `1.5px solid ${dept === d.id ? "#0D1117" : "#e8e3d5"}`, color: dept === d.id ? "#f8f6ef" : "#0D1117", fontSize: 13, fontWeight: dept === d.id ? 600 : 400, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>{d.label}</button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 180, height: 40, background: "#fff", border: "1.5px solid #e8e3d5", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8f897a" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk atau brand..." style={{ flex: 1, border: "none", fontSize: 13.5, color: "#0D1117", fontFamily: "var(--font-hanken)", background: "transparent", outline: "none" }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 30, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {list.map((p) => (
              <Card key={p.id} p={p} selected={previewId === p.id} hidden={hidden.has(p.id)} featured={featured.has(p.id)}
                onPreview={() => setPreviewId(p.id)}
                onToggleHidden={() => toggle(hidden, setHidden, p.id)}
                onToggleFeatured={() => toggle(featured, setFeatured, p.id)}
                onSetPrice={(v) => setPrice(p.id, v)}
                onBump={(size, d) => bumpSize(p.id, size, d)} />
            ))}
          </div>
        </div>

        <div style={{ position: "sticky", top: 20 }}>
          <ShopperApp products={phoneProducts} previewId={previewId} hiddenIds={hidden} featuredIds={featured} storeName="Kanso" />
        </div>
      </div>
    </div>
  );
}

function Card({ p, selected, hidden, featured, onPreview, onToggleHidden, onToggleFeatured, onSetPrice, onBump }: {
  p: DemoProduct; selected: boolean; hidden: boolean; featured: boolean;
  onPreview: () => void; onToggleHidden: () => void; onToggleFeatured: () => void; onSetPrice: (v: number) => void; onBump: (size: string, d: number) => void;
}) {
  const tag = p.tag ? TAG_META[p.tag] : null;
  const out = totalStock(p) === 0;
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");
  const commit = () => { const n = parseInt(val.replace(/\D/g, ""), 10); if (!isNaN(n)) onSetPrice(n); setEditing(false); };

  return (
    <div onClick={onPreview} style={{ background: "#fff", border: `1.5px solid ${selected ? "#0D1117" : "#e8e3d5"}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", opacity: hidden ? 0.5 : 1, transition: "border-color .12s, opacity .12s" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 4", background: "#f1ede4" }}>
        <img src={p.image} alt={p.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        {tag && <span style={{ position: "absolute", bottom: 10, left: 10, fontSize: 8.5, letterSpacing: "0.1em", fontWeight: 800, color: tag.color, background: tag.bg, padding: "3px 8px", borderRadius: 5 }}>{tag.label}</span>}
        {out && <span style={{ position: "absolute", bottom: 10, right: 10, fontSize: 8.5, fontWeight: 800, color: "#fff", background: "rgba(20,32,58,0.75)", padding: "3px 8px", borderRadius: 5 }}>HABIS</span>}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 6 }}>
          <button onClick={(e) => { e.stopPropagation(); onToggleFeatured(); }} title={featured ? "Batal unggulkan" : "Unggulkan (tampil pertama)"} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: featured ? "#f4d58a" : "rgba(255,255,255,0.92)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#0D1117", boxShadow: "0 2px 6px rgba(20,32,58,0.15)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={featured ? "#0D1117" : "none"} stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9"/></svg>
          </button>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggleHidden(); }} title={hidden ? "Tampilkan di etalase" : "Sembunyikan dari etalase"} style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.92)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: hidden ? "#b0492f" : "#0D1117", boxShadow: "0 2px 6px rgba(20,32,58,0.15)" }}>
          {hidden ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/></svg>
                 : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
        </button>
      </div>
      <div style={{ padding: "12px 13px 14px", display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
        <div>
          <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#96762f", fontWeight: 700 }}>{p.brand}</span>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#0D1117", lineHeight: 1.3, marginTop: 2 }}>{p.name}</p>
        </div>
        {/* Editable price */}
        {editing ? (
          <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 4, border: "1.5px solid #0D1117", borderRadius: 8, padding: "0 8px", height: 32 }}>
            <span style={{ fontSize: 12, color: "#8f897a" }}>Rp</span>
            <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && commit()} inputMode="numeric" style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#0D1117", background: "transparent", width: 70 }} />
          </div>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); setVal(String(p.price)); setEditing(true); }} title="Ubah harga" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: "var(--font-garamond)", fontSize: 17, fontWeight: 600, color: "#0D1117" }}>{rupiah(p.price)}</button>
        )}
        {/* Sizes — steppers when selected, else static */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "auto" }} onClick={(e) => selected && e.stopPropagation()}>
          {p.sizes.map((s) => {
            const so = s.stock === 0;
            if (selected) {
              return (
                <span key={s.size} style={{ display: "inline-flex", alignItems: "center", gap: 3, border: "1px solid #e0dacb", borderRadius: 7, padding: "1px 3px", background: "#faf8f3" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#0D1117", minWidth: 20, textAlign: "center" }}>{s.size}</span>
                  <button onClick={() => onBump(s.size, -1)} style={stepBtn}>−</button>
                  <span style={{ fontSize: 11, fontWeight: 700, color: so ? "#b0492f" : "#0D1117", minWidth: 14, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{s.stock}</span>
                  <button onClick={() => onBump(s.size, 1)} style={stepBtn}>+</button>
                </span>
              );
            }
            return (
              <span key={s.size} style={{ fontSize: 10.5, fontWeight: 600, fontFamily: "var(--font-hanken)", padding: "2px 7px", borderRadius: 6, border: `1px solid ${so ? "#ece7dd" : "rgba(63,125,84,0.3)"}`, background: so ? "#f6f3ec" : "rgba(63,125,84,0.08)", color: so ? "#b7b0a4" : "#3f7d54", textDecoration: so ? "line-through" : "none" }}>{s.size}{so ? "" : ` · ${s.stock}`}</span>
            );
          })}
        </div>
        {hidden && <span style={{ fontSize: 10, fontWeight: 700, color: "#b0492f", letterSpacing: "0.04em" }}>Disembunyikan dari etalase</span>}
        {featured && !hidden && <span style={{ fontSize: 10, fontWeight: 700, color: "#96762f", letterSpacing: "0.04em" }}>★ Produk unggulan</span>}
      </div>
    </div>
  );
}

const stepBtn: React.CSSProperties = { width: 18, height: 18, borderRadius: 5, border: "1px solid #d8d2c4", background: "#fff", color: "#0D1117", fontSize: 12, fontWeight: 700, cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 };
