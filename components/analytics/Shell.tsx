"use client";
import { ReactNode } from "react";
import { useAnalytics, AnalyticsData } from "@/lib/useAnalytics";

const RANGES = [
  { days: 7, label: "7 hari" },
  { days: 30, label: "30 hari" },
  { days: 90, label: "90 hari" },
];

export default function Shell({ eyebrow, title, subtitle, children }: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: (data: AnalyticsData) => ReactNode;
}) {
  const { data, loading, days, setDays } = useAnalytics();

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>{eyebrow}</p>
        <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#14203a", lineHeight: 1.15, marginBottom: 6 }}>{title}</h1>
        <p style={{ fontSize: 13, color: "#8f897a" }}>{subtitle}</p>
      </div>

      {/* Range selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 10, padding: 3, display: "flex", gap: 2 }}>
          {RANGES.map(r => (
            <button key={r.days} onClick={() => setDays(r.days)} style={{
              height: 34, padding: "0 16px", borderRadius: 8,
              background: days === r.days ? "#14203a" : "transparent", border: "none",
              color: days === r.days ? "#f8f6ef" : "#8f897a",
              fontSize: 12.5, fontWeight: days === r.days ? 600 : 400,
              cursor: "pointer", fontFamily: "var(--font-hanken)",
            }}>{r.label}</button>
          ))}
        </div>
        {loading && <span style={{ fontSize: 12, color: "#a49d8c" }}>Memuat…</span>}
      </div>

      {loading && !data ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#a49d8c", fontSize: 13 }}>Memuat data…</div>
      ) : !data || data.totals.transactions === 0 ? (
        <div style={{ background: "#fff", border: "1px dashed #e0dac9", borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-garamond)", fontSize: 18, color: "#14203a", marginBottom: 6 }}>Belum ada transaksi</p>
          <p style={{ fontSize: 13, color: "#8f897a" }}>Belum ada penjualan pada rentang {days} hari terakhir.</p>
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
      <p style={{ fontFamily: "var(--font-garamond)", fontSize: 26, fontWeight: 600, color: "#14203a", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</p>
      {sub && <p style={{ fontSize: 11.5, color: "#a49d8c", marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

export function Panel({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--font-garamond)", fontSize: 17, fontWeight: 600, color: "#14203a" }}>{title}</h2>
        {hint && <span style={{ fontSize: 11, color: "#a49d8c" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}
