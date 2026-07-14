"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { hasAddOn } from "@/lib/addons";
import DemoBanner from "@/components/DemoBanner";
import ShopperPhone from "@/components/ShopperPhone";
import {
  SHOWCASE_RESERVATIONS, SHOWCASE_DEMO_STORE, RESV_KIND_META, RESV_STATUS_META,
  productById, type ResvStatus,
} from "@/lib/demo/showcase";

const HERO = productById("n4")!; // Air Jordan 1 — member drop, best hero

export default function ReservasiPage() {
  const { data: session } = useSession();
  const owned = hasAddOn(session?.user?.addOns, "showcase");
  const [filter, setFilter] = useState<"all" | ResvStatus>("all");
  const [nudge, setNudge] = useState<string | null>(null);

  function softGate(what: string) {
    setNudge(`${what} tersedia setelah Showcase aktif — ini mode demo.`);
    setTimeout(() => setNudge(null), 2600);
  }

  const rows = SHOWCASE_RESERVATIONS.filter((r) => filter === "all" || r.status === filter);
  const waiting = SHOWCASE_RESERVATIONS.filter((r) => r.status === "menunggu").length;
  const ready = SHOWCASE_RESERVATIONS.filter((r) => r.status === "siap").length;

  const FILTERS: { id: "all" | ResvStatus; label: string }[] = [
    { id: "all", label: "Semua" },
    { id: "menunggu", label: "Menunggu" },
    { id: "siap", label: "Siap diambil" },
    { id: "selesai", label: "Selesai" },
  ];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1180 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>SHOWCASE · RESERVASI</p>
        <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#14203a", lineHeight: 1.15, marginBottom: 6 }}>Reservasi & Hold</h1>
        <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 480 }}>Antrian permintaan pelanggan: tahan item, order-ahead, dan drop — semua dari aplikasi.</p>
      </div>

      <DemoBanner owned={owned} addOn="showcase" storeName={SHOWCASE_DEMO_STORE} />

      {/* Stat chips */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {[{ n: waiting, l: "Menunggu diproses", c: "#a5772a" }, { n: ready, l: "Siap diambil", c: "#3f7d54" }, { n: SHOWCASE_RESERVATIONS.length, l: "Total reservasi", c: "#14203a" }].map((s) => (
          <div key={s.l} style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, padding: "12px 18px", minWidth: 120 }}>
            <p style={{ fontFamily: "var(--font-garamond)", fontSize: 26, fontWeight: 600, color: s.c, lineHeight: 1 }}>{s.n}</p>
            <p style={{ fontSize: 11, color: "#8f897a", marginTop: 4 }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Two columns: queue + phone */}
      <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Queue */}
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: "flex", gap: 7, marginBottom: 12, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{ height: 32, padding: "0 13px", borderRadius: 99, background: filter === f.id ? "#14203a" : "#fff", border: `1.5px solid ${filter === f.id ? "#14203a" : "#e8e3d5"}`, color: filter === f.id ? "#f8f6ef" : "#14203a", fontSize: 12.5, fontWeight: filter === f.id ? 600 : 400, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>{f.label}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((r) => {
              const p = productById(r.productId);
              const kind = RESV_KIND_META[r.kind];
              const st = RESV_STATUS_META[r.status];
              const actionable = r.status === "menunggu" || r.status === "siap";
              return (
                <div key={r.id} style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 13, padding: "13px 15px", display: "flex", gap: 13, alignItems: "center" }}>
                  {p && <img src={p.image} alt={p.name} style={{ width: 52, height: 62, borderRadius: 9, objectFit: "cover", flexShrink: 0, background: "#f1ede4" }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 2 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "#14203a" }}>{r.customer}</span>
                      <span style={{ fontSize: 8.5, letterSpacing: "0.06em", fontWeight: 700, color: kind.color, background: kind.bg, padding: "2px 7px", borderRadius: 5, textTransform: "uppercase" }}>{kind.label}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#14203a", marginBottom: 1 }}>{p?.name} · <b>size {r.size}</b></p>
                    <p style={{ fontSize: 11, color: "#8f897a" }}>{r.note} · {r.wa}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: st.color, background: st.bg, padding: "3px 9px", borderRadius: 99 }}>{st.label}</span>
                    {actionable && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => softGate(r.status === "siap" ? "Tandai selesai" : "Konfirmasi")} style={{ height: 30, padding: "0 12px", borderRadius: 8, border: "none", background: "#14203a", color: "#f8f6ef", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)", whiteSpace: "nowrap" }}>{r.status === "siap" ? "Selesai" : "Konfirmasi"}</button>
                        <button onClick={() => softGate("Lepas item")} style={{ height: 30, padding: "0 11px", borderRadius: 8, border: "1px solid #e8d5d0", background: "#fff", color: "#b0492f", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)", whiteSpace: "nowrap" }}>Lepas</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phone mockup */}
        <ShopperPhone product={HERO} />
      </div>

      {nudge && (
        <div style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 1000, background: "#14203a", color: "#f8f6ef", fontSize: 13, fontWeight: 500, padding: "11px 18px", borderRadius: 11, boxShadow: "0 12px 40px rgba(20,32,58,0.4)", fontFamily: "var(--font-hanken)" }}>{nudge}</div>
      )}
    </div>
  );
}
