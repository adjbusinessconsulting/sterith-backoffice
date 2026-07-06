"use client";
import Shell, { KpiCard, Panel } from "@/components/analytics/Shell";
import { fmtRp, fmtRpFull, fmtNum } from "@/lib/useAnalytics";

const SHIFT_LABEL: Record<number, string> = { 1: "Pagi", 2: "Siang", 3: "Malam" };
const SHIFT_COLOR: Record<number, string> = { 1: "#e7c987", 2: "#c9a55f", 3: "#2a5f78" };

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
}

export default function CashierPerformancePage() {
  return (
    <Shell eyebrow="Analitik" title="Performa Kasir" subtitle="Omzet dan jumlah transaksi per kasir, dirinci per shift.">
      {(d) => {
        const maxRev = Math.max(...d.cashiers.map(c => c.revenue), 1);
        const top = d.cashiers[0];

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <KpiCard label="Kasir aktif" value={fmtNum(d.cashiers.length)} sub={`${d.range.days} hari terakhir`} />
              <KpiCard label="Kasir teratas" value={top ? top.cashierName.split(" ")[0] : "—"} sub={top ? `${fmtRp(top.revenue)} omzet` : undefined} />
              <KpiCard label="Total omzet" value={fmtRp(d.totals.revenue)} sub={`${fmtNum(d.totals.transactions)} transaksi`} />
            </div>

            <Panel title="Peringkat kasir" hint="berdasarkan omzet">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {d.cashiers.map((c, i) => {
                  const shiftTotal = Object.values(c.shifts).reduce((s, v) => s + v, 0) || 1;
                  return (
                    <div key={c.cashierId} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 26, textAlign: "center", fontFamily: "var(--font-garamond)", fontSize: 16, fontWeight: 600, color: i === 0 ? "#b8934a" : "#c4bda8", flexShrink: 0, paddingTop: 6 }}>{i + 1}</div>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f0ebe1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#8f897a", flexShrink: 0 }}>{initials(c.cashierName)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#14203a" }}>{c.cashierName}</span>
                          <span style={{ fontSize: 13, color: "#14203a", fontVariantNumeric: "tabular-nums" }}>{fmtRpFull(c.revenue)}</span>
                        </div>
                        {/* revenue bar, segmented by shift */}
                        <div style={{ height: 9, background: "#f1ede1", borderRadius: 99, overflow: "hidden", display: "flex", width: `${Math.max((c.revenue / maxRev) * 100, 3)}%` }}>
                          {[1, 2, 3].map(sh => c.shifts[sh] ? (
                            <div key={sh} title={`${SHIFT_LABEL[sh]}: ${fmtRpFull(c.shifts[sh])}`} style={{ width: `${(c.shifts[sh] / shiftTotal) * 100}%`, height: "100%", background: SHIFT_COLOR[sh] }} />
                          ) : null)}
                        </div>
                        <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11.5, color: "#8f897a" }}>
                          <span>{fmtNum(c.transactions)} transaksi</span>
                          <span>Rata-rata {fmtRp(c.avgBasket)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 16, marginTop: 18, paddingTop: 14, borderTop: "1px solid #f1ede1" }}>
                {[1, 2, 3].map(sh => (
                  <span key={sh} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8f897a" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: SHIFT_COLOR[sh] }} />Shift {sh} · {SHIFT_LABEL[sh]}
                  </span>
                ))}
              </div>
            </Panel>
          </div>
        );
      }}
    </Shell>
  );
}
