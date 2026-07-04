"use client";
import { useUIStore } from "@/store/ui";

interface Product {
  id: string; name: string; warehouseQty: number; storeQty: number; threshold: number; category: string;
}

interface Props {
  data: {
    itemAktif: number; stokRendah: number; transferHariIni: number; transferQty: number;
    rusakBulanIni: number; warehouseSKU: number; storeSKU: number; supplierCount: number;
    lowStockProducts: Product[];
  };
}

function KpiCard({ label, value, sub, valueColor }: { label: string; value: number | string; sub: string; valueColor?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, padding: "20px 22px", flex: 1 }}>
      <p style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 10 }}>{label}</p>
      <p style={{ fontFamily: "var(--font-garamond)", fontSize: 40, fontWeight: 500, color: valueColor ?? "#14203a", lineHeight: 1, marginBottom: 6, fontFeatureSettings: '"onum"' }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: "#8f897a" }}>{sub}</p>
    </div>
  );
}

function FlowNode({ icon, label, sub, active }: { icon: React.ReactNode; label: string; sub: string; active?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: active ? "#14203a" : "#f8f6ef",
        border: `1.5px solid ${active ? "#14203a" : "#e8e3d5"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#14203a" }}>{label}</p>
        <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 2 }}>{sub}</p>
      </div>
    </div>
  );
}

function FlowArrow({ label, badge }: { label: string; badge: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, paddingTop: 6 }}>
      <div style={{
        background: "#f1e7cd", border: "1px solid #e7c987", borderRadius: 99,
        padding: "2px 10px", fontSize: 10, fontWeight: 600, color: "#b8934a",
        letterSpacing: "0.06em", whiteSpace: "nowrap",
      }}>
        {badge}
      </div>
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        <div style={{ flex: 1, height: 1, background: "#e8e3d5" }} />
        <svg width="8" height="8" viewBox="0 0 8 8" style={{ marginLeft: -1 }}>
          <path d="M0 4h7M4 1l3 3-3 3" stroke="#c4bfb3" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p style={{ fontSize: 10.5, color: "#8f897a", whiteSpace: "nowrap" }}>{label}</p>
    </div>
  );
}

export default function RingkasanClient({ data }: Props) {
  const openModal = useUIStore(s => s.openModal);

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200 }}>
      {/* Breadcrumb + title */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>
            INVENTORI · RINGKASAN
          </p>
          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#14203a", lineHeight: 1.15, marginBottom: 6 }}>
            Ringkasan inventori
          </h1>
          <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 340 }}>
            Pantau alur stok gudang dan toko secara real-time.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <a href="/inventori/opname" style={{ textDecoration: "none" }}>
            <button style={{
              height: 40, padding: "0 18px",
              background: "#fff", border: "1.5px solid #e8e3d5",
              borderRadius: 10, fontSize: 13, fontWeight: 500,
              color: "#14203a", cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              fontFamily: "var(--font-hanken)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              Stok Opname
            </button>
          </a>
          <button
            onClick={() => openModal("stokMasuk")}
            style={{
              height: 40, padding: "0 18px",
              background: "#14203a", border: "none",
              borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: "#f8f6ef", cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              fontFamily: "var(--font-hanken)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
            Stok Masuk
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
        <KpiCard label="ITEM AKTIF" value={data.itemAktif} sub="SKU terdaftar" />
        <KpiCard label="STOK RENDAH" value={data.stokRendah} sub="perlu tindakan" valueColor="#b8934a" />
        <KpiCard label="TRANSFER HARI INI" value={data.transferHariIni} sub={`${data.transferQty} item ke toko`} />
        <KpiCard label="RUSAK / HILANG" value={data.rusakBulanIni} sub="bulan ini" valueColor={data.rusakBulanIni > 0 ? "#b0492f" : "#14203a"} />
      </div>

      {/* Stock flow diagram */}
      <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 14, padding: "24px 28px", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600 }}>
            ALUR STOK · DUA TINGKAT
          </p>
          <p style={{ fontSize: 11.5, color: "#8f897a" }}>Supplier → Gudang → Toko → Penjualan</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <FlowNode
            label="Supplier"
            sub={`${data.supplierCount} pemasok`}
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8f897a" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
          />
          <FlowArrow badge="STOK MASUK" label="manual / AI scan" />
          <FlowNode
            label="Gudang"
            sub={`${data.warehouseSKU} SKU`}
            active
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f8f6ef" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>}
          />
          <FlowArrow badge="TRANSFER" label="owner / staf" />
          <FlowNode
            label="Toko"
            sub={`${data.storeSKU} SKU`}
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8f897a" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
          />
          <FlowArrow badge="PENJUALAN" label="via POS kasir" />
          <FlowNode
            label="Pelanggan"
            sub="real-time"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8f897a" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
          />
        </div>
      </div>

      {/* Low stock alert */}
      {data.lowStockProducts.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 14, padding: "20px 24px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#a5772a", fontWeight: 600, marginBottom: 14 }}>
            STOK RENDAH · PERLU TINDAKAN
          </p>
          {data.lowStockProducts.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid #f0ebe0" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "var(--font-garamond)", fontSize: 13, fontWeight: 600, color: "#b8934a" }}>
                  {p.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#14203a" }}>{p.name}</p>
                <p style={{ fontSize: 11.5, color: "#8f897a" }}>{p.category}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "var(--font-garamond)", fontSize: 18, fontWeight: 500, color: "#a5772a" }}>{p.warehouseQty + p.storeQty}</p>
                <p style={{ fontSize: 10.5, color: "#8f897a" }}>min {p.threshold}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
