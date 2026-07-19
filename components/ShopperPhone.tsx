"use client";
import { rupiah, TAG_META, type DemoProduct } from "@/lib/demo/showcase";

/**
 * Phone mockup of the customer-facing Showcase app — the "money shot" that
 * shows the owner what their shoppers would see: a lookbook product with live
 * per-size stock and a Hold / notify-me flow. Static, illustrative.
 */
export default function ShopperPhone({ product }: { product: DemoProduct }) {
  const tag = product.tag ? TAG_META[product.tag] : null;
  const Nav = [
    { d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", label: "Etalase", on: true },
    { d: "M3 11l19-9-9 19-2-8-8-2z", label: "Drops", on: false },
    { d: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z", label: "Hold", on: false },
    { d: "M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8z", label: "Akun", on: false },
  ];
  return (
    <div style={{ width: 272, flexShrink: 0 }}>
      {/* Phone frame */}
      <div style={{ background: "#0D1117", borderRadius: 36, padding: 9, boxShadow: "0 26px 60px -16px rgba(20,32,58,0.5)" }}>
        <div style={{ position: "relative", background: "#fff", borderRadius: 28, overflow: "hidden", height: 560 }}>
          {/* Notch */}
          <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 90, height: 6, borderRadius: 99, background: "#e6e1d6", zIndex: 3 }} />

          {/* App top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 16px 10px" }}>
            <span style={{ fontFamily: "var(--font-garamond)", fontSize: 19, fontWeight: 700, color: "#0D1117", letterSpacing: "0.02em" }}>Kanso</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#96762f", background: "#f4ecd6", borderRadius: 99, padding: "3px 9px" }}>★ 240 poin</span>
          </div>

          {/* Hero image */}
          <div style={{ position: "relative", width: "100%", height: 232, background: "#f1ede4" }}>
            <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {tag && <span style={{ position: "absolute", top: 12, left: 12, fontSize: 8.5, letterSpacing: "0.1em", fontWeight: 800, color: tag.color, background: tag.bg, padding: "3px 8px", borderRadius: 5 }}>{tag.label}</span>}
            <span style={{ position: "absolute", bottom: 12, left: 12, fontSize: 9, fontWeight: 700, color: "#fff", background: "rgba(176,73,47,0.9)", padding: "3px 9px", borderRadius: 5 }}>Hampir habis</span>
          </div>

          {/* Product info */}
          <div style={{ padding: "13px 16px 0" }}>
            <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#96762f", fontWeight: 700 }}>{product.brand}</span>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#0D1117", marginTop: 2, lineHeight: 1.25 }}>{product.name}</p>
            <p style={{ fontFamily: "var(--font-garamond)", fontSize: 19, fontWeight: 600, color: "#0D1117", marginTop: 3 }}>{rupiah(product.price)}</p>

            {/* Size selector — live stock */}
            <p style={{ fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, margin: "12px 0 6px" }}>Pilih ukuran</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {product.sizes.map((s) => {
                const out = s.stock === 0;
                const sel = !out && s.stock <= 1; // pretend the near-empty size is picked
                return (
                  <span key={s.size} style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-hanken)", minWidth: 34, textAlign: "center", padding: "6px 4px", borderRadius: 8, border: `1.5px solid ${sel ? "#0D1117" : out ? "#ece7dd" : "#d8d2c4"}`, background: sel ? "#0D1117" : "#fff", color: sel ? "#f8f6ef" : out ? "#c3bcae" : "#0D1117", textDecoration: out ? "line-through" : "none" }}>{s.size}</span>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 54, padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <button style={{ height: 44, borderRadius: 12, border: "none", background: "#0D1117", color: "#f8f6ef", fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-hanken)", cursor: "default" }}>Tahan item ini →</button>
            <button style={{ height: 38, borderRadius: 11, border: "1.5px solid #e8e3d5", background: "#fff", color: "#0D1117", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-hanken)", cursor: "default" }}>Beritahu saya saat restok</button>
          </div>

          {/* Bottom nav */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 46, borderTop: "1px solid #f0ece3", background: "#fff", display: "flex" }}>
            {Nav.map((n) => (
              <div key={n.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: n.on ? "#0D1117" : "#b7b0a4" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={n.d} /></svg>
                <span style={{ fontSize: 7.5, fontWeight: n.on ? 700 : 500, fontFamily: "var(--font-hanken)" }}>{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: "#8f897a", marginTop: 12, fontStyle: "italic" }}>Tampilan aplikasi pelanggan (contoh)</p>
    </div>
  );
}
