"use client";

interface Props {
  requiredTier?: "business" | "enterprise";
  requiredAddOn?: "inventori" | "crm";
}

const COPY: Record<string, { label: string; desc: string }> = {
  business:   { label: "Business",   desc: "Upgrade ke Business untuk mengakses fitur ini, termasuk inventori dua tingkat, transfer stok, dan manajemen staf." },
  enterprise: { label: "Enterprise", desc: "Upgrade ke Enterprise untuk mengakses modul keuangan, laporan laba rugi, dan manajemen multi-bisnis." },
  inventori:  { label: "Inventori Lengkap", desc: "Aktifkan add-on Inventori Lengkap untuk Gudang, Toko dua tingkat, Stok Opname, Riwayat, Transfer, dan Scan AI. Ajukan lewat tombol paket di atas." },
  crm:        { label: "CRM + Loyalti", desc: "Aktifkan add-on CRM + Loyalti untuk data pelanggan dan program loyalti. Ajukan lewat tombol paket di atas." },
};

export default function LockedSection({ requiredTier, requiredAddOn }: Props) {
  const { label, desc } = COPY[requiredAddOn ?? requiredTier ?? "business"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "60px 40px", textAlign: "center" }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.8">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>
      <span style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#b8934a", fontWeight: 700, background: "#f1e7cd", padding: "3px 10px", borderRadius: 99, marginBottom: 16, display: "inline-block" }}>
        {label.toUpperCase()} DIPERLUKAN
      </span>
      <h2 style={{ fontFamily: "var(--font-garamond)", fontSize: 30, fontWeight: 500, color: "#0D1117", marginBottom: 10, lineHeight: 1.2 }}>
        Fitur ini terkunci
      </h2>
      <p style={{ fontSize: 13.5, color: "#8f897a", maxWidth: 360, lineHeight: 1.7 }}>
        {desc}
      </p>
    </div>
  );
}
