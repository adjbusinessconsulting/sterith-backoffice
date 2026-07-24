"use client";
import { useSession } from "next-auth/react";
import { hasAddOn, ADDON_LABEL, type AddOnKey } from "@/lib/addons";

type Cap = { title: string; desc: string };

/**
 * Add-on section preview. Any Premium owner can open the page and SEE what the
 * add-on does (the capability cards). If they don't own the add-on, a gold
 * upsell banner explains it's a paid add-on — they can look, not operate.
 * As each module is built, its real (owned) UI replaces this preview.
 */
export default function FeaturePreview({
  addOn, eyebrow, title, desc, caps,
}: { addOn: AddOnKey; eyebrow: string; title: string; desc: string; caps: Cap[] }) {
  const { data: session } = useSession();
  const owned = hasAddOn(session?.user?.addOns, addOn);

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>{eyebrow}</p>
        <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#0D1117", lineHeight: 1.15, marginBottom: 6 }}>{title}</h1>
        <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 460 }}>{desc}</p>
      </div>

      {/* Upsell banner — shown when the store doesn't own this add-on */}
      {!owned && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "#f4ecd4", border: "1px solid rgba(184,147,74,0.35)", borderRadius: 14, padding: "16px 18px", marginBottom: 22 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.9"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
              <span style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#b8934a", fontWeight: 700 }}>Add-on Berbayar</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#0D1117", fontFamily: "var(--font-hanken)" }}>{ADDON_LABEL[addOn]}</span>
            </div>
            <p style={{ fontSize: 12.5, color: "#7a6f57", lineHeight: 1.6, margin: 0 }}>
              Lihat kemampuannya di bawah. Untuk mulai memakainya, aktifkan add-on ini (biaya tambahan per bulan) lewat tombol <b>Paket</b> di atas — tim Sterith akan memprosesnya.
            </p>
          </div>
        </div>
      )}

      {/* Capability cards — "here's what it does" */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {caps.map((c, i) => (
          <div key={c.title} style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, padding: "16px 16px", opacity: owned ? 1 : 0.96 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: "#f1e7cd", color: "#96762f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-garamond)", flexShrink: 0 }}>{i + 1}</span>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "#0D1117", fontFamily: "var(--font-hanken)" }}>{c.title}</p>
            </div>
            <p style={{ fontSize: 12, color: "#8f897a", lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11.5, color: "#b0a99a", marginTop: 20, fontStyle: "italic" }}>
        Modul ini sedang dikembangkan — tampilan &amp; fitur dapat berubah.
      </p>
    </div>
  );
}
