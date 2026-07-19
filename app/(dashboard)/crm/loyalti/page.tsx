"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { hasAddOn } from "@/lib/addons";
import DemoBanner from "@/components/DemoBanner";
import { LOYALTY, CRM_CUSTOMERS, TIER_META } from "@/lib/demo/crm";

const initials = (n: string) => n.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export default function LoyaltiPage() {
  const { data: session } = useSession();
  const owned = hasAddOn(session?.user?.addOns, "crm");
  const [nudge, setNudge] = useState<string | null>(null);
  function softGate(what: string) {
    setNudge(`${what} tersedia setelah CRM aktif — ini mode demo.`);
    setTimeout(() => setNudge(null), 2600);
  }

  const top = [...CRM_CUSTOMERS].sort((a, b) => b.points - a.points).slice(0, 5);
  const countTier = (name: string) => CRM_CUSTOMERS.filter((c) => c.tier === name).length;

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>CRM · LOYALTI</p>
          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#0D1117", lineHeight: 1.15, marginBottom: 6 }}>Program Loyalti</h1>
          <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 470 }}>Poin & reward untuk pelanggan setia — poin dihitung otomatis dari transaksi POS.</p>
        </div>
        <button onClick={() => softGate("Ubah program")} style={{ height: 40, padding: "0 18px", background: "#0D1117", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#f8f6ef", cursor: "pointer", fontFamily: "var(--font-hanken)", flexShrink: 0 }}>Ubah Program</button>
      </div>

      <DemoBanner owned={owned} addOn="crm" storeName="Kanso Lifestyle" />

      {/* Earn rule */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(180deg,#fff,#faf6ec)", border: "1px solid #efe6cf", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.8"><polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9"/></svg>
        </div>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#96762f", fontWeight: 700 }}>Aturan Poin</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0D1117", marginTop: 1 }}>{LOYALTY.earn}</p>
        </div>
      </div>

      {/* Tiers */}
      <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, marginBottom: 12 }}>Tingkatan Member</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 26 }}>
        {LOYALTY.tiers.map((t) => {
          const m = TIER_META[t.name];
          return (
            <div key={t.name} style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 13, padding: "16px 18px", borderTop: `3px solid ${m.color}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: m.color, letterSpacing: "0.04em" }}>{t.name}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#8f897a" }}>{countTier(t.name)} member</span>
              </div>
              <p style={{ fontSize: 11.5, color: "#8f897a", marginBottom: 8 }}>Mulai {t.threshold.toLocaleString("id-ID")} poin</p>
              <p style={{ fontSize: 12.5, color: "#0D1117", lineHeight: 1.6 }}>{t.perks}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Rewards */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700 }}>Katalog Reward</p>
            <button onClick={() => softGate("Tambah reward")} style={{ height: 30, padding: "0 12px", borderRadius: 8, border: "1.5px solid #e8e3d5", background: "#fff", color: "#0D1117", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>+ Reward</button>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, overflow: "hidden" }}>
            {LOYALTY.rewards.map((r, i) => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: i < LOYALTY.rewards.length - 1 ? "1px solid #f4f1ea" : "none" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#0D1117" }}>{r.name}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#a5772a" }}>{r.cost} poin</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top members */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, marginBottom: 12 }}>Member Teratas</p>
          <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, overflow: "hidden" }}>
            {top.map((c, i) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderBottom: i < top.length - 1 ? "1px solid #f4f1ea" : "none" }}>
                <span style={{ fontFamily: "var(--font-garamond)", fontSize: 15, fontWeight: 600, color: "#b8934a", width: 18, textAlign: "center" }}>{i + 1}</span>
                <div style={{ width: 32, height: 32, borderRadius: 99, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "var(--font-garamond)", fontSize: 11.5, fontWeight: 600, color: "#b8934a" }}>{initials(c.name)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: "#0D1117", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</p>
                  <p style={{ fontSize: 10.5, color: TIER_META[c.tier].color, fontWeight: 600 }}>{c.tier}</p>
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#a5772a", fontVariantNumeric: "tabular-nums" }}>{c.points.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {nudge && (
        <div style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 1000, background: "#0D1117", color: "#f8f6ef", fontSize: 13, fontWeight: 500, padding: "11px 18px", borderRadius: 11, boxShadow: "0 12px 40px rgba(20,32,58,0.4)", fontFamily: "var(--font-hanken)" }}>{nudge}</div>
      )}
    </div>
  );
}
