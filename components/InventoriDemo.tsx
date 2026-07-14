"use client";
import { useState } from "react";
import DemoBanner from "@/components/DemoBanner";
import {
  INV_PRODUCTS, INV_MOVEMENTS, INV_OPNAME, MOVE_META, invStatus, initials,
} from "@/lib/demo/inventori";

type Section = "ringkasan" | "gudang" | "toko" | "opname" | "riwayat";

const META: Record<Section, { eyebrow: string; title: string; desc: string }> = {
  ringkasan: { eyebrow: "INVENTORI · RINGKASAN", title: "Ringkasan Stok", desc: "Ikhtisar stok gudang & toko dalam satu layar." },
  gudang:    { eyebrow: "INVENTORI · GUDANG", title: "Stok Gudang", desc: "Semua stok masuk ke gudang dulu sebelum ditransfer ke toko." },
  toko:      { eyebrow: "INVENTORI · TOKO", title: "Stok Toko", desc: "Stok yang tersedia di lantai toko." },
  opname:    { eyebrow: "INVENTORI · STOK OPNAME", title: "Stok Opname", desc: "Hitung fisik vs sistem — temukan selisih dan sesuaikan." },
  riwayat:   { eyebrow: "INVENTORI · RIWAYAT", title: "Riwayat Stok", desc: "Semua pergerakan stok: masuk, keluar, transfer, rusak." },
};

const rupiahShort = (n: number) => (n >= 1000000 ? "Rp " + (n / 1000000).toFixed(1).replace(".0", "") + " jt" : "Rp " + Math.round(n / 1000) + "rb");

