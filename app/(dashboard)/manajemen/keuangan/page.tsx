export default function KeuanganPage() {
  return (
    <div style={{ padding: "32px 36px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.5">
            <path d="M2 17a5 5 0 0010 0c0-2.76-2.5-5-5-3a5 5 0 01-5 3z"/><path d="M12 17a5 5 0 0010 0c0-2.76-2.5-5-5-3a5 5 0 01-5 3z"/><path d="M6.28 12.7C6.45 12.04 7.14 12 7.5 12c1.83 0 3.09 1.71 4.5 3"/><path d="M12 9.5C11.21 8.2 10.1 7 8.5 7S5 8.17 5 9.5c0 1.08.78 2 1.78 2.5"/>
          </svg>
        </div>
        <p style={{ fontFamily: "var(--font-garamond)", fontSize: 26, fontWeight: 500, color: "#14203a", marginBottom: 8 }}>
          Segera hadir
        </p>
        <p style={{ fontSize: 13.5, color: "#8f897a", lineHeight: 1.6, maxWidth: 320 }}>
          Modul keuangan sedang dalam pengembangan. Termasuk laporan laba rugi, analisis margin, dan proyeksi arus kas.
        </p>
      </div>
    </div>
  );
}
