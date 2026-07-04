"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUIStore } from "@/store/ui";

interface Product {
  id: string; name: string; sku: string; warehouseQty: number;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
}

export default function TransferModal() {
  const { modal, closeModal } = useUIStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const open = modal === "transfer";

  useEffect(() => {
    if (open) {
      fetch("/api/products?location=warehouse")
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setProducts(data); })
        .catch(() => {});
    }
  }, [open]);

  function handleClose() { closeModal(); setQuantities({}); }

  function setQty(id: string, val: string) {
    const n = parseInt(val) || 0;
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, n) }));
  }

  const hasItems = Object.values(quantities).some(q => q > 0);

  async function handleConfirm() {
    setSubmitting(true);
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([productId, qty]) => ({ productId, qty }));
    await fetch("/api/stock/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    setSubmitting(false);
    handleClose();
  }

  if (!open) return null;

  return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(20,32,58,0.45)", zIndex: 1000 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 560, maxWidth: "95vw", maxHeight: "85vh",
        background: "#fff", borderRadius: 16, zIndex: 1001,
        display: "flex", flexDirection: "column",
        boxShadow: "0 20px 80px rgba(20,32,58,0.22)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #f0ebe0", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f8f6ef", border: "1.5px solid #e8e3d5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14203a" strokeWidth="1.8"><path d="M7 16l-4-4 4-4M17 8l4 4-4 4M3 12h18"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#14203a" }}>Transfer stok ke toko</p>
            <p style={{ fontSize: 12, color: "#8f897a", marginTop: 1 }}>Gudang → Toko · sinkron real-time</p>
          </div>
          <button onClick={handleClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "#8f897a", borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>

        {/* Product list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <tr style={{ borderBottom: "1px solid #f0ebe0" }}>
                <th style={{ padding: "10px 18px", textAlign: "left", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600 }}>PRODUK</th>
                <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600 }}>STOK GUDANG</th>
                <th style={{ padding: "10px 18px", textAlign: "right", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600 }}>KIRIM</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f8f5ef" }}>
                  <td style={{ padding: "12px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontFamily: "var(--font-garamond)", fontSize: 12, fontWeight: 600, color: "#b8934a" }}>{initials(p.name)}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 13.5, fontWeight: 500, color: "#14203a" }}>{p.name}</p>
                        <p style={{ fontSize: 11, color: "#8f897a", marginTop: 1 }}>{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <span style={{ fontFamily: "var(--font-garamond)", fontSize: 18, fontWeight: 500, color: "#14203a" }}>{p.warehouseQty}</span>
                  </td>
                  <td style={{ padding: "10px 18px", textAlign: "right" }}>
                    <input
                      type="number" min="0" max={p.warehouseQty}
                      value={quantities[p.id] ?? ""}
                      onChange={e => setQty(p.id, e.target.value)}
                      placeholder="0"
                      style={{
                        width: 72, height: 36,
                        border: `1.5px solid ${quantities[p.id] ? "#14203a" : "#e8e3d5"}`,
                        borderRadius: 8, padding: "0 10px", textAlign: "center",
                        fontSize: 14, fontFamily: "var(--font-garamond)", color: "#14203a",
                        background: "#fff",
                      }}
                    />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: "40px 16px", textAlign: "center", color: "#8f897a", fontSize: 13 }}>
                    Tidak ada produk di gudang
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #f0ebe0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <p style={{ fontSize: 12.5, color: "#8f897a" }}>
            {hasItems ? `${Object.values(quantities).filter(q => q > 0).length} produk dipilih` : "Isi jumlah untuk transfer"}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleClose} style={{ height: 40, padding: "0 18px", background: "#fff", border: "1.5px solid #e8e3d5", borderRadius: 10, fontSize: 13, color: "#14203a", cursor: "pointer", fontFamily: "var(--font-hanken)" }}>
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={!hasItems || submitting}
              style={{
                height: 40, padding: "0 20px",
                background: hasItems ? "#14203a" : "#e8e3d5", border: "none",
                borderRadius: 10, fontSize: 13, fontWeight: 600,
                color: hasItems ? "#f8f6ef" : "#8f897a", cursor: hasItems ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-hanken)",
              }}
            >
              {submitting ? "Mentransfer…" : "Konfirmasi transfer →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
