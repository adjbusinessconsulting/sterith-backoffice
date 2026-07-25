"use client";
import { ReactNode, useState } from "react";
import { useAnalytics, AnalyticsData } from "@/lib/useAnalytics";

// Local YYYY-MM-DD (not UTC) so ranges line up with the store's calendar day.
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayStr = () => iso(new Date());
// Monday-based start of week.
const startOfWeek = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

// Named calendar periods → concrete {from, to} the analytics API understands.
const PERIODS: { id: string; label: string; range: () => { from: string; to: string } }[] = [
  { id: "today",      label: "Hari ini",     range: () => { const t = new Date();               return { from: iso(t), to: iso(t) }; } },
  { id: "yesterday",  label: "Kemarin",      range: () => { const y = addDays(new Date(), -1);   return { from: iso(y), to: iso(y) }; } },
  { id: "thisWeek",   label: "Minggu ini",   range: () => { const s = startOfWeek(new Date());   return { from: iso(s), to: todayStr() }; } },
  { id: "lastWeek",   label: "Minggu lalu",  range: () => { const s = startOfWeek(new Date());   return { from: iso(addDays(s, -7)), to: iso(addDays(s, -1)) }; } },
  { id: "thisMonth",  label: "Bulan ini",    range: () => { const n = new Date();                return { from: iso(new Date(n.getFullYear(), n.getMonth(), 1)), to: todayStr() }; } },
  { id: "lastMonth",  label: "Bulan lalu",   range: () => { const n = new Date();                return { from: iso(new Date(n.getFullYear(), n.getMonth() - 1, 1)), to: iso(new Date(n.getFullYear(), n.getMonth(), 0)) }; } },
];

const DEFAULT_PERIOD = PERIODS.find(p => p.id === "thisMonth")!;

export default function Shell({ eyebrow, title, subtitle, children }: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: (data: AnalyticsData) => ReactNode;
}) {
  const { data, loading, custom, setCustom } = useAnalytics(DEFAULT_PERIOD.range());
  const [periodId, setPeriodId] = useState(DEFAULT_PERIOD.id);
  const [showCustom, setShowCustom] = useState(false);
  const [cFrom, setCFrom] = useState(todayStr());
  const [cTo, setCTo] = useState(todayStr());

  function pickPeriod(p: typeof PERIODS[number]) {
    setPeriodId(p.id);
    setShowCustom(false);
    setCustom(p.range());
  }

  const fmtDay = (s: string) => new Date(`${s}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const activeLabel = PERIODS.find(p => p.id === periodId)?.label;
  const rangeLabel = periodId === "custom" && custom
    ? `${fmtDay(custom.from)} – ${fmtDay(custom.to)}`
    : (activeLabel ?? "rentang ini").toLowerCase();

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
          {PERIODS.map(p => {
            const on = periodId === p.id;
            return (
              <button key={p.id} onClick={() => pickPeriod(p)} style={{
                height: 34, padding: "0 14px", borderRadius: 8,
                background: on ? "#0D1117" : "transparent", border: "none",
                color: on ? "#f8f6ef" : "#8f897a",
                fontSize: 12.5, fontWeight: on ? 600 : 400,
                cursor: "pointer", fontFamily: "var(--font-hanken)",
              }}>{p.label}</button>
            );
          })}
          <button onClick={() => setShowCustom(v => !v)} style={{
            height: 34, padding: "0 14px", borderRadius: 8,
            background: periodId === "custom" ? "#0D1117" : "transparent", border: "none",
            color: periodId === "custom" ? "#f8f6ef" : "#8f897a",
            fontSize: 12.5, fontWeight: periodId === "custom" ? 600 : 400,
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
          <button onClick={() => { if (cFrom && cTo) { setPeriodId("custom"); setCustom({ from: cFrom, to: cTo }); } }} style={{
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
