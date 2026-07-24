"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUIStore } from "@/store/ui";

interface Staff { id: string; name: string; role: string; }

const inputStyle: React.CSSProperties = {
  width: "100%", height: 46, border: "1.5px solid #e8e3d5", borderRadius: 10,
  padding: "0 14px", fontSize: 14, color: "#0D1117", fontFamily: "var(--font-hanken)", background: "#fff",
};

// Typed 24-hour time entry (no native AM/PM picker): insert the colon as digits are
// typed, then clamp to a valid HH:MM on blur.
function formatTime(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}
function normalizeTime(v: string): string {
  const digits = v.replace(/\D/g, "").padEnd(4, "0").slice(0, 4);
  const h = Math.min(23, parseInt(digits.slice(0, 2), 10) || 0);
  const m = Math.min(59, parseInt(digits.slice(2), 10) || 0);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function TambahShiftModal() {
  const { modal, closeModal, bumpData } = useUIStore();
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [assignedCashierId, setAssignedCashierId] = useState("");
  const [staff, setStaff] = useState<Staff[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const open = modal === "tambahShift";

  useEffect(() => {
    if (!open) return;
    setName(""); setStartTime("08:00"); setEndTime("16:00"); setAssignedCashierId(""); setError("");
    fetch("/api/staff").then(r => r.json()).then(d => { if (Array.isArray(d)) setStaff(d); }).catch(() => {});
  }, [open]);

  function handleClose() { closeModal(); }

  async function handleSave() {
    if (!name.trim()) { setError("Nama shift wajib diisi."); return; }
    if (!startTime || !endTime) { setError("Jam mulai dan selesai wajib diisi."); return; }
    setSubmitting(true); setError("");
    const res = await fetch("/api/shifts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, startTime, endTime, assignedCashierId: assignedCashierId || null }),
    });
    setSubmitting(false);
    if (!res.ok) { setError("Gagal menyimpan. Coba lagi."); return; }
    bumpData();
    handleClose();
  }

  if (!open) return null;

  return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(13,17,23,0.45)", zIndex: 1000 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 440, maxWidth: "95vw",
        background: "#fff", borderRadius: 16, zIndex: 1001,
        boxShadow: "0 20px 80px rgba(13,17,23,0.22)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #f0ebe0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#b8934a", fontWeight: 600 }}>MANAJEMEN · SHIFT BARU</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#0D1117", marginTop: 3 }}>Tambah shift toko</p>
          </div>
          <button onClick={handleClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "#8f897a", borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "22px" }}>
          {/* Name */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7 }}>NAMA SHIFT</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="mis. Shift Pagi"
              style={inputStyle} />
          </div>

          {/* Times — typed 24-hour HH:MM, like the POS (no native AM/PM picker) */}
          <div className="bo-cols-2" style={{ gap: 12, marginBottom: 6 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7 }}>JAM MULAI</label>
              <input type="text" inputMode="numeric" placeholder="08:00" maxLength={5}
                value={startTime}
                onChange={e => setStartTime(formatTime(e.target.value))}
                onBlur={() => setStartTime(v => normalizeTime(v))}
                style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7 }}>JAM SELESAI</label>
              <input type="text" inputMode="numeric" placeholder="16:00" maxLength={5}
                value={endTime}
                onChange={e => setEndTime(formatTime(e.target.value))}
                onBlur={() => setEndTime(v => normalizeTime(v))}
                style={inputStyle} />
            </div>
          </div>
          <p style={{ fontSize: 11, color: "#8f897a", margin: "0 0 18px" }}>Format 24 jam, mis. 08:00 atau 16:30.</p>

          {/* Assign cashier */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7 }}>TUGASKAN KASIR (OPSIONAL)</label>
            <select value={assignedCashierId} onChange={e => setAssignedCashierId(e.target.value)}
              style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
              <option value="">Belum ditugaskan</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {error && <p style={{ fontSize: 12.5, color: "#b0492f", marginBottom: 12 }}>{error}</p>}

          {/* Footer buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={handleClose} style={{ height: 42, padding: "0 18px", background: "#fff", border: "1.5px solid #e8e3d5", borderRadius: 10, fontSize: 13, color: "#0D1117", cursor: "pointer", fontFamily: "var(--font-hanken)" }}>
              Batal
            </button>
            <button onClick={handleSave} disabled={submitting}
              style={{ height: 42, padding: "0 20px", background: "#0D1117", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#f8f6ef", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-hanken)" }}>
              {submitting ? "Menyimpan…" : "Simpan shift →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
