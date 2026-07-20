"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { hasAddOn } from "@/lib/addons";
import DemoBanner from "@/components/DemoBanner";
import ShopperApp from "@/components/ShopperApp";
import { TAG_META, rupiah, totalStock, type DemoProduct } from "@/lib/demo/showcase";

type Dept = "all" | "apparel" | "footwear";

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

export default function KatalogPage() {
  const { data: session } = useSession();
  const owned = hasAddOn(session?.user?.addOns, "showcase");

  // Owner's own catalog — starts empty, they build it.
  const [catalog, setCatalog] = useState<DemoProduct[]>([]);
  const [dept, setDept] = useState<Dept>("all");
  const [q, setQ] = useState("");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [featured, setFeatured] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editing, setEditing] = useState<DemoProduct | null>(null);   // product being edited
  const [adding, setAdding] = useState(false);

  const patch = (id: string, fn: (p: DemoProduct) => DemoProduct) => setCatalog((c) => c.map((p) => (p.id === id ? fn(p) : p)));
  const setPrice = (id: string, price: number) => patch(id, (p) => ({ ...p, price }));
  const bumpSize = (id: string, size: string, d: number) => patch(id, (p) => ({ ...p, sizes: p.sizes.map((s) => (s.size === size ? { ...s, stock: Math.max(0, s.stock + d) } : s)) }));
  const toggle = (set: Set<string>, setSet: (s: Set<string>) => void, id: string) => { const n = new Set(set); if (n.has(id)) n.delete(id); else n.add(id); setSet(n); };
  const removeProduct = (id: string) => setCatalog((c) => c.filter((p) => p.id !== id));

  function saveProduct(p: DemoProduct) {
    setCatalog((c) => (c.some((x) => x.id === p.id) ? c.map((x) => (x.id === p.id ? p : x)) : [...c, p]));
    setEditing(null); setAdding(false);
  }

  const list = catalog.filter((p) => (dept === "all" || p.dept === dept) && (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase())));
  const phoneProducts = [...catalog].sort((a, b) => (featured.has(b.id) ? 1 : 0) - (featured.has(a.id) ? 1 : 0));
  const DEPTS: { id: Dept; label: string }[] = [{ id: "all", label: "Semua" }, { id: "apparel", label: "Apparel" }, { id: "footwear", label: "Sneakers" }];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1220 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>SHOWCASE · KATALOG</p>
          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#0D1117", lineHeight: 1.15, marginBottom: 6 }}>Katalog & Etalase</h1>
          <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 520 }}>Bangun etalase Anda — tambah produk (nama, foto, harga, stok), lalu setiap perubahan langsung terlihat di HP pelanggan.</p>
        </div>
        <button onClick={() => setAdding(true)} style={{ height: 44, padding: "0 20px", borderRadius: 11, background: "#0D1117", border: "none", color: "#f8f6ef", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e7c987" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Tambah Produk
        </button>
      </div>

      <DemoBanner owned={owned} addOn="showcase" storeName="toko Anda" />

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
          {catalog.length === 0 ? (
            <div style={{ border: "1.5px dashed #ddd6c4", borderRadius: 16, padding: "48px 24px", textAlign: "center", background: "#fbfaf5" }}>
              <div style={{ width: 52, height: 52, borderRadius: 13, background: "#f1ede4", display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#96762f" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>
              </div>
              <p style={{ fontFamily: "var(--font-garamond)", fontSize: 20, fontWeight: 500, color: "#0D1117", marginBottom: 6 }}>Belum ada produk</p>
              <p style={{ fontSize: 13, color: "#8f897a", marginBottom: 18 }}>Tambah produk pertama Anda untuk mulai membangun etalase.</p>
              <button onClick={() => setAdding(true)} style={{ height: 42, padding: "0 20px", borderRadius: 11, background: "#0D1117", border: "none", color: "#f8f6ef", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>+ Tambah Produk</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
              {list.map((p) => (
                <Card key={p.id} p={p} selected={previewId === p.id} hidden={hidden.has(p.id)} featured={featured.has(p.id)}
                  onPreview={() => setPreviewId(p.id)}
                  onEdit={() => setEditing(p)}
                  onDelete={() => removeProduct(p.id)}
                  onToggleHidden={() => toggle(hidden, setHidden, p.id)}
                  onToggleFeatured={() => toggle(featured, setFeatured, p.id)}
                  onSetPrice={(v) => setPrice(p.id, v)}
                  onBump={(size, d) => bumpSize(p.id, size, d)} />
              ))}
            </div>
          )}
        </div>

        <div style={{ position: "sticky", top: 20 }}>
          <ShopperApp products={phoneProducts} previewId={previewId} hiddenIds={hidden} featuredIds={featured} storeName="Toko Anda" />
        </div>
      </div>

      {(adding || editing) && (
        <ProductModal product={editing} onClose={() => { setAdding(false); setEditing(null); }} onSave={saveProduct} makeId={uid} />
      )}
    </div>
  );
}

function Card({ p, selected, hidden, featured, onPreview, onEdit, onDelete, onToggleHidden, onToggleFeatured, onSetPrice, onBump }: {
  p: DemoProduct; selected: boolean; hidden: boolean; featured: boolean;
  onPreview: () => void; onEdit: () => void; onDelete: () => void; onToggleHidden: () => void; onToggleFeatured: () => void; onSetPrice: (v: number) => void; onBump: (size: string, d: number) => void;
}) {
  const tag = p.tag ? TAG_META[p.tag] : null;
  const out = totalStock(p) === 0;
  const [pe, setPe] = useState(false);
  const [val, setVal] = useState("");
  const commit = () => { const n = parseInt(val.replace(/\D/g, ""), 10); if (!isNaN(n)) onSetPrice(n); setPe(false); };

  return (
    <div onClick={onPreview} style={{ background: "#fff", border: `1.5px solid ${selected ? "#0D1117" : "#e8e3d5"}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", opacity: hidden ? 0.5 : 1, transition: "border-color .12s, opacity .12s" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 4", background: "#f1ede4" }}>
        {p.image
          ? <img src={p.image} alt={p.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#c3bcae" }}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>}
        {tag && <span style={{ position: "absolute", bottom: 10, left: 10, fontSize: 8.5, letterSpacing: "0.1em", fontWeight: 800, color: tag.color, background: tag.bg, padding: "3px 8px", borderRadius: 5 }}>{tag.label}</span>}
        {out && <span style={{ position: "absolute", bottom: 10, right: 10, fontSize: 8.5, fontWeight: 800, color: "#fff", background: "rgba(20,32,58,0.75)", padding: "3px 8px", borderRadius: 5 }}>HABIS</span>}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 6 }}>
          <button onClick={(e) => { e.stopPropagation(); onToggleFeatured(); }} title={featured ? "Batal unggulkan" : "Unggulkan (tampil pertama)"} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: featured ? "#f4d58a" : "rgba(255,255,255,0.92)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#0D1117", boxShadow: "0 2px 6px rgba(20,32,58,0.15)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={featured ? "#0D1117" : "none"} stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9"/></svg>
          </button>
        </div>
        <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Ubah nama / foto / detail" style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.92)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#0D1117", boxShadow: "0 2px 6px rgba(20,32,58,0.15)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onToggleHidden(); }} title={hidden ? "Tampilkan di etalase" : "Sembunyikan dari etalase"} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.92)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: hidden ? "#b0492f" : "#0D1117", boxShadow: "0 2px 6px rgba(20,32,58,0.15)" }}>
            {hidden ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/></svg>
                   : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
          </button>
        </div>
      </div>
      <div style={{ padding: "12px 13px 14px", display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
        <div>
          <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#96762f", fontWeight: 700 }}>{p.brand}</span>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#0D1117", lineHeight: 1.3, marginTop: 2 }}>{p.name}</p>
        </div>
        {pe ? (
          <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 4, border: "1.5px solid #0D1117", borderRadius: 8, padding: "0 8px", height: 32 }}>
            <span style={{ fontSize: 12, color: "#8f897a" }}>Rp</span>
            <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && commit()} inputMode="numeric" style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#0D1117", background: "transparent", width: 70 }} />
          </div>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); setVal(String(p.price)); setPe(true); }} title="Ubah harga" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: "var(--font-garamond)", fontSize: 17, fontWeight: 600, color: "#0D1117" }}>{rupiah(p.price)}</button>
        )}
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
        {selected && (
          <button onClick={(e) => { e.stopPropagation(); if (confirm(`Hapus "${p.name}" dari katalog?`)) onDelete(); }} style={{ marginTop: 4, alignSelf: "flex-start", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#b0492f", fontFamily: "var(--font-hanken)" }}>Hapus produk</button>
        )}
        {hidden && <span style={{ fontSize: 10, fontWeight: 700, color: "#b0492f", letterSpacing: "0.04em" }}>Disembunyikan dari etalase</span>}
        {featured && !hidden && <span style={{ fontSize: 10, fontWeight: 700, color: "#96762f", letterSpacing: "0.04em" }}>★ Produk unggulan</span>}
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, onSave, makeId }: { product: DemoProduct | null; onClose: () => void; onSave: (p: DemoProduct) => void; makeId: () => string }) {
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [dept, setDept] = useState<"apparel" | "footwear">(product?.dept ?? "apparel");
  const [image, setImage] = useState(product?.image ?? "");
  const [sizesText, setSizesText] = useState(product ? product.sizes.map((s) => s.size).join(", ") : "S, M, L, XL");
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function pickPhoto(f: File) {
    if (f.size > 4 * 1024 * 1024) { setErr("Ukuran foto maksimal 4MB."); return; }
    const r = new FileReader();
    r.onload = () => setImage(String(r.result));
    r.readAsDataURL(f);
  }

  function save() {
    const priceN = parseInt(price.replace(/\D/g, ""), 10);
    if (!name.trim()) { setErr("Nama produk wajib diisi."); return; }
    if (isNaN(priceN)) { setErr("Harga wajib diisi."); return; }
    const sizeTokens = sizesText.split(",").map((s) => s.trim()).filter(Boolean);
    const existing = product?.sizes ?? [];
    const sizes = (sizeTokens.length ? sizeTokens : ["One Size"]).map((size) => ({
      size, stock: existing.find((s) => s.size === size)?.stock ?? 0,
    }));
    onSave({
      id: product?.id ?? makeId(),
      brand: brand.trim(),
      name: name.trim(),
      dept,
      category: product?.category ?? "",
      price: priceN,
      sizes,
      tag: product?.tag,
      image,
    });
  }

  const label: React.CSSProperties = { display: "block", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, marginBottom: 6 };
  const input: React.CSSProperties = { width: "100%", height: 44, boxSizing: "border-box", border: "1.5px solid #ddd9cc", borderRadius: 10, padding: "0 13px", fontSize: 14, color: "#0D1117", background: "#fff", fontFamily: "var(--font-hanken)", outline: "none" };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(13,17,23,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460, maxHeight: "92vh", overflowY: "auto", background: "#f8f6ef", borderRadius: 18, padding: "26px 28px", boxShadow: "0 30px 80px rgba(13,17,23,0.4)" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 700, marginBottom: 6 }}>SHOWCASE · KATALOG</p>
        <h2 style={{ fontFamily: "var(--font-garamond)", fontSize: 24, fontWeight: 500, color: "#0D1117", marginBottom: 18 }}>{product ? "Ubah Produk" : "Tambah Produk"}</h2>

        <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
          <div onClick={() => fileRef.current?.click()} style={{ width: 96, height: 128, borderRadius: 12, flexShrink: 0, cursor: "pointer", overflow: "hidden", border: "1.5px dashed #d8d2c4", background: image ? `#f1ede4 url(${image}) center/cover no-repeat` : "#f1ede4", display: "grid", placeItems: "center", color: "#a49d8c" }}>
            {!image && <div style={{ textAlign: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p style={{ fontSize: 9, marginTop: 4 }}>Foto</p></div>}
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Foto Produk</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) pickPhoto(f); e.target.value = ""; }} />
            <button onClick={() => fileRef.current?.click()} style={{ ...input, height: 40, cursor: "pointer", textAlign: "left", color: "#0D1117", fontWeight: 500 }}>{image ? "Ganti foto…" : "Unggah foto…"}</button>
            <input value={image.startsWith("data:") ? "" : image} onChange={(e) => setImage(e.target.value)} placeholder="atau tempel URL foto" style={{ ...input, height: 40, marginTop: 8, fontSize: 12.5 }} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={label}>Nama Produk *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Kaos Katun Oversized" style={input} />
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={label}>Brand / Label</label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="mis. Toko Anda" style={input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Harga *</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" placeholder="199000" style={input} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={label}>Kategori</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["apparel", "footwear"] as const).map((d) => (
                <button key={d} onClick={() => setDept(d)} style={{ flex: 1, height: 40, borderRadius: 9, border: `1.5px solid ${dept === d ? "#0D1117" : "#ddd9cc"}`, background: dept === d ? "#0D1117" : "#fff", color: dept === d ? "#f8f6ef" : "#0D1117", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>{d === "apparel" ? "Apparel" : "Sneakers"}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={label}>Ukuran / Varian (pisahkan dengan koma)</label>
          <input value={sizesText} onChange={(e) => setSizesText(e.target.value)} placeholder="S, M, L, XL" style={input} />
          <p style={{ fontSize: 11, color: "#b8a88a", margin: "6px 0 0" }}>Atur stok tiap ukuran nanti dengan tombol +/− di kartu produk.</p>
        </div>

        {err && <p style={{ fontSize: 12, color: "#b0492f", background: "#f4e9e4", padding: "9px 12px", borderRadius: 8, margin: "10px 0 0" }}>{err}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, height: 46, borderRadius: 11, border: "1px solid #ddd9cc", background: "#fff", color: "#8f897a", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>Batal</button>
          <button onClick={save} style={{ flex: 2, height: 46, borderRadius: 11, border: "none", background: "#0D1117", color: "#f8f6ef", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>{product ? "Simpan Perubahan" : "Tambah ke Katalog"}</button>
        </div>
      </div>
    </div>
  );
}

const stepBtn: React.CSSProperties = { width: 18, height: 18, borderRadius: 5, border: "1px solid #d8d2c4", background: "#fff", color: "#0D1117", fontSize: 12, fontWeight: 700, cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 };
