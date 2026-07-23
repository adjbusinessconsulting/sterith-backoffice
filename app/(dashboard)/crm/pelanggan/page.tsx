"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { hasAddOn } from "@/lib/addons";
import DemoBanner from "@/components/DemoBanner";
import {
  CRM_CUSTOMERS, TIER_META, SEGMENT_META, rupiahShort,
  type DemoCustomer, type CrmSegment,
} from "@/lib/demo/crm";

const initials = (n: string) => n.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export default function PelangganPage() {
  const { data: session } = useSession();
  const owned = hasAddOn(session?.user?.addOns, "crm");
  const [seg, setSeg] = useState<"all" | CrmSegment>("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<DemoCustomer | null>(null);
  const [nudge, setNudge] = useState<string | null>(null);

  function softGate(what: string) {
    setNudge(`${what} tersedia setelah CRM aktif — ini mode demo.`);
    setTimeout(() => setNudge(null), 2600);
  }

  const rows = CRM_CUSTOMERS.filter((c) => (seg === "all" || c.segment === seg) && (!q || c.name.toLowerCase().includes(q.toLowerCase()) || c.wa.includes(q)));
  const totalPoints = CRM_CUSTOMERS.reduce((s, c) => s + c.points, 0);
  const besar = CRM_CUSTOMERS.filter((c) => c.segment === "besar").length;
  const SEGS: { id: "all" | CrmSegment; label: string }[] = [
    { id: "all", label: "Semua" }, { id: "aktif", label: "Aktif" }, { id: "jarang", label: "Jarang" }, { id: "besar", label: "Pembeli besar" },
  ];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1120 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>CRM · PELANGGAN</p>
          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#0D1117", lineHeight: 1.15, marginBottom: 6 }}>Pelanggan</h1>
          <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 460 }}>Siapa pelanggan Anda, kontak mereka, dan riwayat belanja — otomatis dari POS.</p>
        </div>
        <button onClick={() => softGate("Tambah pelanggan")} style={{ height: 40, padding: "0 18px", background: "#0D1117", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#f8f6ef", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-hanken)", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
          Tambah Pelanggan
        </button>
      </div>

      <DemoBanner owned={owned} addOn="crm" storeName="Kanso Lifestyle" />

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {[{ n: CRM_CUSTOMERS.length, l: "Total pelanggan", c: "#0D1117" }, { n: besar, l: "Pembeli besar", c: "#5b4b8a" }, { n: totalPoints.toLocaleString("id-ID"), l: "Poin beredar", c: "#a5772a" }].map((s) => (
          <div key={s.l} style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, padding: "12px 18px", minWidth: 120 }}>
            <p style={{ fontFamily: "var(--font-garamond)", fontSize: 26, fontWeight: 600, color: s.c, lineHeight: 1 }}>{s.n}</p>
            <p style={{ fontSize: 11, color: "#8f897a", marginTop: 4 }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {SEGS.map((s) => (
            <button key={s.id} onClick={() => setSeg(s.id)} style={{ height: 32, padding: "0 13px", borderRadius: 99, background: seg === s.id ? "#0D1117" : "#fff", border: `1.5px solid ${seg === s.id ? "#0D1117" : "#e8e3d5"}`, color: seg === s.id ? "#f8f6ef" : "#0D1117", fontSize: 12.5, fontWeight: seg === s.id ? 600 : 400, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>{s.label}</button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 180, height: 38, background: "#fff", border: "1.5px solid #e8e3d5", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8f897a" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau WhatsApp..." style={{ flex: 1, border: "none", fontSize: 13.5, color: "#0D1117", fontFamily: "var(--font-hanken)", background: "transparent", outline: "none" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0ebe0" }}>
                {["PELANGGAN", "SEGMEN", "ORDER", "TOTAL BELANJA", "POIN", "TIER", "TERAKHIR"].map((h, i) => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: i >= 2 && i <= 4 ? "right" : "left", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, fontFamily: "var(--font-hanken)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const t = TIER_META[c.tier]; const sm = SEGMENT_META[c.segment];
                return (
                  <tr key={c.id} onClick={() => setSel(c)} style={{ borderBottom: "1px solid #f8f5ef", cursor: "pointer" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 99, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontFamily: "var(--font-garamond)", fontSize: 12.5, fontWeight: 600, color: "#b8934a" }}>{initials(c.name)}</span>
                        </div>
                        <div>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#0D1117" }}>{c.name}</p>
                          <p style={{ fontSize: 11, color: "#8f897a" }}>{c.wa}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 10.5, fontWeight: 600, color: sm.color, background: sm.bg, padding: "3px 9px", borderRadius: 99 }}>{sm.label}</span></td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, color: "#0D1117", fontVariantNumeric: "tabular-nums" }}>{c.orders}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#0D1117", fontVariantNumeric: "tabular-nums" }}>{rupiahShort(c.spent)}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, color: "#a5772a", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{c.points.toLocaleString("id-ID")}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 10.5, fontWeight: 700, color: t.color, background: t.bg, padding: "3px 9px", borderRadius: 5 }}>{c.tier}</span></td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#8f897a", whiteSpace: "nowrap" }}>{c.lastVisit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile drawer */}
      {sel && (
        <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(20,32,58,0.35)", display: "flex", justifyContent: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 400, maxWidth: "92vw", height: "100%", background: "#faf8f3", boxShadow: "-20px 0 60px rgba(20,32,58,0.25)", overflowY: "auto", padding: "26px 26px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <div style={{ width: 48, height: 48, borderRadius: 99, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "var(--font-garamond)", fontSize: 17, fontWeight: 600, color: "#b8934a" }}>{initials(sel.name)}</span>
                </div>
                <div>
                  <p style={{ fontSize: 17, fontWeight: 700, color: "#0D1117" }}>{sel.name}</p>
                  <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: TIER_META[sel.tier].color, background: TIER_META[sel.tier].bg, padding: "2px 8px", borderRadius: 5 }}>{sel.tier}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: SEGMENT_META[sel.segment].color, background: SEGMENT_META[sel.segment].bg, padding: "2px 8px", borderRadius: 99 }}>{SEGMENT_META[sel.segment].label}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSel(null)} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e8e3d5", background: "#fff", cursor: "pointer", color: "#8f897a" }}>✕</button>
            </div>

            <div className="bo-cols-3" style={{ gap: 8, marginBottom: 18 }}>
              {[{ v: rupiahShort(sel.spent), l: "Belanja" }, { v: sel.orders, l: "Order" }, { v: sel.points.toLocaleString("id-ID"), l: "Poin" }].map((s) => (
                <div key={s.l} style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--font-garamond)", fontSize: 18, fontWeight: 600, color: "#0D1117", lineHeight: 1 }}>{s.v}</p>
                  <p style={{ fontSize: 10, color: "#8f897a", marginTop: 4 }}>{s.l}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button onClick={() => softGate("Chat WhatsApp")} style={{ flex: 1, height: 40, borderRadius: 10, border: "1px solid rgba(37,211,102,0.4)", background: "rgba(37,211,102,0.07)", color: "#1FA855", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>WhatsApp</button>
              <button onClick={() => softGate("Edit pelanggan")} style={{ flex: 1, height: 40, borderRadius: 10, border: "1px solid #e8e3d5", background: "#fff", color: "#0D1117", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>Edit</button>
            </div>

            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, marginBottom: 10 }}>Kontak</p>
            <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 12.5, color: "#0D1117", lineHeight: 1.9 }}>
              <div>WhatsApp · {sel.wa}</div>
              <div style={{ color: "#8f897a" }}>Bergabung {sel.joined} · terakhir {sel.lastVisit}</div>
            </div>

            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, marginBottom: 10 }}>Riwayat belanja</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sel.history.map((h, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 10, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div><p style={{ fontSize: 12.5, fontWeight: 600, color: "#0D1117" }}>{h.item}</p><p style={{ fontSize: 11, color: "#8f897a" }}>{h.date}</p></div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0D1117", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{rupiahShort(h.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {nudge && (
        <div style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 1000, background: "#0D1117", color: "#f8f6ef", fontSize: 13, fontWeight: 500, padding: "11px 18px", borderRadius: 11, boxShadow: "0 12px 40px rgba(20,32,58,0.4)", fontFamily: "var(--font-hanken)" }}>{nudge}</div>
      )}
    </div>
  );
}
