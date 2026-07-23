"use client";
import Shell, { KpiCard, Panel } from "@/components/analytics/Shell";
import { fmtRp, fmtRpFull, fmtNum } from "@/lib/useAnalytics";

const PAY_COLORS: Record<string, string> = {
  TUNAI: "#b8934a", QRIS: "#2a5f78", TRANSFER: "#5c8a6f", DEBIT: "#8a6f9e", "E-WALLET": "#c97b5f",
};

export default function SalesDashboardPage() {
  return (
    <Shell eyebrow="Analitik" title="Dashboard Penjualan" subtitle="Tren omzet, jam tersibuk, dan metode pembayaran dari data transaksi Anda.">
      {(d) => {
        const maxDay = Math.max(...d.daily.map(x => x.revenue), 1);
        const maxHour = Math.max(...d.hourly.map(x => x.revenue), 1);
        const peakHour = d.hourly.reduce((a, b) => (b.revenue > a.revenue ? b : a), d.hourly[0]);
        const totalPay = d.paymentMix.reduce((s, p) => s + p.revenue, 0) || 1;
        const fmtDay = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* KPIs */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <KpiCard label="Omzet" value={fmtRp(d.totals.revenue)} sub={`${d.range.days} hari terakhir`} />
              <KpiCard label="Transaksi" value={fmtNum(d.totals.transactions)} sub={`${fmtNum(d.totals.itemsSold)} item terjual`} />
              <KpiCard label="Rata-rata / transaksi" value={fmtRp(d.totals.avgBasket)} />
              <KpiCard label="Jam tersibuk" value={`${String(peakHour.hour).padStart(2, "0")}.00`} sub={`${fmtRp(peakHour.revenue)} omzet`} />
            </div>

            {/* Revenue over time */}
            <Panel title="Omzet dari waktu ke waktu" hint={`${fmtDay(d.range.from)} – ${fmtDay(d.range.to)}`}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: d.daily.length > 45 ? 1 : 3, height: 150 }}>
                {d.daily.map((x) => (
                  <div key={x.date} title={`${fmtDay(x.date)} · ${fmtRpFull(x.revenue)} · ${x.transactions} trx`}
                    style={{ flex: 1, minWidth: 2, height: `${Math.max((x.revenue / maxDay) * 100, x.revenue > 0 ? 3 : 0.5)}%`,
                      background: x.revenue > 0 ? "linear-gradient(180deg,#e7c987,#b8934a)" : "#ece8dc", borderRadius: "3px 3px 1px 1px" }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10.5, color: "#a49d8c" }}>
                <span>{fmtDay(d.range.from)}</span><span>{fmtDay(d.range.to)}</span>
              </div>
            </Panel>

            <div className="bo-cols-chart" style={{ gap: 16 }}>
              {/* Busiest hours */}
              <Panel title="Jam tersibuk" hint="omzet per jam">
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 130 }}>
                  {d.hourly.map((x) => (
                    <div key={x.hour} title={`${String(x.hour).padStart(2, "0")}.00 · ${fmtRpFull(x.revenue)} · ${x.transactions} trx`}
                      style={{ flex: 1, height: `${Math.max((x.revenue / maxHour) * 100, x.revenue > 0 ? 4 : 1)}%`,
                        background: x.hour === peakHour.hour ? "#0D1117" : x.revenue > 0 ? "#d9bd7e" : "#ece8dc", borderRadius: "2px 2px 0 0" }} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "#a49d8c" }}>
                  <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
                </div>
              </Panel>

              {/* Payment mix */}
              <Panel title="Metode pembayaran">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {d.paymentMix.map((p) => (
                    <div key={p.method}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                        <span style={{ color: "#0D1117", fontWeight: 500 }}>{p.method}</span>
                        <span style={{ color: "#8f897a", fontVariantNumeric: "tabular-nums" }}>{fmtRp(p.revenue)} · {Math.round((p.revenue / totalPay) * 100)}%</span>
                      </div>
                      <div style={{ height: 8, background: "#f1ede1", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${(p.revenue / totalPay) * 100}%`, height: "100%", background: PAY_COLORS[p.method] ?? "#b8934a", borderRadius: 99 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        );
      }}
    </Shell>
  );
}
