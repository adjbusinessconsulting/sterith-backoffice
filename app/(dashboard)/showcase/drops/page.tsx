"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { hasAddOn } from "@/lib/addons";
import DemoBanner from "@/components/DemoBanner";
import {
  SHOWCASE_ANNOUNCEMENTS, SHOWCASE_WAITLIST, SHOWCASE_DEMO_STORE,
  ANN_META, productById,
} from "@/lib/demo/showcase";

export default function DropsPage() {
  const { data: session } = useSession();
  const owned = hasAddOn(session?.user?.addOns, "showcase");
  const [nudge, setNudge] = useState<string | null>(null);

  function softGate(what: string) {
    setNudge(`${what} tersedia setelah Showcase aktif — ini mode demo.`);
    setTimeout(() => setNudge(null), 2600);
  }

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>SHOWCASE · DROPS</p>
          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#14203a", lineHeight: 1.15, marginBottom: 6 }}>Drops & Pengumuman</h1>
          <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 470 }}>Kabari pelanggan lewat push: barang baru, promo, dan drop khusus member.</p>
        </div>
        <button onClick={() => softGate("Buat pengumuman")} style={{ height: 40, padding: "0 18px", background: "#14203a", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#f8f6ef", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-hanken)", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
          Buat Pengumuman
        </button>
      </div>

      <DemoBanner owned={owned} addOn="showcase" storeName={SHOWCASE_DEMO_STORE} />

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Announcements */}
        <div style={{ flex: 1, minWidth: 340 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, marginBottom: 12 }}>Pengumuman</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SHOWCASE_ANNOUNCEMENTS.map((a) => {
              const m = ANN_META[a.kind];
              return (
                <div key={a.id} style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 13, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                    <span style={{ fontSize: 8.5, letterSpacing: "0.08em", fontWeight: 800, textTransform: "uppercase", color: m.color, background: m.bg, padding: "3px 8px", borderRadius: 5 }}>{m.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#14203a", flex: 1, minWidth: 0 }}>{a.title}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: a.status === "terjadwal" ? "#a5772a" : "#8f897a", background: a.status === "terjadwal" ? "#f4ecd6" : "#f0ece3", padding: "2px 8px", borderRadius: 99 }}>{a.status === "terjadwal" ? "Terjadwal" : "Terkirim"}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: "#6f695f", lineHeight: 1.6, marginBottom: 8 }}>{a.body}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "#8f897a" }}>
                    <span>{a.when}</span>
                    <span>· {a.audience === "member" ? "Khusus member" : "Semua pelanggan"}</span>
                    <span>· {a.reach.toLocaleString("id-ID")} jangkauan</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Restock waitlist */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, marginBottom: 12 }}>Antrian Restok</p>
          <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 13, overflow: "hidden" }}>
            {SHOWCASE_WAITLIST.map((w, i) => {
              const p = productById(w.productId);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderBottom: i < SHOWCASE_WAITLIST.length - 1 ? "1px solid #f4f1ea" : "none" }}>
                  {p && <img src={p.image} alt={p.name} style={{ width: 40, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0, background: "#f1ede4" }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: "#14203a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p?.name}</p>
                    <p style={{ fontSize: 11, color: "#8f897a" }}>size {w.size}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontFamily: "var(--font-garamond)", fontSize: 18, fontWeight: 600, color: "#a5772a", lineHeight: 1 }}>{w.count}</p>
                    <p style={{ fontSize: 9.5, color: "#8f897a" }}>menunggu</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => softGate("Beritahu daftar tunggu")} style={{ width: "100%", marginTop: 10, height: 38, borderRadius: 10, border: "1.5px solid #e8e3d5", background: "#fff", color: "#14203a", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>
            Beritahu saat restok
          </button>
        </div>
      </div>

      {nudge && (
        <div style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 1000, background: "#14203a", color: "#f8f6ef", fontSize: 13, fontWeight: 500, padding: "11px 18px", borderRadius: 11, boxShadow: "0 12px 40px rgba(20,32,58,0.4)", fontFamily: "var(--font-hanken)" }}>{nudge}</div>
      )}
    </div>
  );
}
