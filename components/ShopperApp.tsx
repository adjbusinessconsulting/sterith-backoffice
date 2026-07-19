"use client";
import { useEffect, useState } from "react";
import { rupiah, TAG_META, totalStock, type DemoProduct } from "@/lib/demo/showcase";

/**
 * Interactive customer-facing Showcase app inside an iPhone frame. It reflects
 * the Back Office live: `products` is the visible catalog (owner can show/hide),
 * and `previewId` jumps the phone to a product (owner clicks a product in the BO).
 * Also browsable on its own (tap a product → detail → back).
 */
export default function ShopperApp({ products, previewId, hiddenIds, featuredIds, storeName = "Kanso" }: { products: DemoProduct[]; previewId?: string | null; hiddenIds?: Set<string>; featuredIds?: Set<string>; storeName?: string }) {
  const [curId, setCurId] = useState<string | null>(previewId ?? null);
  useEffect(() => { if (previewId !== undefined) setCurId(previewId); }, [previewId]);
  const cur = products.find((p) => p.id === curId) ?? null;
  const visible = hiddenIds ? products.filter((p) => !hiddenIds.has(p.id)) : products;
  const curHidden = cur ? !!hiddenIds?.has(cur.id) : false;

  return (
    <div style={{ width: 292, flexShrink: 0 }}>
      <div style={{ background: "#0D1117", borderRadius: 40, padding: 10, boxShadow: "0 30px 70px -18px rgba(20,32,58,0.55)" }}>
        <div style={{ position: "relative", background: "#faf8f3", borderRadius: 30, overflow: "hidden", height: 588 }}>
          {/* Status bar + notch */}
          <div style={{ position: "relative", height: 30, background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#0D1117" }}>9:41</span>
            <div style={{ position: "absolute", top: 7, left: "50%", transform: "translateX(-50%)", width: 84, height: 16, borderRadius: 99, background: "#0D1117" }} />
            <span style={{ fontSize: 9, color: "#0D1117" }}>●●● ⌁</span>
          </div>

          {/* App header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 10px", background: "#fff", borderBottom: "1px solid #f0ece3" }}>
            {cur ? (
              <button onClick={() => setCurId(null)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "#0D1117", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-hanken)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6"/></svg>Kembali
              </button>
            ) : (
              <span style={{ fontFamily: "var(--font-garamond)", fontSize: 18, fontWeight: 700, color: "#0D1117", letterSpacing: "0.02em" }}>{storeName}</span>
            )}
            <span style={{ fontSize: 10, fontWeight: 700, color: "#96762f", background: "#f4ecd6", borderRadius: 99, padding: "3px 9px" }}>★ 240</span>
          </div>

          {/* Body */}
          <div style={{ position: "absolute", top: 71, bottom: 46, left: 0, right: 0, overflowY: "auto" }}>
            {cur ? <Detail p={cur} hidden={curHidden} /> : <Browse products={visible} onOpen={setCurId} featuredIds={featuredIds} />}
          </div>

          {/* Bottom nav */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 46, borderTop: "1px solid #f0ece3", background: "#fff", display: "flex" }}>
            {[
              { d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", label: "Etalase", on: true },
              { d: "M3 11l19-9-9 19-2-8-8-2z", label: "Drops", on: false },
              { d: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z", label: "Hold", on: false },
              { d: "M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8z", label: "Akun", on: false },
            ].map((n) => (
              <div key={n.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: n.on ? "#0D1117" : "#b7b0a4" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={n.d} /></svg>
                <span style={{ fontSize: 7.5, fontWeight: n.on ? 700 : 500, fontFamily: "var(--font-hanken)" }}>{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: "#8f897a", marginTop: 12, fontStyle: "italic" }}>Tampilan pelanggan — live dari Back Office</p>
    </div>
  );
}

function Browse({ products, onOpen, featuredIds }: { products: DemoProduct[]; onOpen: (id: string) => void; featuredIds?: Set<string> }) {
  return (
    <div style={{ padding: "12px 12px 16px" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, margin: "2px 2px 10px" }}>Koleksi ({products.length})</p>
      {products.length === 0 ? (
        <p style={{ fontSize: 12, color: "#8f897a", textAlign: "center", padding: "30px 10px" }}>Belum ada produk tampil di etalase.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {products.map((p) => {
            const tag = p.tag ? TAG_META[p.tag] : null;
            const out = totalStock(p) === 0;
            return (
              <button key={p.id} onClick={() => onOpen(p.id)} style={{ textAlign: "left", background: "#fff", border: "1px solid #ece7dd", borderRadius: 12, overflow: "hidden", cursor: "pointer", padding: 0 }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 4", background: "#f1ede4" }}>
                  <img src={p.image} alt={p.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  {featuredIds?.has(p.id) && <span style={{ position: "absolute", top: 6, left: 6, fontSize: 8, fontWeight: 800, color: "#0D1117", background: "#f4d58a", padding: "2px 5px", borderRadius: 4 }}>★</span>}
                  {tag && !featuredIds?.has(p.id) && <span style={{ position: "absolute", top: 6, left: 6, fontSize: 7, letterSpacing: "0.06em", fontWeight: 800, color: tag.color, background: tag.bg, padding: "2px 5px", borderRadius: 4 }}>{tag.label}</span>}
                  {out && <span style={{ position: "absolute", top: 6, right: 6, fontSize: 7, fontWeight: 800, color: "#fff", background: "rgba(20,32,58,0.75)", padding: "2px 5px", borderRadius: 4 }}>HABIS</span>}
                </div>
                <div style={{ padding: "7px 8px 9px" }}>
                  <p style={{ fontSize: 10.5, fontWeight: 600, color: "#0D1117", lineHeight: 1.25, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name}</p>
                  <p style={{ fontFamily: "var(--font-garamond)", fontSize: 13, fontWeight: 600, color: "#0D1117", marginTop: 2 }}>{rupiah(p.price)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ p, hidden }: { p: DemoProduct; hidden: boolean }) {
  const tag = p.tag ? TAG_META[p.tag] : null;
  return (
    <div>
      {hidden && (
        <div style={{ background: "#0D1117", color: "#f4ecd6", fontSize: 11, fontWeight: 600, textAlign: "center", padding: "6px 10px", fontFamily: "var(--font-hanken)" }}>
          Disembunyikan — tidak tampil ke pelanggan
        </div>
      )}
      <div style={{ position: "relative", width: "100%", height: 244, background: "#f1ede4", opacity: hidden ? 0.55 : 1 }}>
        <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        {tag && <span style={{ position: "absolute", top: 12, left: 12, fontSize: 8.5, letterSpacing: "0.1em", fontWeight: 800, color: tag.color, background: tag.bg, padding: "3px 8px", borderRadius: 5 }}>{tag.label}</span>}
      </div>
      <div style={{ padding: "13px 16px 20px" }}>
        <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#96762f", fontWeight: 700 }}>{p.brand}</span>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#0D1117", marginTop: 2, lineHeight: 1.25 }}>{p.name}</p>
        <p style={{ fontFamily: "var(--font-garamond)", fontSize: 19, fontWeight: 600, color: "#0D1117", marginTop: 3 }}>{rupiah(p.price)}</p>
        <p style={{ fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, margin: "13px 0 6px" }}>Pilih ukuran</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {p.sizes.map((s) => {
            const out = s.stock === 0;
            return (
              <span key={s.size} style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-hanken)", minWidth: 34, textAlign: "center", padding: "6px 4px", borderRadius: 8, border: `1.5px solid ${out ? "#ece7dd" : "#d8d2c4"}`, background: "#fff", color: out ? "#c3bcae" : "#0D1117", textDecoration: out ? "line-through" : "none" }}>{s.size}</span>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          <button style={{ height: 44, borderRadius: 12, border: "none", background: "#0D1117", color: "#f8f6ef", fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-hanken)", cursor: "default" }}>Tahan item ini →</button>
          <button style={{ height: 38, borderRadius: 11, border: "1.5px solid #e8e3d5", background: "#fff", color: "#0D1117", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-hanken)", cursor: "default" }}>Beritahu saya saat restok</button>
        </div>
      </div>
    </div>
  );
}
