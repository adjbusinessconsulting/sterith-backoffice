"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const PERM_ROWS: { key: string; label: string; desc: string }[] = [
  { key: "void",       label: "Void / batalkan transaksi", desc: "Membatalkan transaksi yang sudah selesai." },
  { key: "discount",   label: "Diskon / ubah harga",       desc: "Memberi diskon atau mengubah harga saat jual." },
  { key: "products",   label: "Kelola produk",             desc: "Menambah, mengubah, atau menghapus produk." },
  { key: "shifts",     label: "Kelola shift",              desc: "Mengatur jadwal shift toko." },
  { key: "cashDrawer", label: "Kas laci",                  desc: "Kas masuk/keluar dan buka laci tanpa transaksi." },
  { key: "stock",      label: "Kelola stok",               desc: "Terima barang dan stok opname." },
  { key: "reports",    label: "Lihat laporan",             desc: "Melihat ringkasan penjualan di POS." },
];

export interface MgrSettings { managerPerms: Record<string, boolean>; approvalMethod: string; }

function Switch({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={on} style={{
      width: 44, height: 24, borderRadius: 99, border: "none", flexShrink: 0, padding: 0,
      background: on ? "#0D1117" : "#e0dccd", cursor: disabled ? "default" : "pointer",
      position: "relative", transition: "background 0.15s", opacity: disabled ? 0.5 : 1,
    }}>
      <span style={{
        position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: "50%",
        background: "#fff", transition: "left 0.15s", boxShadow: "0 1px 2px rgba(13,17,23,0.2)",
      }} />
    </button>
  );
}

// Shared manager-access settings (one set for all managers), opened from a manager's
// IZIN cell on the Staf page. Saves to stores.settings (both BO and POS read it).
export default function ManagerAccessModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: (s: MgrSettings) => void }) {
  const [mgr, setMgr] = useState<MgrSettings | null>(null);
  const [savedAt, setSavedAt] = useState(0);

  useEffect(() => {
    if (!open) return;
    fetch("/api/manager-settings").then(r => r.json()).then(d => { if (d?.managerPerms) { setMgr(d); onSaved?.(d); } }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function patch(next: { managerPerms?: Record<string, boolean>; approvalMethod?: string }) {
    if (!mgr) return;
    const optimistic = { ...mgr, ...next, managerPerms: { ...mgr.managerPerms, ...(next.managerPerms ?? {}) } };
    setMgr(optimistic); onSaved?.(optimistic);
    try {
      const r = await fetch("/api/manager-settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      const d = await r.json();
      if (d?.managerPerms) { setMgr(d); onSaved?.(d); }
      setSavedAt(Date.now());
    } catch { /* keep optimistic */ }
  }

  if (!open) return null;
  const savedRecently = savedAt > 0 && Date.now() - savedAt < 2500;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,17,23,0.45)", zIndex: 1000 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 460, maxWidth: "95vw", maxHeight: "90vh",
        background: "#fff", borderRadius: 16, zIndex: 1001, display: "flex", flexDirection: "column",
        boxShadow: "0 20px 80px rgba(13,17,23,0.22)", overflow: "hidden",
      }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #f0ebe0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#b8934a", fontWeight: 600 }}>MANAJEMEN · IZIN MANAJER</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#0D1117", marginTop: 3 }}>Akses manajer</p>
            <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 4, lineHeight: 1.5 }}>Berlaku untuk semua manajer. Butuh PIN/kata sandi manajer saat dijalankan di POS.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {savedRecently && <span style={{ fontSize: 11.5, color: "#3f7d54", fontWeight: 500 }}>✓ Tersimpan</span>}
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "#8f897a", borderRadius: 8 }}><X size={18} /></button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {PERM_ROWS.map(row => (
            <div key={row.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "13px 22px", borderBottom: "1px solid #f8f5ef" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "#0D1117" }}>{row.label}</p>
                <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 2 }}>{row.desc}</p>
              </div>
              <Switch on={!!mgr?.managerPerms[row.key]} onClick={() => patch({ managerPerms: { [row.key]: !mgr?.managerPerms[row.key] } })} disabled={!mgr} />
            </div>
          ))}

          <div style={{ padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "#0D1117" }}>Metode persetujuan</p>
              <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 2 }}>Cara manajer menyetujui tindakan di POS.</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["pin", "password"] as const).map(m => {
                const active = mgr?.approvalMethod === m;
                return (
                  <button key={m} type="button" onClick={() => patch({ approvalMethod: m })} disabled={!mgr} style={{
                    height: 32, padding: "0 14px", borderRadius: 99,
                    background: active ? "#0D1117" : "#fff",
                    border: `1.5px solid ${active ? "#0D1117" : "#e8e3d5"}`,
                    color: active ? "#f8f6ef" : "#0D1117",
                    fontSize: 12, fontWeight: active ? 600 : 400,
                    cursor: mgr ? "pointer" : "default", fontFamily: "var(--font-hanken)",
                  }}>
                    {m === "pin" ? "PIN" : "Kata sandi"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
