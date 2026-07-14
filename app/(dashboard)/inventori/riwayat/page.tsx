"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { hasAddOn } from "@/lib/addons";
import InventoriDemo from "@/components/InventoriDemo";

interface Movement {
  id: string;
  type: string;
  productId: string;
  qty: number;
  fromLoc: string | null;
  toLoc: string | null;
  byUserId: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
  product?: { name: string; sku: string };
  byUser?: { name: string };
}

const TYPE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  MASUK:    { label: "Stok masuk", color: "#3f7d54", bg: "#e9f1ea" },
  TRANSFER: { label: "Transfer",   color: "#2a5f78", bg: "#e4f0f5" },
  TERJUAL:  { label: "Terjual",    color: "#8f897a", bg: "#f0ebe0" },
  RUSAK:    { label: "Rusak",      color: "#b0492f", bg: "#f4e9e4" },
  OPNAME:   { label: "Opname",     color: "#6b5c9e", bg: "#eeeaf6" },
};

function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function locLabel(from: string | null, to: string | null) {
  if (from === "WAREHOUSE" && to === "STORE") return "Gudang→Toko";
  if (from === "WAREHOUSE") return "Gudang";
  if (from === "STORE") return "Toko";
  if (to === "WAREHOUSE") return "Gudang";
  if (to === "STORE") return "Toko";
  return "—";
}

const TYPES = ["Semua", "MASUK", "TRANSFER", "TERJUAL", "RUSAK", "OPNAME"];

export default function RiwayatPage() {
  const { data: session } = useSession();
  const hasInv = hasAddOn(session?.user?.addOns, "inventori");
  const [movements, setMovements] = useState<Movement[]>([]);
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasInv) return;
    setLoading(true);
    const params = typeFilter !== "Semua" ? `?type=${typeFilter}` : "";
    fetch(`/api/movements${params}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMovements(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [typeFilter, hasInv]);

  if (!hasInv) return <InventoriDemo section="riwayat" />;

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>
          INVENTORI · RIWAYAT STOK
        </p>
        <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#14203a", lineHeight: 1.15, marginBottom: 6 }}>
          Riwayat pergerakan stok
        </h1>
        <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6 }}>
          Semua stok masuk, transfer, penjualan, dan penyesuaian.
        </p>
      </div>

      {/* Type filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TYPES.map(t => {
          const style = t !== "Semua" ? TYPE_STYLES[t] : null;
          const active = typeFilter === t;
          return (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              height: 32, padding: "0 14px", borderRadius: 99,
              background: active ? "#14203a" : "#fff",
              border: `1.5px solid ${active ? "#14203a" : "#e8e3d5"}`,
              color: active ? "#f8f6ef" : (style?.color ?? "#14203a"),
              fontSize: 12.5, fontWeight: active ? 600 : 400,
              cursor: "pointer", fontFamily: "var(--font-hanken)",
            }}>
              {t !== "Semua" ? TYPE_STYLES[t].label : "Semua"}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f0ebe0" }}>
              {["WAKTU", "TIPE", "PRODUK", "QTY", "LOKASI", "OLEH"].map(h => (
                <th key={h} style={{
                  padding: "11px 16px", textAlign: "left",
                  fontSize: 9.5, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "#8f897a", fontWeight: 600,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#8f897a", fontSize: 13 }}>
                  Memuat...
                </td>
              </tr>
            )}
            {!loading && movements.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#8f897a", fontSize: 13 }}>
                  Belum ada riwayat
                </td>
              </tr>
            )}
            {movements.map(m => {
              const ts = TYPE_STYLES[m.type] ?? { label: m.type, color: "#8f897a", bg: "#f0ebe0" };
              const qtySign = m.type === "TERJUAL" || m.type === "RUSAK" ? "-" : m.type === "MASUK" || m.type === "OPNAME" ? "+" : "";
              const metaStr = (m.meta as { supplier?: string; invoiceRef?: string } | null);
              const oleh = m.byUser?.name ?? (metaStr?.supplier ? `AI scan` : "—");
              return (
                <tr key={m.id} style={{ borderBottom: "1px solid #f8f5ef" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontFamily: "var(--font-garamond)", fontSize: 15, color: "#14203a" }}>{fmtTime(m.createdAt)}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: ts.color, background: ts.bg, padding: "3px 10px", borderRadius: 99 }}>
                      {ts.label}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "#14203a" }}>{m.product?.name ?? "—"}</p>
                    <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 1 }}>{m.product?.sku}</p>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontFamily: "var(--font-garamond)", fontSize: 18, fontWeight: 500, color: qtySign === "-" ? "#b0492f" : "#14203a" }}>
                      {qtySign}{Math.abs(m.qty)}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12.5, color: "#8f897a" }}>{locLabel(m.fromLoc, m.toLoc)}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12.5, color: "#8f897a" }}>{oleh}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
