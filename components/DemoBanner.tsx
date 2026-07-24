"use client";
import { ADDON_LABEL, type AddOnKey } from "@/lib/addons";

/**
 * Banner shown on add-on DEMO pages. When the store doesn't own the add-on it's
 * a gold upsell ("this is a demo — activate to use your own data"); when owned it's
 * a quiet note that the data is still sample while the module is being built.
 */
export default function DemoBanner({ owned, addOn, storeName }: { owned: boolean; addOn: AddOnKey; storeName: string }) {
  if (owned) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#f4f1ea", border: "1px solid #e8e3d5", borderRadius: 12, padding: "10px 14px", marginBottom: 18 }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: "#8f897a", flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: "#8f897a", margin: 0 }}>Data contoh — modul sedang dikembangkan; segera memakai data toko Anda.</p>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#f4ecd4", border: "1px solid rgba(184,147,74,0.35)", borderRadius: 14, padding: "13px 16px", marginBottom: 20 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.9"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
          <span style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#b8934a", fontWeight: 700 }}>Mode Demo · Add-on Berbayar</span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0D1117", fontFamily: "var(--font-hanken)" }}>{ADDON_LABEL[addOn]}</span>
        </div>
        <p style={{ fontSize: 12.5, color: "#7a6f57", lineHeight: 1.6, margin: 0 }}>
          Ini pratinjau dengan data contoh (<b>{storeName}</b>). Coba jelajahi — untuk memakainya dengan katalog toko Anda, aktifkan add-on ini lewat tombol <b>Paket</b> di atas.
        </p>
      </div>
    </div>
  );
}
