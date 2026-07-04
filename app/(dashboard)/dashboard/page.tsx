export default function DashboardPage() {
  return (
    <div style={{ padding: "32px 36px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </div>
        <p style={{ fontFamily: "var(--font-garamond)", fontSize: 26, fontWeight: 500, color: "#14203a", marginBottom: 8 }}>
          Dashboard — segera hadir
        </p>
        <p style={{ fontSize: 13.5, color: "#8f897a", lineHeight: 1.6, maxWidth: 320 }}>
          Ringkasan performa bisnis, grafik penjualan harian, dan metrik utama dalam satu tampilan.
        </p>
      </div>
    </div>
  );
}
