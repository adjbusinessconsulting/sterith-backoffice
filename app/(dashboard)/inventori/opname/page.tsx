"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { hasAddOn } from "@/lib/addons";
import InventoriDemo from "@/components/InventoriDemo";

interface Product {
  id: string; name: string; sku: string; warehouseQty: number; storeQty: number;
}

interface OpnameLine {
  productId: string;
  name: string;
  sku: string;
  systemQty: number;
  physicalQty: number | null;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
}

export default function OpnamePage() {
  const { data: session } = useSession();
  const hasInv = hasAddOn(session?.user?.addOns, "inventori");
  const [location, setLocation] = useState<"WAREHOUSE" | "STORE">("WAREHOUSE");
  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<OpnameLine[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!hasInv) return;
    fetch("/api/products")
      .then(r => r.json())
      .then((data: Product[]) => {
        if (!Array.isArray(data)) return;
        setProducts(data);
        setLines(data.map(p => ({
          productId: p.id,
          name: p.name,
          sku: p.sku,
          systemQty: location === "WAREHOUSE" ? p.warehouseQty : p.storeQty,
          physicalQty: null,
        })));
      })
      .catch(() => {});
  }, [location, hasInv]);

  function setPhysical(productId: string, val: string) {
    setLines(prev => prev.map(l => l.productId === productId ? { ...l, physicalQty: val === "" ? null : parseInt(val) || 0 } : l));
  }

  async function handleSubmit() {
    setSubmitting(true);
    const payload = {
      location,
      lines: lines.map(l => ({ productId: l.productId, physicalQty: l.physicalQty ?? l.systemQty })),
    };
    const res = await fetch("/api/opname", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSubmitting(false);
    if (res.ok) setSubmitted(true);
  }

  if (!hasInv) return <InventoriDemo section="opname" />;

  if (submitted) {
    return (
      <div style={{ padding: "80px 36px", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#e9f1ea", border: "1.5px solid #3f7d54", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3f7d54" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <p style={{ fontFamily: "var(--font-garamond)", fontSize: 22, color: "#14203a", marginBottom: 8 }}>Opname dikirim</p>
        <p style={{ fontSize: 13, color: "#8f897a", marginBottom: 24 }}>Menunggu persetujuan owner untuk diterapkan.</p>
        <button onClick={() => setSubmitted(false)} style={{ height: 40, padding: "0 20px", background: "#14203a", color: "#f8f6ef", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>
          Opname baru
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>
          INVENTORI · STOK OPNAME
        </p>
        <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#14203a", lineHeight: 1.15, marginBottom: 6 }}>
          Stok opname {location === "WAREHOUSE" ? "gudang" : "toko"}
        </h1>
        <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6 }}>
          Hitung fisik, bandingkan dengan sistem, lalu setujui angka yang benar.
        </p>
      </div>

      {/* Location toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["WAREHOUSE", "STORE"] as const).map(loc => (
          <button key={loc} onClick={() => setLocation(loc)} style={{
            height: 36, padding: "0 16px", borderRadius: 99,
            background: location === loc ? "#14203a" : "#fff",
            border: `1.5px solid ${location === loc ? "#14203a" : "#e8e3d5"}`,
            color: location === loc ? "#f8f6ef" : "#14203a",
            fontSize: 13, fontWeight: location === loc ? 600 : 400,
            cursor: "pointer", fontFamily: "var(--font-hanken)",
          }}>
            {loc === "WAREHOUSE" ? "Gudang" : "Toko"}
          </button>
        ))}
      </div>

      {/* Warning banner */}
      <div style={{
        background: "#f3ead0", border: "1px solid #e7c987", borderRadius: 10,
        padding: "12px 16px", marginBottom: 22,
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5772a" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 1 }}>
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <p style={{ fontSize: 12.5, color: "#a5772a", lineHeight: 1.6 }}>
          Penyesuaian stok butuh persetujuan owner. Selisih akan tercatat di riwayat.
        </p>
      </div>

      {/* Opname table */}
      <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f0ebe0" }}>
              {["PRODUK", "STOK SISTEM", "HITUNG FISIK", "SELISIH"].map(h => (
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
            {lines.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "40px 16px", textAlign: "center", color: "#8f897a", fontSize: 13 }}>
                  Memuat produk...
                </td>
              </tr>
            )}
            {lines.map(l => {
              const selisih = l.physicalQty !== null ? l.physicalQty - l.systemQty : null;
              return (
                <tr key={l.productId} style={{ borderBottom: "1px solid #f8f5ef" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontFamily: "var(--font-garamond)", fontSize: 13, fontWeight: 600, color: "#b8934a" }}>{initials(l.name)}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 13.5, fontWeight: 500, color: "#14203a" }}>{l.name}</p>
                        <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 1 }}>{l.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontFamily: "var(--font-garamond)", fontSize: 20, fontWeight: 500, color: "#14203a" }}>{l.systemQty}</span>
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <input
                      type="number" min="0"
                      value={l.physicalQty === null ? "" : l.physicalQty}
                      onChange={e => setPhysical(l.productId, e.target.value)}
                      placeholder="—"
                      style={{
                        width: 80, height: 36,
                        border: "1.5px solid #e8e3d5", borderRadius: 8,
                        padding: "0 10px", textAlign: "center",
                        fontSize: 14, color: "#14203a",
                        fontFamily: "var(--font-garamond)",
                        background: l.physicalQty !== null ? "#fff" : "#f8f6ef",
                      }}
                    />
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {selisih !== null ? (
                      <span style={{
                        fontFamily: "var(--font-garamond)", fontSize: 18, fontWeight: 500,
                        color: selisih === 0 ? "#3f7d54" : selisih > 0 ? "#14203a" : "#b0492f",
                      }}>
                        {selisih > 0 ? "+" : ""}{selisih}
                      </span>
                    ) : (
                      <span style={{ color: "#8f897a", fontSize: 14 }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          onClick={handleSubmit}
          disabled={submitting || lines.every(l => l.physicalQty === null)}
          style={{
            height: 42, padding: "0 24px",
            background: "#14203a", border: "none",
            borderRadius: 10, fontSize: 13, fontWeight: 600,
            color: "#f8f6ef", cursor: "pointer",
            opacity: lines.every(l => l.physicalQty === null) ? 0.5 : 1,
            fontFamily: "var(--font-hanken)",
          }}
        >
          {submitting ? "Mengirim…" : "Kirim untuk disetujui →"}
        </button>
      </div>
    </div>
  );
}
