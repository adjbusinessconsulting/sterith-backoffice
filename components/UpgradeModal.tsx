"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { tierLevel } from "@/lib/tier";

type TierKey = "free" | "standard" | "premium";

const TIERS: { key: TierKey; name: string; price: number; reg?: number; tagline: string; features: string[] }[] = [
  { key: "free", name: "Free", price: 0, tagline: "Mulai gratis",
    features: ["1 toko", "1 akun kasir", "Dashboard hari ini", "Riwayat 1 hari"] },
  { key: "standard", name: "Standard", price: 50000, tagline: "Untuk toko berkembang",
    features: ["2 toko", "10 akun kasir", "Laporan periode + produk terlaris + export", "Riwayat 30 hari", "Uang kas, hutang, struk logo + WA"] },
  { key: "premium", name: "Premium", price: 100000, tagline: "Analitik penuh + multi-cabang",
    features: ["Toko & kasir tanpa batas", "Riwayat 90 hari", "Analitik mendalam + bulan lalu", "Semua metode bayar", "Back Office web + audit log", "Inventori dasar"] },
];

const ADDONS: { key: string; name: string; price: number; desc: string }[] = [
  { key: "inventori", name: "Inventori Lengkap", price: 50000, desc: "Gudang, Toko 2-level, Stok Opname, Riwayat, Transfer, Scan AI" },
  { key: "crm", name: "CRM + Loyalti", price: 50000, desc: "Data pelanggan & program membership / loyalti" },
];

const rp = (n: number) => n === 0 ? "Gratis" : "Rp " + n.toLocaleString("id-ID");
const F = "var(--font-hanken)";

