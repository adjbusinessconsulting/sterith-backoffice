"use client";
import { useEffect, useState } from "react";
import { Search, Plus, X } from "lucide-react";

interface Row {
  id: string; name: string; sku: string | null; category: string; unit: string;
  stock: number; stockAwal: number; stockTambahan: number; stockTerjual: number;
}

const NAVY = "#0D1117", GOLD = "#b8934a", GREEN = "#3f7d54", MUTE = "#8f897a",
  BORDER = "#e8e3d5", CREAM = "#f8f6ef", CARD = "#ffffff", DANGER = "#b0492f";
const F = "var(--font-hanken)";

function statusOf(sisa: number, t: number) {
  if (sisa <= 0) return { label: "Habis", color: DANGER, bg: "#f4e9e4" };
  if (sisa <= t) return { label: "Rendah", color: "#a5772a", bg: "#f3ead0" };
  return { label: "Aman", color: GREEN, bg: "#e9f1ea" };
}

export default function StokHarianPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [threshold, setThreshold] = useState(5);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<Row | null>(null);
  const [qty, setQty] = useState("");
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const c = () => setIsMobile(window.innerWidth < 768);
    c(); window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);

  async function load() {
    const res = await fetch("/api/inventori/basic", { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    if (res.ok) { setRows(json.products ?? []); setThreshold(json.threshold ?? 5); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function addStock() {
    const n = parseInt(qty, 10);
    if (!target || !n || n <= 0) return;
    setSaving(true);
    const res = await fetch("/api/inventori/basic", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: target.id, qty: n }),
    });
    setSaving(false);
    if (res.ok) { setTarget(null); setQty(""); load(); }
  }

  const filtered = rows.filter(r => !q || r.name.toLowerCase().includes(q.toLowerCase()) || (r.sku ?? "").toLowerCase().includes(q.toLowerCase()));
  const lowCount = rows.filter(r => r.stock <= threshold).length;

  const th: React.CSSProperties = { textAlign: "left", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTE, fontWeight: 700, padding: "10px 16px", fontFamily: F };
  const td: React.CSSProperties = { fontSize: 13, color: NAVY, padding: "12px 16px", fontFamily: F, fontVariantNumeric: "tabular-nums" };

  return (
    <div style={{ padding: isMobile ? "18px 14px" : "28px 32px", fontFamily: F }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, fontWeight: 700 }}>Inventori · Dasar</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em", marginTop: 4 }}>Stok Harian</h1>
        <p style={{ fontSize: 13, color: MUTE, marginTop: 4 }}>
          Stok awal + tambahan − terjual = sisa. Sisa hari ini menjadi stok awal besok — cukup tambah stok tiap hari.
        </p>
      </div>

      {/* summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        {[
          { l: "Produk", v: rows.length, c: NAVY },
          { l: "Stok rendah", v: lowCount, c: lowCount > 0 ? "#a5772a" : NAVY },
          { l: "Ambang batas", v: threshold, c: NAVY },
        ].map(s => (
          <div key={s.l} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 18px", minWidth: 110 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.c, fontVariantNumeric: "tabular-nums" }}>{s.v}</div>
            <div style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTE, fontWeight: 600, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "0 12px", height: 40, maxWidth: 320, marginBottom: 14 }}>
        <Search size={14} color={MUTE} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari produk atau SKU…"
          style={{ flex: 1, border: 0, outline: "none", background: "transparent", fontSize: 13, color: NAVY, fontFamily: F }} />
      </div>

      {/* mobile: cards */}
      {isMobile ? (
        loading ? (
          <p style={{ color: MUTE, fontSize: 13, textAlign: "center", padding: 30 }}>Memuat…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: MUTE, fontSize: 13, textAlign: "center", padding: 30 }}>Belum ada produk.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(r => {
              const s = statusOf(r.stock, threshold);
              return (
                <div key={r.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{r.name}</div>
                      <div style={{ fontSize: 11.5, color: MUTE, marginTop: 1 }}>{r.sku ?? "—"} · {r.unit}</div>
                    </div>
                    <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 6, padding: "3px 9px", letterSpacing: "0.04em" }}>{s.label}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 12 }}>
                    {[{ l: "Awal", v: r.stockAwal }, { l: "Tambah", v: r.stockTambahan > 0 ? `+${r.stockTambahan}` : "0", g: r.stockTambahan > 0 }, { l: "Terjual", v: r.stockTerjual }, { l: "Sisa", v: r.stock, a: true }].map(c => (
                      <div key={c.l} style={{ border: `1px solid ${BORDER}`, borderRadius: 9, padding: "7px 2px", textAlign: "center", background: c.a ? "rgba(63,125,84,0.06)" : CREAM }}>
                        <div style={{ fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTE, fontWeight: 700 }}>{c.l}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, marginTop: 1, fontVariantNumeric: "tabular-nums", color: c.a ? GREEN : c.g ? GREEN : NAVY }}>{c.v}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setTarget(r); setQty(""); }}
                    style={{ width: "100%", height: 40, borderRadius: 10, border: `1px solid rgba(63,125,84,0.4)`, background: "rgba(63,125,84,0.07)", color: GREEN, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Plus size={15} /> Tambah Stok
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : (
      /* desktop: table */
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                <th style={th}>Produk</th>
                <th style={{ ...th, textAlign: "right" }}>Awal</th>
                <th style={{ ...th, textAlign: "right" }}>Tambahan</th>
                <th style={{ ...th, textAlign: "right" }}>Terjual</th>
                <th style={{ ...th, textAlign: "right" }}>Sisa</th>
                <th style={{ ...th, textAlign: "center" }}>Status</th>
                <th style={{ ...th, textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td style={{ ...td, color: MUTE, textAlign: "center" }} colSpan={7}>Memuat…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td style={{ ...td, color: MUTE, textAlign: "center" }} colSpan={7}>Belum ada produk.</td></tr>
              ) : filtered.map(r => {
                const s = statusOf(r.stock, threshold);
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid #f1ede1` }}>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: MUTE }}>{r.sku ?? "—"} · {r.unit}</div>
                    </td>
                    <td style={{ ...td, textAlign: "right", color: MUTE }}>{r.stockAwal}</td>
                    <td style={{ ...td, textAlign: "right", color: r.stockTambahan > 0 ? GREEN : MUTE }}>{r.stockTambahan > 0 ? `+${r.stockTambahan}` : "0"}</td>
                    <td style={{ ...td, textAlign: "right", color: MUTE }}>{r.stockTerjual}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 800, color: r.stock <= threshold ? "#a5772a" : NAVY }}>{r.stock}</td>
                    <td style={{ ...td, textAlign: "center" }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 6, padding: "3px 9px", letterSpacing: "0.04em" }}>{s.label}</span>
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <button onClick={() => { setTarget(r); setQty(""); }} title="Tambah stok"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 30, padding: "0 11px", borderRadius: 8, border: `1px solid rgba(63,125,84,0.4)`, background: "rgba(63,125,84,0.07)", color: GREEN, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F }}>
                        <Plus size={13} /> Stok
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Tambah modal */}
      {target && (
        <div onClick={() => setTarget(null)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(20,32,58,0.5)", backdropFilter: "blur(2px)", display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", padding: isMobile ? 0 : 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: CREAM, borderRadius: isMobile ? "18px 18px 0 0" : 16, width: "100%", maxWidth: isMobile ? "100%" : 380, boxShadow: "0 30px 80px rgba(20,32,58,0.4)" }}>
            <div style={{ padding: "18px 20px 4px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTE, fontWeight: 700 }}>Tambah Stok</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginTop: 2 }}>{target.name}</div>
              </div>
              <button onClick={() => setTarget(null)} style={{ border: 0, background: "transparent", cursor: "pointer", color: MUTE }}><X size={18} /></button>
            </div>
            <div style={{ padding: "10px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
                {[{ l: "Awal", v: target.stockAwal }, { l: "Tambahan", v: target.stockTambahan }, { l: "Terjual", v: target.stockTerjual }, { l: "Sisa", v: target.stock, a: true }].map(c => (
                  <div key={c.l} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 4px", textAlign: "center", background: c.a ? "rgba(63,125,84,0.06)" : CARD }}>
                    <div style={{ fontSize: 8.5, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTE, fontWeight: 700 }}>{c.l}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: c.a ? GREEN : NAVY, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{c.v}</div>
                  </div>
                ))}
              </div>
              <label style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTE, fontWeight: 700 }}>Tambah berapa?</label>
              <input autoFocus type="number" min={1} value={qty} onChange={e => setQty(e.target.value)} onKeyDown={e => e.key === "Enter" && addStock()}
                placeholder="mis. 24"
                style={{ width: "100%", height: 46, marginTop: 8, borderRadius: 10, border: `1px solid ${(parseInt(qty, 10) || 0) > 0 ? GREEN : BORDER}`, padding: "0 14px", fontSize: 15, color: NAVY, background: CARD, outline: "none", fontFamily: F, fontVariantNumeric: "tabular-nums" }} />
              {(parseInt(qty, 10) || 0) > 0 && <p style={{ fontSize: 12, color: MUTE, marginTop: 8 }}>Sisa menjadi <b style={{ color: NAVY }}>{target.stock + (parseInt(qty, 10) || 0)}</b></p>}
            </div>
            <div style={{ padding: "6px 20px 18px", display: "flex", gap: 8 }}>
              <button onClick={() => setTarget(null)} style={{ flex: 1, height: 46, borderRadius: 11, border: `1px solid ${BORDER}`, background: CARD, color: NAVY, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F }}>Batal</button>
              <button onClick={addStock} disabled={saving || (parseInt(qty, 10) || 0) <= 0} style={{ flex: 2, height: 46, borderRadius: 11, border: 0, background: NAVY, color: CREAM, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving || (parseInt(qty, 10) || 0) <= 0 ? 0.5 : 1, fontFamily: F }}>{saving ? "Menyimpan…" : "Tambah Stok"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
