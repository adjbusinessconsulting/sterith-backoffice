"use client";
import { ReactNode, useState } from "react";
import { useAnalytics, AnalyticsData } from "@/lib/useAnalytics";

const RANGES = [
  { days: 1, label: "Hari ini" },
  { days: 7, label: "7 hari" },
  { days: 30, label: "30 hari" },
  { days: 90, label: "90 hari" },
  { days: 365, label: "1 thn" },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Shell({ eyebrow, title, subtitle, children }: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: (data: AnalyticsData) => ReactNode;
}) {
  const { data, loading, days, setDays, custom, setCustom } = useAnalytics();
  const [showCustom, setShowCustom] = useState(false);
  const [cFrom, setCFrom] = useState(todayStr());
  const [cTo, setCTo] = useState(todayStr());

  const fmtDay = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const rangeLabel = custom
    ? `${fmtDay(custom.from)} – ${fmtDay(custom.to)}`
    : days === 1 ? "hari ini" : `${days} hari terakhir`;

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>{eyebrow}</p>
        <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#0D1117", lineHeight: 1.15, marginBottom: 6 }}>{title}</h1>
        <p style={{ fontSize: 13, color: "#8f897a" }}>{subtitle}</p>
      </div>

      {/* Range selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 10, padding: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          {RANGES.map(r => {
            const on = !custom && days === r.days;
            return (
              <button key={r.days} onClick={() => { setShowCustom(false); setDays(r.days); }} style={{
                height: 34, padding: "0 14px", borderRadius: 8,
                background: on ? "#0D1117" : "transparent", border: "none",
                color: on ? "#f8f6ef" : "#8f897a",
                fontSize: 12.5, fontWeight: on ? 600 : 400,
                cursor: "pointer", fontFamily: "var(--font-hanken)",
              }}>{r.label}</button>
            );
          })}
          <button onClick={() => setShowCustom(v => !v)} style={{
            height: 34, padding: "0 14px", borderRadius: 8,
            background: custom ? "#0D1117" : "transparent", border: "none",
            color: custom ? "#f8f6ef" : "#8f897a",
            fontSize: 12.5, fontWeight: custom ? 600 : 400,
            cursor: "pointer", fontFamily: "var(--font-hanken)",
          }}>Pilih tanggal</button>
        </div>
        {loading && <span style={{ fontSize: 12, color: "#a49d8c" }}>Memuat…</span>}
      </div>

      {/* Custom date-range picker */}
      {showCustom && (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 22, flexWrap: "wrap", background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, padding: "14px 16px" }}>
          <div>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 6 }}>Dari</label>
            <input type="date" value={cFrom} max={cTo || todayStr()} onChange={e => setCFrom(e.target.value)}
              style={{ height: 38, border: "1.5px solid #e8e3d5", borderRadius: 9, padding: "0 12px", fontSize: 13, color: "#0D1117", fontFamily: "var(--font-hanken)", background: "#fff" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 6 }}>Sampai</label>
            <input type="date" value={cTo} min={cFrom} max={todayStr()} onChange={e => setCTo(e.target.value)}
              style={{ height: 38, border: "1.5px solid #e8e3d5", borderRadius: 9, padding: "0 12px", fontSize: 13, color: "#0D1117", fontFamily: "var(--font-hanken)", background: "#fff" }} />
          </div>
          <button onClick={() => { if (cFrom && cTo) setCustom({ from: cFrom, to: cTo }); }} style={{
            height: 38, padding: "0 18px", background: "#0D1117", border: "none", borderRadius: 9,
            fontSize: 12.5, fontWeight: 600, color: "#f8f6ef", cursor: "pointer", fontFamily: "var(--font-hanken)",
          }}>Terapkan</button>
        </div>
      )}

      {loading && !data ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#a49d8c", fontSize: 13 }}>Memuat data…</div>
      ) : !data || data.totals.transactions === 0 ? (
        <div style={{ background: "#fff", border: "1px dashed #e0dac9", borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-garamond)", fontSize: 18, color: "#0D1117", marginBottom: 6 }}>Belum ada transaksi</p>
          <p style={{ fontSize: 13, color: "#8f897a" }}>Belum ada penjualan pada rentang {rangeLabel}.</p>
        </div>
      ) : (
        children(data)
      )}
    </div>
  );
}

// ── Shared UI atoms ──

export function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, padding: "16px 18px", flex: 1, minWidth: 150 }}>
      <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: "var(--font-garamond)", fontSize: 26, fontWeight: 600, color: "#0D1117", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</p>
      {sub && <p style={{ fontSize: 11.5, color: "#a49d8c", marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

export function Panel({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--font-garamond)", fontSize: 17, fontWeight: 600, color: "#0D1117" }}>{title}</h2>
        {hint && <span style={{ fontSize: 11, color: "#a49d8c" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}
