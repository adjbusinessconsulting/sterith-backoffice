"use client";
import { useState, useEffect, useCallback } from "react";
import { Trash2, Pencil } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useSession } from "next-auth/react";
import { isAtLeast } from "@/lib/tier";
import LockedSection from "@/components/LockedSection";
import ManagerAccessPanel from "@/components/ManagerAccessPanel";

interface StaffMember {
  id: string; name: string; role: string; createdAt: string; hasPassword?: boolean;
}
interface Shift {
  id: string; name: string; startTime: string; endTime: string; assignedId: string | null;
  assigned?: { name: string } | null;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
}

const ROLE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  OWNER:   { label: "Pemilik", color: "#0D1117", bg: "#f1e7cd" },
  MANAJER: { label: "Manajer", color: "#2a5f78", bg: "#e4f0f5" },
  KASIR:   { label: "Kasir",   color: "#3f7d54", bg: "#e9f1ea" },
};

const ROLE_PERMS: Record<string, string> = {
  OWNER: "Akses penuh · semua modul",
  MANAJER: "Inventori · Laporan",
  KASIR: "POS · Kas laci",
};

// Short labels for the manager-access summary shown in a manager's IZIN cell.
const PERM_LABELS: Record<string, string> = {
  void: "Void", discount: "Diskon", products: "Produk", shifts: "Shift",
  cashDrawer: "Kas laci", stock: "Stok", reports: "Laporan",
};

