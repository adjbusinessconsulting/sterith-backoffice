"use client";
import { useState, useEffect, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { useUIStore } from "@/store/ui";

interface StaffMember {
  id: string; name: string; role: string; createdAt: string;
}
interface Shift {
  id: string; name: string; startTime: string; endTime: string; assignedId: string | null;
  assigned?: { name: string } | null;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
}

const ROLE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  OWNER:   { label: "Pemilik", color: "#14203a", bg: "#f1e7cd" },
  MANAJER: { label: "Manajer", color: "#2a5f78", bg: "#e4f0f5" },
  KASIR:   { label: "Kasir",   color: "#3f7d54", bg: "#e9f1ea" },
};

const ROLE_PERMS: Record<string, string> = {
  OWNER: "Akses penuh · semua modul",
  MANAJER: "Inventori · Laporan",
  KASIR: "POS · Kas laci",
};

export default function StafPage() {
  const openModal = useUIStore(s => s.openModal);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const load = useCallback(() => {
    fetch("/api/staff").then(r => r.json()).then(d => { if (Array.isArray(d)) setStaff(d); }).catch(() => {});
    fetch("/api/shifts").then(r => r.json()).then(d => { if (Array.isArray(d)) setShifts(d); }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteStaff(id: string) {
    if (!confirm("Hapus akun ini?")) return;
    await fetch(`/api/staff/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>
            MANAJEMEN · STAF & AKSES
          </p>
          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#14203a", lineHeight: 1.15, marginBottom: 6 }}>
            Staf & hak akses
          </h1>
          <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6 }}>
            Buat akun kasir, atur peran, dan jadwalkan shift.
          </p>
        </div>
        <button
          onClick={() => openModal("tambahKasir")}
          style={{
            height: 40, padding: "0 18px",
            background: "#14203a", border: "none",
            borderRadius: 10, fontSize: 13, fontWeight: 600,
            color: "#f8f6ef", cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
            fontFamily: "var(--font-hanken)", flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
          Tambah kasir
        </button>
      </div>

      {/* Accounts table */}
      <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0ebe0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: "#14203a" }}>AKUN ({staff.length})</p>
          <p style={{ fontSize: 11.5, color: "#8f897a" }}>Kasir masuk lewat POS dengan PIN 4-digit</p>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f0ebe0" }}>
              {["NAMA", "PERAN", "PIN", "IZIN UTAMA", ""].map(h => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left",
                  fontSize: 9.5, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "#8f897a", fontWeight: 600,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map(s => {
              const rs = ROLE_STYLES[s.role] ?? { label: s.role, color: "#8f897a", bg: "#f0ebe0" };
              return (
                <tr key={s.id} style={{ borderBottom: "1px solid #f8f5ef" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "#14203a",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <span style={{ fontFamily: "var(--font-garamond)", fontSize: 13, fontWeight: 700, color: "#f8f6ef" }}>{initials(s.name)}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 13.5, fontWeight: 500, color: "#14203a" }}>{s.name}</p>
                        <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 1 }}>{rs.label === "Pemilik" ? "Pemilik toko" : "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: rs.color, background: rs.bg, padding: "3px 10px", borderRadius: 99 }}>
                      {rs.label}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ letterSpacing: "0.2em", fontSize: 14, color: "#8f897a" }}>• • • •</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12.5, color: "#14203a" }}>{ROLE_PERMS[s.role] ?? "—"}</span>
                  </td>
                  <td style={{ padding: "14px 10px", width: 40 }}>
                    {s.role !== "OWNER" && (
                      <button
                        onClick={() => deleteStaff(s.id)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "#8f897a", borderRadius: 6 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Shifts */}
      <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0ebe0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: "#14203a" }}>SHIFT TOKO</p>
          <button style={{
            height: 34, padding: "0 14px",
            background: "#f8f6ef", border: "1.5px solid #e8e3d5",
            borderRadius: 8, fontSize: 12, fontWeight: 500,
            color: "#14203a", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            fontFamily: "var(--font-hanken)",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
            Tambah shift
          </button>
        </div>
        <div style={{ padding: "8px" }}>
          {shifts.map(sh => (
            <div key={sh.id} style={{
              display: "flex", alignItems: "center",
              padding: "12px 12px", borderRadius: 8,
              borderBottom: "1px solid #f8f5ef",
              gap: 14,
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "#14203a" }}>{sh.name}</p>
                <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 2 }}>
                  {sh.startTime} – {sh.endTime}
                </p>
              </div>
              <p style={{ fontSize: 12.5, color: "#8f897a" }}>
                {sh.assigned?.name ?? sh.assignedId ?? "Belum ditugaskan"}
              </p>
            </div>
          ))}
          {shifts.length === 0 && (
            <p style={{ padding: "20px 12px", textAlign: "center", fontSize: 13, color: "#8f897a" }}>
              Belum ada shift
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
