"use client";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useUIStore } from "@/store/ui";

interface Product {
  id: string; name: string; sku: string; unit: string; category: string;
  price: number; storeQty: number; warehouseQty: number; photoUrl: string | null;
}

const CATS = ["Sembako", "Minuman", "Snack", "Rokok"];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
}

export default function ProdukModal() {
  const { modal, editProductId, closeModal } = useUIStore();
  const [form, setForm] = useState({ name: "", sku: "", unit: "pcs", category: "Sembako", price: "", storeQty: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const open = modal === "produk";
  const isEdit = !!editProductId;

  useEffect(() => {
    if (open && editProductId) {
      fetch(`/api/products/${editProductId}`)
        .then(r => r.json())
        .then((p: Product) => {
          if (p?.id) setForm({ name: p.name, sku: p.sku, unit: p.unit, category: p.category, price: String(p.price), storeQty: String(p.storeQty) });
        })
        .catch(() => {});
    } else if (open && !editProductId) {
      setForm({ name: "", sku: "", unit: "pcs", category: "Sembako", price: "", storeQty: "" });
    }
  }, [open, editProductId]);

  function handleClose() { closeModal(); }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSubmitting(true);
    const body = { name: form.name, sku: form.sku, unit: form.unit, category: form.category, price: parseInt(form.price) || 0, storeQty: parseInt(form.storeQty) || 0 };
    if (isEdit) {
      await fetch(`/api/products/${editProductId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setSubmitting(false);
    handleClose();
  }

  async function handleDelete() {
    if (!editProductId || !confirm("Hapus produk ini?")) return;
    setDeleting(true);
    await fetch(`/api/products/${editProductId}`, { method: "DELETE" });
    setDeleting(false);
    handleClose();
  }

  if (!open) return null;

  return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(20,32,58,0.45)", zIndex: 1000 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 480, maxWidth: "95vw", maxHeight: "90vh",
        background: "#fff", borderRadius: 16, zIndex: 1001,
        display: "flex", flexDirection: "column",
        boxShadow: "0 20px 80px rgba(20,32,58,0.22)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #f0ebe0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#b8934a", fontWeight: 600 }}>
              {isEdit ? "EDIT PRODUK" : "PRODUK BARU"}
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#0D1117", marginTop: 3 }}>
              {isEdit ? (form.name || "Produk") : "Tambah produk baru"}
            </p>
          </div>
          <button onClick={handleClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "#8f897a", borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px" }}>
          {/* Photo + upload */}
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 22 }}>
            <div style={{ width: 80, height: 80, borderRadius: 12, background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "var(--font-garamond)", fontSize: 28, fontWeight: 500, color: "#c9a55f" }}>{form.name ? initials(form.name) : "?"}</span>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ flex: 1, height: 80, border: "2px dashed #e8d9b8", borderRadius: 12, background: "#f8f6ef", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span style={{ fontSize: 12.5, color: "#b8934a", fontWeight: 500 }}>Unggah foto produk</span>
              <span style={{ fontSize: 11, color: "#8f897a" }}>JPG / PNG · maks 2 MB</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} />
          </div>

          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7 }}>NAMA PRODUK</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="mis. Beras Pandan 5kg"
              style={{ width: "100%", height: 44, border: "1.5px solid #e8e3d5", borderRadius: 10, padding: "0 14px", fontSize: 14, color: "#0D1117", fontFamily: "var(--font-hanken)", background: "#fff" }} />
          </div>

          {/* SKU + Unit */}
          <div className="bo-cols-2" style={{ gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7 }}>SKU</label>
              <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                placeholder="mis. BRS001"
                style={{ width: "100%", height: 44, border: "1.5px solid #e8e3d5", borderRadius: 10, padding: "0 14px", fontSize: 14, color: "#0D1117", fontFamily: "var(--font-hanken)", background: "#fff" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7 }}>SATUAN</label>
              <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                placeholder="mis. karung"
                style={{ width: "100%", height: 44, border: "1.5px solid #e8e3d5", borderRadius: 10, padding: "0 14px", fontSize: 14, color: "#0D1117", fontFamily: "var(--font-hanken)", background: "#fff" }} />
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7 }}>KATEGORI</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, category: c })) } style={{
                  height: 34, padding: "0 14px", borderRadius: 99,
                  background: form.category === c ? "#0D1117" : "#fff",
                  border: `1.5px solid ${form.category === c ? "#0D1117" : "#e8e3d5"}`,
                  color: form.category === c ? "#f8f6ef" : "#0D1117",
                  fontSize: 13, fontWeight: form.category === c ? 600 : 400,
                  cursor: "pointer", fontFamily: "var(--font-hanken)",
                }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Price + Stock */}
          <div className="bo-cols-2" style={{ gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7 }}>HARGA JUAL (Rp)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0"
                style={{ width: "100%", height: 44, border: "1.5px solid #e8e3d5", borderRadius: 10, padding: "0 14px", fontSize: 14, color: "#0D1117", fontFamily: "var(--font-garamond)", background: "#fff" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7 }}>STOK TOKO</label>
              <input type="number" value={form.storeQty} onChange={e => setForm(f => ({ ...f, storeQty: e.target.value }))}
                placeholder="0"
                style={{ width: "100%", height: 44, border: "1.5px solid #e8e3d5", borderRadius: 10, padding: "0 14px", fontSize: 14, color: "#0D1117", fontFamily: "var(--font-garamond)", background: "#fff" }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid #f0ebe0", display: "flex", alignItems: "center", flexShrink: 0 }}>
          {isEdit && (
            <button onClick={handleDelete} disabled={deleting}
              style={{ fontSize: 12.5, color: "#b0492f", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500, fontFamily: "var(--font-hanken)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              Hapus produk
            </button>
          )}
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleClose} style={{ height: 40, padding: "0 18px", background: "#fff", border: "1.5px solid #e8e3d5", borderRadius: 10, fontSize: 13, color: "#0D1117", cursor: "pointer", fontFamily: "var(--font-hanken)" }}>
              Batal
            </button>
            <button onClick={handleSave} disabled={submitting || !form.name.trim()}
              style={{ height: 40, padding: "0 20px", background: form.name.trim() ? "#0D1117" : "#e8e3d5", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: form.name.trim() ? "#f8f6ef" : "#8f897a", cursor: form.name.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-hanken)" }}>
              {submitting ? "Menyimpan…" : "Simpan →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
