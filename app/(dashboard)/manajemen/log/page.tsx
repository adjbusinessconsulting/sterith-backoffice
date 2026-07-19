"use client";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

interface Log {
  id: string;
  type: string;
  meta: { detail?: string; actor?: string; seq?: number } | null;
  createdAt: string;
}

const NAVY = "#0D1117", GOLD = "#b8934a", MUTE = "#8f897a", BORDER = "#e8e3d5", CARD = "#fff";
const F = "var(--font-hanken)";

const TYPE_LABEL: Record<string, string> = {
  "product.add": "Produk baru",
  "product.edit": "Ubah produk",
  "product.price": "Ubah harga",
  "product.delete": "Hapus produk",
  "stock.add": "Tambah stok",
};

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + " · " +
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function LogPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity-logs", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setLogs(Array.isArray(d.logs) ? d.logs : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "28px 32px", fontFamily: F, maxWidth: 860 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, fontWeight: 700 }}>Manajemen · Audit</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em", marginTop: 4 }}>Log Aktivitas</h1>
        <p style={{ fontSize: 13, color: MUTE, marginTop: 4 }}>Setiap perubahan produk/harga/stok dari kasir tercatat permanen. Catatan tidak bisa dihapus atau diubah.</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(63,125,84,0.07)", border: "1px solid rgba(63,125,84,0.3)", borderRadius: 12, padding: "10px 14px", marginBottom: 18 }}>
        <ShieldCheck size={17} color="#3f7d54" />
        <span style={{ fontSize: 12.5, color: NAVY }}>Salinan server bersifat <b>append-only</b> — kasir tidak dapat menghapusnya, bahkan jika perangkat dihapus.</span>
      </div>

      {loading ? (
        <p style={{ color: MUTE, fontSize: 13, padding: 20 }}>Memuat…</p>
      ) : logs.length === 0 ? (
        <p style={{ color: MUTE, fontSize: 13, padding: 20 }}>Belum ada aktivitas tercatat.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {logs.map(l => (
            <div key={l.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", color: GOLD, background: "rgba(184,147,74,0.12)", border: "1px solid rgba(184,147,74,0.3)", borderRadius: 5, padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0, textTransform: "uppercase" }}>
                {TYPE_LABEL[l.type] ?? l.type}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: NAVY, lineHeight: 1.4 }}>{l.meta?.detail ?? "—"}</div>
                <div style={{ fontSize: 11.5, color: MUTE, marginTop: 3 }}>{fmt(l.createdAt)}{l.meta?.actor ? <> · oleh <b style={{ color: NAVY }}>{l.meta.actor}</b></> : null}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
