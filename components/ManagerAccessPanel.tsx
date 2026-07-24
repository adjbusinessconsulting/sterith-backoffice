"use client";
import { useState, useEffect } from "react";

const PERM_ROWS: { key: string; label: string; desc: string }[] = [
  { key: "void",       label: "Void / batalkan transaksi", desc: "Membatalkan transaksi yang sudah selesai." },
  { key: "discount",   label: "Diskon / ubah harga",       desc: "Memberi diskon atau mengubah harga saat jual." },
  { key: "products",   label: "Kelola produk",             desc: "Menambah, mengubah, atau menghapus produk." },
  { key: "shifts",     label: "Kelola shift",              desc: "Mengatur jadwal shift toko." },
  { key: "cashDrawer", label: "Kas laci",                  desc: "Kas masuk/keluar dan buka laci tanpa transaksi." },
  { key: "stock",      label: "Kelola stok",               desc: "Terima barang dan stok opname." },
  { key: "reports",    label: "Lihat laporan",             desc: "Melihat ringkasan penjualan di POS." },
];

interface MgrSettings { managerPerms: Record<string, boolean>; approvalMethod: string; }

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

export default function ManagerAccessPanel() {
  const [mgr, setMgr] = useState<MgrSettings | null>(null);
  const [savedAt, setSavedAt] = useState(0);

  useEffect(() => {
    fetch("/api/manager-settings").then(r => r.json()).then(d => { if (d?.managerPerms) setMgr(d); }).catch(() => {});
  }, []);

  async function patch(next: { managerPerms?: Record<string, boolean>; approvalMethod?: string }) {
    if (!mgr) return;
    // Optimistic update so the switch responds instantly.
    setMgr({ ...mgr, ...next, managerPerms: { ...mgr.managerPerms, ...(next.managerPerms ?? {}) } });
    try {
      const r = await fetch("/api/manager-settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next),
      });
      const d = await r.json();
      if (d?.managerPerms) setMgr(d);
      setSavedAt(Date.now());
    } catch { /* keep optimistic value */ }
  }

  const savedRecently = savedAt > 0 && Date.now() - savedAt < 2500;

  return (
    <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, marginTop: 28, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0ebe0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: "#0D1117" }}>AKSES MANAJER</p>
          <p className="bo-akun-hint" style={{ fontSize: 11.5, color: "#8f897a", marginTop: 2 }}>
            Pilih tindakan yang boleh dilakukan manajer di POS. Semua mati secara bawaan.
          </p>
        </div>
        {savedRecently && <span style={{ fontSize: 11.5, color: "#3f7d54", fontWeight: 500, flexShrink: 0 }}>✓ Tersimpan</span>}
      </div>

      <div>
        {PERM_ROWS.map(row => (
          <div key={row.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "13px 18px", borderBottom: "1px solid #f8f5ef" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "#0D1117" }}>{row.label}</p>
              <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 2 }}>{row.desc}</p>
            </div>
            <Switch on={!!mgr?.managerPerms[row.key]} onClick={() => patch({ managerPerms: { [row.key]: !mgr?.managerPerms[row.key] } })} disabled={!mgr} />
          </div>
        ))}

        {/* Approval method */}
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
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
  );
}