export default function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: session } = useSession();
  const currentTier = (session?.user?.tier as TierKey) ?? "premium";
  const [target, setTarget] = useState<TierKey>("premium");
  const [addons, setAddons] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const targetIsPremium = tierLevel(target) >= 2;
  const chosen = ADDONS.filter(a => addons.has(a.key) && targetIsPremium);
  const tierObj = TIERS.find(t => t.key === target)!;
  const monthly = (target === "free" ? 0 : tierObj.price) + chosen.reduce((s, a) => s + a.price, 0);

  function toggleAddon(k: string) {
    setAddons(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  }

  async function submit() {
    setSending(true); setError("");
    const msg = [
      "[PERMINTAAN UPGRADE]",
      `Dari tier: ${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}`,
      `Minta tier: ${tierObj.name}${target === "free" ? "" : ` (${rp(tierObj.price)}/bln)`}`,
      chosen.length ? `Add-on: ${chosen.map(a => `${a.name} (~${rp(a.price)}/bln)`).join(", ")}` : "Add-on: —",
      `Estimasi total: ${rp(monthly)}/bln`,
      "",
      "Dikirim dari Backoffice.",
    ].join("\n");
    const res = await fetch("/api/upgrade-request", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg }),
    });
    setSending(false);
    if (!res.ok) { setError("Gagal mengirim permintaan. Coba lagi."); return; }
    setDone(true);
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(20,32,58,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: F }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 720, maxHeight: "90dvh", background: "#f8f6ef", borderRadius: 18, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 30px 80px rgba(20,32,58,0.4)" }}>

        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #e8e3d5", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <p style={{ margin: 0, fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "#b8934a", fontWeight: 700 }}>Sterith · Paket</p>
            <h2 style={{ margin: "4px 0 0", fontSize: 21, fontWeight: 800, color: "#14203a", letterSpacing: "-0.02em" }}>Tingkatkan paket Anda</h2>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#8f897a" }}>Paket saat ini: <b style={{ color: "#14203a", textTransform: "capitalize" }}>{currentTier}</b> · tim kami akan menghubungi Anda.</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid #e8e3d5", background: "white", cursor: "pointer", color: "#8f897a", flexShrink: 0 }}>✕</button>
        </div>

        {done ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: "rgba(63,125,84,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3f7d54" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#14203a" }}>Permintaan terkirim!</p>
            <p style={{ margin: "6px auto 22px", fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 360 }}>Tim Sterith akan meninjau dan menghubungi Anda untuk menyelesaikan upgrade. Terima kasih!</p>
            <button onClick={onClose} style={{ height: 44, padding: "0 30px", borderRadius: 11, border: "none", background: "#14203a", color: "#f8f6ef", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Tutup</button>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, margin: "0 0 10px" }}>Pilih paket</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
                {TIERS.map(t => {
                  const isCurrent = t.key === currentTier;
                  const selected = t.key === target;
                  const canPick = tierLevel(t.key) >= tierLevel(currentTier) && !isCurrent;
                  return (
                    <button key={t.key} disabled={!canPick} onClick={() => canPick && setTarget(t.key)}
                      style={{ textAlign: "left", background: "#fff", border: `2px solid ${selected ? "#b8934a" : "#e8e3d5"}`, borderRadius: 14, padding: 14, cursor: canPick ? "pointer" : "default", opacity: !canPick && !isCurrent ? 0.5 : 1, position: "relative" }}>
                      {isCurrent && <span style={{ position: "absolute", top: 10, right: 10, fontSize: 8, letterSpacing: "0.1em", fontWeight: 800, color: "#8f897a", background: "#f0ecdf", borderRadius: 5, padding: "2px 6px", textTransform: "uppercase" }}>Paket Anda</span>}
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#14203a" }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "#8f897a", marginBottom: 8 }}>{t.tagline}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#b8934a" }}>{rp(t.price)}{t.price > 0 && <span style={{ fontSize: 11, color: "#a9a396", fontWeight: 600 }}>/bln</span>}</div>
                      {t.reg && <div style={{ fontSize: 10, color: "#a9a396", textDecoration: "line-through" }}>{rp(t.reg)}/bln</div>}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }}>
                        {t.features.map(f => (
                          <div key={f} style={{ display: "flex", gap: 6, fontSize: 11, color: "#3a3a38", lineHeight: 1.4 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3f7d54" strokeWidth="3" style={{ flexShrink: 0, marginTop: 2 }}><path d="M20 6L9 17l-5-5" /></svg>{f}
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, margin: "20px 0 4px" }}>Add-on {targetIsPremium ? "" : "(butuh Premium)"}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ADDONS.map(a => {
                  const on = addons.has(a.key) && targetIsPremium;
                  return (
                    <button key={a.key} disabled={!targetIsPremium} onClick={() => toggleAddon(a.key)}
                      style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", background: "white", border: `1.5px solid ${on ? "#b8934a" : "#e8e3d5"}`, borderRadius: 12, padding: "12px 14px", cursor: targetIsPremium ? "pointer" : "not-allowed", opacity: targetIsPremium ? 1 : 0.5 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${on ? "#b8934a" : "#d8d2c4"}`, background: on ? "#b8934a" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {on && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><path d="M20 6L9 17l-5-5" /></svg>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#14203a" }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: "#8f897a" }}>{a.desc}</div>
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#b8934a", flexShrink: 0 }}>~{rp(a.price)}/bln</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e8e3d5", padding: "14px 24px", flexShrink: 0, background: "white" }}>
              {error && <p style={{ margin: "0 0 8px", fontSize: 12, color: "#c2503d" }}>{error}</p>}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700 }}>Estimasi</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#14203a" }}>{rp(monthly)}<span style={{ fontSize: 12, color: "#a9a396", fontWeight: 600 }}>/bln</span></div>
                </div>
                <button onClick={submit} disabled={sending}
                  style={{ height: 50, padding: "0 26px", borderRadius: 12, border: "none", background: "#14203a", color: "#f8f6ef", fontSize: 14, fontWeight: 700, cursor: sending ? "default" : "pointer", opacity: sending ? 0.7 : 1, display: "flex", alignItems: "center", gap: 9 }}>
                  {sending ? "Mengirim…" : "Kirim Permintaan"}
                  {!sending && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