export default function InventoriDemo({ section }: { section: Section }) {
  const m = META[section];
  const [nudge, setNudge] = useState<string | null>(null);
  function softGate(what: string) {
    setNudge(`${what} tersedia setelah add-on Inventori Lengkap aktif — ini mode demo.`);
    setTimeout(() => setNudge(null), 2800);
  }

  const rusak = INV_MOVEMENTS.filter((x) => x.type === "RUSAK").reduce((s, x) => s + x.qty, 0);
  const low = INV_PRODUCTS.filter((p) => p.warehouseQty + p.storeQty < p.threshold).length;
  const stockValue = INV_PRODUCTS.reduce((s, p) => s + (p.warehouseQty + p.storeQty) * p.price, 0);

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1120 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>{m.eyebrow}</p>
          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#14203a", lineHeight: 1.15, marginBottom: 6 }}>{m.title}</h1>
          <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 460 }}>{m.desc}</p>
        </div>
        {section === "gudang" && (
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={() => softGate("Transfer ke toko")} style={btnGhost}>Transfer</button>
            <button onClick={() => softGate("Stok masuk")} style={btnDark}>+ Stok Masuk</button>
          </div>
        )}
        {section === "opname" && (
          <button onClick={() => softGate("Simpan penyesuaian")} style={btnDark}>Simpan Opname</button>
        )}
      </div>

      <DemoBanner owned={false} addOn="inventori" storeName="Kanso Lifestyle" />

      {/* ── RINGKASAN ── */}
      {section === "ringkasan" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { v: INV_PRODUCTS.length, l: "Item aktif", c: "#14203a" },
              { v: low, l: "Stok rendah", c: "#a5772a" },
              { v: rusak, l: "Rusak & hilang (bln ini)", c: "#b0492f" },
              { v: rupiahShort(stockValue), l: "Nilai stok", c: "#3f7d54" },
            ].map((s) => (
              <div key={s.l} style={card}>
                <p style={{ fontFamily: "var(--font-garamond)", fontSize: 28, fontWeight: 600, color: s.c, lineHeight: 1 }}>{s.v}</p>
                <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 5 }}>{s.l}</p>
              </div>
            ))}
          </div>
          <p style={subhead}>Pergerakan terbaru</p>
          <MovementList onGate={softGate} limit={6} />
        </>
      )}

      {/* ── GUDANG / TOKO ── */}
      {(section === "gudang" || section === "toko") && (
        <div style={tableWrap}>
          <div style={{ overflowX: "auto" }}>
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0ebe0" }}>
                  {["PRODUK", "SKU", section === "gudang" ? "STOK GUDANG" : "STOK TOKO", "STATUS"].map((h) => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INV_PRODUCTS.map((p) => {
                  const qty = section === "gudang" ? p.warehouseQty : p.storeQty;
                  const st = invStatus(qty, p.threshold);
                  return (
                    <tr key={p.sku} style={{ borderBottom: "1px solid #f8f5ef" }}>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontFamily: "var(--font-garamond)", fontSize: 12, fontWeight: 600, color: "#b8934a" }}>{initials(p.name)}</span>
                          </div>
                          <div><p style={{ fontSize: 13.5, fontWeight: 500, color: "#14203a" }}>{p.name}</p><p style={{ fontSize: 11, color: "#8f897a" }}>{p.category} · {p.unit}</p></div>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "#8f897a" }}>{p.sku}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ fontFamily: "var(--font-garamond)", fontSize: 19, fontWeight: 500, color: "#14203a" }}>{qty}</span>
                        <span style={{ fontSize: 11, color: "#8f897a", marginLeft: 6 }}>{section === "gudang" ? `di toko ${p.storeQty}` : `di gudang ${p.warehouseQty}`}</span>
                      </td>
                      <td style={{ padding: "13px 16px" }}><span style={{ fontSize: 11.5, fontWeight: 600, color: st.color, background: st.bg, padding: "3px 10px", borderRadius: 99 }}>{st.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── OPNAME ── */}
      {section === "opname" && (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0ebe0" }}>
                {["PRODUK", "SISTEM", "HITUNG FISIK", "SELISIH"].map((h, i) => (
                  <th key={h} style={{ ...th, textAlign: i === 0 ? "left" : "right" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INV_OPNAME.map((r) => {
                const d = r.hitung - r.sistem;
                const col = d === 0 ? "#3f7d54" : d > 0 ? "#2a6f78" : "#b0492f";
                return (
                  <tr key={r.name} style={{ borderBottom: "1px solid #f8f5ef" }}>
                    <td style={{ padding: "13px 16px", fontSize: 13.5, fontWeight: 500, color: "#14203a" }}>{r.name}</td>
                    <td style={{ padding: "13px 16px", textAlign: "right", fontSize: 13, color: "#8f897a" }}>{r.sistem}</td>
                    <td style={{ padding: "13px 16px", textAlign: "right", fontSize: 14, fontWeight: 600, color: "#14203a" }}>{r.hitung}</td>
                    <td style={{ padding: "13px 16px", textAlign: "right", fontSize: 13.5, fontWeight: 700, color: col }}>{d > 0 ? `+${d}` : d}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── RIWAYAT ── */}
      {section === "riwayat" && <MovementList onGate={softGate} limit={INV_MOVEMENTS.length} />}

      {nudge && (
        <div style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 1000, background: "#14203a", color: "#f8f6ef", fontSize: 13, fontWeight: 500, padding: "11px 18px", borderRadius: 11, boxShadow: "0 12px 40px rgba(20,32,58,0.4)", fontFamily: "var(--font-hanken)" }}>{nudge}</div>
      )}
    </div>
  );
}

function MovementList({ limit }: { onGate: (s: string) => void; limit: number }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, overflow: "hidden" }}>
      {INV_MOVEMENTS.slice(0, limit).map((mv, i) => {
        const meta = MOVE_META[mv.type];
        return (
          <div key={mv.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 16px", borderBottom: i < limit - 1 ? "1px solid #f4f1ea" : "none" }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: meta.color, background: meta.bg, padding: "3px 9px", borderRadius: 5, textTransform: "uppercase", letterSpacing: "0.06em", width: 66, textAlign: "center", flexShrink: 0 }}>{meta.label}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#14203a" }}>{mv.name}</p>
              <p style={{ fontSize: 11, color: "#8f897a" }}>{mv.note} · {mv.date} · {mv.by}</p>
            </div>
            <span style={{ fontFamily: "var(--font-garamond)", fontSize: 17, fontWeight: 600, color: mv.type === "MASUK" ? "#3f7d54" : mv.type === "TRANSFER" ? "#2a6f78" : "#b0492f", flexShrink: 0 }}>
              {mv.type === "MASUK" ? "+" : mv.type === "TRANSFER" ? "" : "−"}{mv.qty}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, padding: "16px 18px" };
const subhead: React.CSSProperties = { fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, marginBottom: 12 };
const tableWrap: React.CSSProperties = { background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, overflow: "hidden" };
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", minWidth: 620 };
const th: React.CSSProperties = { padding: "11px 16px", textAlign: "left", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, fontFamily: "var(--font-hanken)", whiteSpace: "nowrap" };
const btnDark: React.CSSProperties = { height: 40, padding: "0 16px", background: "#14203a", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#f8f6ef", cursor: "pointer", fontFamily: "var(--font-hanken)" };
const btnGhost: React.CSSProperties = { height: 40, padding: "0 16px", background: "#fff", border: "1.5px solid #e8e3d5", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#14203a", cursor: "pointer", fontFamily: "var(--font-hanken)" };
