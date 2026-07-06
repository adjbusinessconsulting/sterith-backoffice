"use client";
import Shell, { KpiCard, Panel } from "@/components/analytics/Shell";
import { fmtRp, fmtRpFull, fmtNum } from "@/lib/useAnalytics";

export default function ProductPerformancePage() {
  return (
    <Shell eyebrow="Analitik" title="Performa Produk" subtitle="Produk terlaris dan produk yang tidak terjual (dead stock).">
      {(d) => {
        const top = d.products.slice(0, 12);
        const maxRev = Math.max(...top.map(p => p.revenue), 1);

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <KpiCard label="Produk terjual" value={fmtNum(d.products.length)} sub={`${fmtNum(d.totals.itemsSold)} item`} />
              <KpiCard label="Terlaris" value={top[0] ? top[0].productName : "—"} sub={top[0] ? `${fmtNum(top[0].qty)} terjual` : undefined} />
              <KpiCard label="Dead stock" value={fmtNum(d.deadStock.length)} sub="tak terjual di rentang ini" />
            </div>

            <Panel title="Produk terlaris" hint="berdasarkan omzet">
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {top.map((p, i) => (
                  <div key={p.productId} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 22, textAlign: "center", fontFamily: "var(--font-garamond)", fontSize: 15, fontWeight: 600, color: i === 0 ? "#b8934a" : "#c4bda8", flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 500, color: "#14203a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60%" }}>{p.productName}</span>
                        <span style={{ fontSize: 12.5, color: "#8f897a", fontVariantNumeric: "tabular-nums" }}>{fmtNum(p.qty)}× · {fmtRp(p.revenue)}</span>
                      </div>
                      <div style={{ height: 8, background: "#f1ede1", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${Math.max((p.revenue / maxRev) * 100, 3)}%`, height: "100%", background: "linear-gradient(90deg,#e7c987,#b8934a)", borderRadius: 99 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Dead stock */}
            <Panel title="Dead stock" hint={`${d.deadStock.length} produk · belum terjual di ${d.range.days} hari`}>
              {d.deadStock.length === 0 ? (
                <p style={{ fontSize: 13, color: "#8f897a" }}>Semua produk aktif terjual di rentang ini. 🎉</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                  {d.deadStock.slice(0, 18).map((p) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#faf8f1", border: "1px solid #eee6d4", borderRadius: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: "#fff", border: "1px solid #eee6d4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{p.emoji || "📦"}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#14203a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                        <div style={{ fontSize: 10.5, color: "#a49d8c" }}>Stok {fmtNum(p.stock)} · {p.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        );
      }}
    </Shell>
  );
}