export default function StafPage() {
  const { data: session } = useSession();
  const openModal = useUIStore(s => s.openModal);
  const dataVersion = useUIStore(s => s.dataVersion);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [mgr, setMgr] = useState<{ managerPerms: Record<string, boolean>; approvalMethod: string } | null>(null);
  const [mgrOpen, setMgrOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({ name: "", pin: "", role: "kasir", password: "" });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const userTier = session?.user?.tier ?? 'premium';

  const load = useCallback(() => {
    fetch("/api/staff").then(r => r.json()).then(d => { if (Array.isArray(d)) setStaff(d); }).catch(() => {});
    fetch("/api/shifts").then(r => r.json()).then(d => { if (Array.isArray(d)) setShifts(d); }).catch(() => {});
  }, []);

  useEffect(() => { if (isAtLeast(userTier, 'premium')) load(); }, [load, userTier, dataVersion]);
  useEffect(() => {
    if (!isAtLeast(userTier, 'premium')) return;
    fetch("/api/manager-settings").then(r => r.json()).then(d => { if (d?.managerPerms) setMgr(d); }).catch(() => {});
  }, [userTier]);
  const mgrSummary = mgr ? Object.keys(PERM_LABELS).filter(k => mgr.managerPerms[k]).map(k => PERM_LABELS[k]).join(" · ") : "";

  if (!isAtLeast(userTier, 'premium')) return <LockedSection requiredTier="business" />;

  // A manager approves POS actions with this password, so the owner needs to be
  // able to set one on an account that already exists — not only at creation.
  async function setPassword(s: StaffMember) {
    const pw = window.prompt(
      s.hasPassword
        ? `Ubah kata sandi manajer untuk ${s.name}.
Kosongkan lalu OK untuk menghapus.`
        : `Kata sandi manajer untuk ${s.name} (min. 4 karakter).`,
      "",
    );
    if (pw === null) return;                       // cancelled
    if (pw.trim() && pw.trim().length < 4) { alert("Kata sandi minimal 4 karakter."); return; }
    const res = await fetch(`/api/staff/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw.trim() }),
    });
    if (!res.ok) { alert((await res.json().catch(() => ({}))).error ?? "Gagal menyimpan."); return; }
    load();
  }

  function openEdit(s: StaffMember) {
    // PIN and password are deliberately blank. The API never sends them to the
    // browser, and PATCH leaves any field it is not given untouched — so an empty
    // box means "keep what is there" rather than "erase it".
    setForm({ name: s.name, pin: "", role: s.role.toLowerCase() === "manajer" ? "MANAJER" : "kasir", password: "" });
    setFormErr("");
    setEditing(s);
  }

  async function saveEdit() {
    if (!editing) return;
    const body: Record<string, unknown> = {};
    if (form.name.trim() && form.name.trim() !== editing.name) body.name = form.name.trim();
    if (form.pin.trim()) {
      if (!/^\d{6}$/.test(form.pin.trim())) { setFormErr("PIN harus 6 digit angka."); return; }
      body.pin = form.pin.trim();
    }
    const nextRole = form.role === "MANAJER" ? "MANAJER" : "kasir";
    if (nextRole.toLowerCase() !== editing.role.toLowerCase()) body.role = nextRole;
    if (form.password.trim()) {
      if (form.password.trim().length < 4) { setFormErr("Kata sandi minimal 4 karakter."); return; }
      body.password = form.password.trim();
    }
    // Demoting a manager clears their approval password. A kasir never uses one,
    // and leaving it behind means a promotion later silently restores a password
    // the owner has long forgotten setting.
    if (nextRole === "kasir" && editing.hasPassword) body.password = "";
    if (!Object.keys(body).length) { setEditing(null); return; }

    setSaving(true); setFormErr("");
    const res = await fetch(`/api/staff/${editing.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) { setFormErr((await res.json().catch(() => ({}))).error ?? "Gagal menyimpan."); return; }
    setEditing(null);
    load();
  }

  async function deleteStaff(id: string) {
    if (!confirm("Hapus akun ini?")) return;
    await fetch(`/api/staff/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1000 }}>
      <style>{`@media (max-width: 640px){ .bo-akun-hint{ display: none; } }`}</style>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>
            MANAJEMEN · STAF & AKSES
          </p>
          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#0D1117", lineHeight: 1.15, marginBottom: 6 }}>
            Staf & hak akses
          </h1>
          <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6 }}>
            Buat akun kasir, atur peran, dan jadwalkan shift.
          </p>
        </div>
      </div>

      {/* Accounts table */}
      <div className="bo-table-scroll" style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, marginBottom: 28 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0ebe0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: "#0D1117" }}>AKUN ({staff.length})</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <p className="bo-akun-hint" style={{ fontSize: 11.5, color: "#8f897a" }}>Kasir masuk lewat POS dengan PIN 6-digit</p>
            <button
              onClick={() => openModal("tambahKasir")}
              style={{
                height: 34, padding: "0 14px",
                background: "#f8f6ef", border: "1.5px solid #e8e3d5",
                borderRadius: 8, fontSize: 12, fontWeight: 500,
                color: "#0D1117", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                fontFamily: "var(--font-hanken)", flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
              Tambah kasir
            </button>
            {/* The only way in used to be the IZIN cell of a row whose role is
                MANAJER — so a store with no manager could not open this at all,
                even though the settings also govern what a plain kasir may do. */}
            <button
              onClick={() => setMgrOpen(true)}
              style={{
                padding: "8px 14px", background: "#fff", border: "1.5px solid #e8e3d5",
                borderRadius: 8, fontSize: 12, fontWeight: 500,
                color: "#0D1117", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                fontFamily: "var(--font-hanken)", flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Izin &amp; persetujuan
            </button>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f0ebe0" }}>
              {["NAMA", "PERAN", "PIN", "KATA SANDI", "IZIN UTAMA", ""].map(h => (
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
                        background: "#0D1117",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <span style={{ fontFamily: "var(--font-garamond)", fontSize: 13, fontWeight: 700, color: "#f8f6ef" }}>{initials(s.name)}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 13.5, fontWeight: 500, color: "#0D1117" }}>{s.name}</p>
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
                    {s.role?.toUpperCase() === "MANAJER" ? (
                      <button onClick={() => setPassword(s)} title={s.hasPassword ? "Ubah kata sandi manajer" : "Atur kata sandi manajer"}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-hanken)", fontSize: 12.5, color: s.hasPassword ? "#0D1117" : "#b8934a", fontWeight: s.hasPassword ? 400 : 600 }}>
                        {s.hasPassword ? "• • • •  Ubah" : "Atur kata sandi"}
                      </button>
                    ) : (
                      <span style={{ fontSize: 12.5, color: "#b3ada0" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {s.role?.toUpperCase() === "MANAJER" ? (
                      <button onClick={() => setMgrOpen(true)} title="Atur izin manajer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-hanken)", textAlign: "left" }}>
                        <span style={{ fontSize: 12.5, color: mgrSummary ? "#0D1117" : "#b8934a", fontWeight: mgrSummary ? 400 : 600 }}>{mgrSummary || "Atur akses"}</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8f897a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    ) : (
                      <span style={{ fontSize: 12.5, color: "#0D1117" }}>{ROLE_PERMS[s.role] ?? "—"}</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 10px", width: 40 }}>
                    {s.role !== "OWNER" && (
                      <div style={{ display: "flex", gap: 2 }}>
                      <button
                        onClick={() => openEdit(s)}
                        title="Ubah akun"
                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "#8f897a", borderRadius: 6 }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteStaff(s.id)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "#8f897a", borderRadius: 6 }}
                      >
                        <Trash2 size={14} />
                      </button>
                      </div>
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
          <p style={{ fontSize: 12.5, fontWeight: 600, color: "#0D1117" }}>SHIFT TOKO</p>
          <button onClick={() => openModal("tambahShift")} style={{
            height: 34, padding: "0 14px",
            background: "#f8f6ef", border: "1.5px solid #e8e3d5",
            borderRadius: 8, fontSize: 12, fontWeight: 500,
            color: "#0D1117", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
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
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "#0D1117" }}>{sh.name}</p>
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

      {/* Edit an existing account. Before this the only way to correct a typo in a
          name, rotate a PIN or promote a kasir was to delete the account and make a
          new one — which loses the account and everything attached to it. */}
      {editing && (
        <>
          <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, background: "rgba(13,17,23,0.45)", zIndex: 1000 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: 400, maxWidth: "95vw", background: "#fff", borderRadius: 16, zIndex: 1001,
            boxShadow: "0 20px 80px rgba(13,17,23,0.22)", overflow: "hidden",
          }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #f0ebe0" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#b8934a", fontWeight: 600 }}>MANAJEMEN · STAF</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#0D1117", marginTop: 3 }}>Ubah akun</p>
              <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 4 }}>Kosongkan PIN atau kata sandi jika tidak ingin diubah.</p>
            </div>

            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={{ display: "block" }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "#0D1117" }}>Nama</span>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: "100%", marginTop: 5, padding: "10px 12px", border: "1.5px solid #e8e3d5", borderRadius: 9, fontSize: 13.5, fontFamily: "var(--font-hanken)", color: "#0D1117" }} />
              </label>

              <label style={{ display: "block" }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "#0D1117" }}>PIN baru (6 digit)</span>
                <input value={form.pin} inputMode="numeric" maxLength={6} placeholder="Kosongkan jika tetap"
                  onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))}
                  style={{ width: "100%", marginTop: 5, padding: "10px 12px", border: "1.5px solid #e8e3d5", borderRadius: 9, fontSize: 13.5, fontFamily: "var(--font-hanken)", letterSpacing: "0.3em", color: "#0D1117" }} />
              </label>

              <div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "#0D1117" }}>Peran</span>
                <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
                  {[["kasir", "Kasir"], ["MANAJER", "Manajer"]].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setForm(f => ({ ...f, role: v }))}
                      style={{
                        flex: 1, padding: "9px 12px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                        border: form.role === v ? "1.5px solid #0D1117" : "1.5px solid #e8e3d5",
                        background: form.role === v ? "#0D1117" : "#fff",
                        color: form.role === v ? "#F2EDE3" : "#0D1117", fontFamily: "var(--font-hanken)",
                      }}>{l}</button>
                  ))}
                </div>
              </div>

              {form.role === "MANAJER" && (
                <label style={{ display: "block" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "#0D1117" }}>Kata sandi manajer</span>
                  <input value={form.password} type="password" placeholder={editing.hasPassword ? "Kosongkan jika tetap" : "Belum diatur"}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    style={{ width: "100%", marginTop: 5, padding: "10px 12px", border: "1.5px solid #e8e3d5", borderRadius: 9, fontSize: 13.5, fontFamily: "var(--font-hanken)", color: "#0D1117" }} />
                  <span style={{ fontSize: 11, color: "#8f897a", marginTop: 4, display: "block" }}>Dipakai untuk menyetujui tindakan di POS.</span>
                </label>
              )}

              {formErr && <p style={{ fontSize: 12, color: "#C0392B", margin: 0 }}>{formErr}</p>}
            </div>

            <div style={{ padding: "0 22px 20px", display: "flex", gap: 8 }}>
              <button onClick={() => setEditing(null)} disabled={saving}
                style={{ flex: 1, padding: "11px", borderRadius: 9, border: "1.5px solid #e8e3d5", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)", color: "#0D1117" }}>Batal</button>
              <button onClick={saveEdit} disabled={saving}
                style={{ flex: 1, padding: "11px", borderRadius: 9, border: "none", background: "#0D1117", color: "#F2EDE3", fontSize: 13, fontWeight: 600, cursor: saving ? "default" : "pointer", fontFamily: "var(--font-hanken)", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </>
      )}

      <ManagerAccessPanel open={mgrOpen} onClose={() => setMgrOpen(false)} onSaved={setMgr} />
    </div>
  );
}
