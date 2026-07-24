"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { useUIStore } from "@/store/ui";

export default function TambahKasirModal() {
  const { modal, closeModal } = useUIStore();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState<"KASIR" | "MANAJER">("KASIR");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const open = modal === "tambahKasir";

  function handleClose() { setName(""); setPin(""); setRole("KASIR"); setError(""); closeModal(); }

  async function handleSave() {
    if (!name.trim()) { setError("Nama wajib diisi."); return; }
    if (pin.length !== 6) { setError("PIN harus 6 digit."); return; }
    setSubmitting(true); setError("");
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pin, role }),
    });
    setSubmitting(false);
    if (!res.ok) { setError("Gagal menyimpan. Coba lagi."); return; }
    handleClose();
  }

  if (!open) return null;

  return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(20,32,58,0.45)", zIndex: 1000 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 440, maxWidth: "95vw",
        background: "#fff", borderRadius: 16, zIndex: 1001,
        boxShadow: "0 20px 80px rgba(20,32,58,0.22)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #f0ebe0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#b8934a", fontWeight: 600 }}>MANAJEMEN · KASIR BARU</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#0D1117", marginTop: 3 }}>Tambah akun kasir</p>
          </div>
          <button onClick={handleClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "#8f897a", borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "22px" }}>
          {/* Name */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7 }}>NAMA KASIR</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="mis. Stevany Carolin"
              style={{ width: "100%", height: 46, border: "1.5px solid #e8e3d5", borderRadius: 10, padding: "0 14px", fontSize: 14, color: "#0D1117", fontFamily: "var(--font-hanken)", background: "#fff" }} />
          </div>

          {/* PIN — 6 boxes driven by one transparent numeric input (no spinner field) */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7 }}>PIN 6-DIGIT</label>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[0, 1, 2, 3, 4, 5].map(i => {
                  const active = i === pin.length;
                  return (
                    <div key={i} style={{
                      flex: 1, height: 52, borderRadius: 10,
                      border: `1.5px solid ${active ? "#0D1117" : "#e8e3d5"}`,
                      boxShadow: active ? "0 0 0 3px rgba(13,17,23,0.06)" : "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: pin[i] ? "#f8f6ef" : "#fff",
                      transition: "border-color 0.12s, box-shadow 0.12s",
                    }}>
                      <span style={{ fontSize: 22, color: "#0D1117" }}>{pin[i] ? "•" : ""}</span>
                    </div>
                  );
                })}
              </div>
              <input
                type="text" inputMode="numeric" autoComplete="one-time-code" aria-label="PIN 6 digit"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, border: "none", background: "transparent", cursor: "text", color: "transparent", font: "inherit" }}
              />
            </div>
            <p style={{ fontSize: 11, color: "#8f897a", marginTop: 7 }}>Kasir memakai PIN ini untuk masuk di POS.</p>
          </div>

          {/* Role */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 10 }}>PERAN</label>
            <div className="bo-cols-2" style={{ gap: 10 }}>
              {([
                { value: "KASIR" as const, label: "Kasir", desc: "Hanya jual di POS dan mengelola kas laci." },
                { value: "MANAJER" as const, label: "Manajer", desc: "Kasir + akses laporan dan stok toko." },
              ] as const).map(r => (
                <button key={r.value} onClick={() => setRole(r.value)} style={{
                  padding: "14px 16px", textAlign: "left",
                  borderRadius: 12, cursor: "pointer",
                  background: role === r.value ? "#0D1117" : "#f8f6ef",
                  border: `1.5px solid ${role === r.value ? "#0D1117" : "#e8e3d5"}`,
                }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: role === r.value ? "#f8f6ef" : "#0D1117", marginBottom: 6 }}>{r.label}</p>
                  <p style={{ fontSize: 11.5, color: role === r.value ? "rgba(248,246,239,0.65)" : "#8f897a", lineHeight: 1.5 }}>{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ fontSize: 12.5, color: "#b0492f", marginBottom: 12 }}>{error}</p>}

          {/* Footer buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={handleClose} style={{ height: 42, padding: "0 18px", background: "#fff", border: "1.5px solid #e8e3d5", borderRadius: 10, fontSize: 13, color: "#0D1117", cursor: "pointer", fontFamily: "var(--font-hanken)" }}>
              Batal
            </button>
            <button onClick={handleSave} disabled={submitting}
              style={{ height: 42, padding: "0 20px", background: "#0D1117", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#f8f6ef", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-hanken)" }}>
              {submitting ? "Menyimpan…" : "Simpan kasir →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
