"use client";
import { useState, useEffect, useCallback } from "react";
import { QrCode, CreditCard, CheckCircle2, AlertCircle, Eye, EyeOff, Upload, Trash2, Sparkles, Puzzle, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { ADDON_KEYS, ADDON_LABEL, hasAddOn, type AddOnKey } from "@/lib/addons";

interface StoreSettings {
  qris_image_url: string | null;
  midtrans_client_key: string | null;
  midtrans_server_key_set: boolean;
  settings_locked: boolean;
}

function Section({ title, icon, subtitle, children }: {
  title: string; icon: React.ReactNode; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "white", border: "1px solid #e8e3d5", borderRadius: 16, marginBottom: 20 }}>
      <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid #e8e3d5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f6f3ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#14203a", margin: 0, fontFamily: "var(--font-hanken)" }}>{title}</h2>
            <p style={{ fontSize: 12, color: "#8f897a", margin: "2px 0 0", fontFamily: "var(--font-hanken)" }}>{subtitle}</p>
          </div>
        </div>
      </div>
      <div style={{ padding: "24px 28px" }}>{children}</div>
    </div>
  );
}

const ADDON_DESC: Record<AddOnKey, string> = {
  inventori: "Gudang, stok opname, mutasi antar cabang & laporan lengkap.",
  crm: "Data pelanggan, poin loyalti & riwayat belanja.",
};

function SubscriptionSection() {
  const { data: session } = useSession();
  const tier = ((session?.user as { tier?: string } | undefined)?.tier ?? "premium");
  const addOns = ((session?.user as { addOns?: string[] } | undefined)?.addOns ?? []);
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);

  return (
    <Section
      title="Langganan & Add-on"
      subtitle="Paket aktif dan modul tambahan"
      icon={<Sparkles size={18} color="#b8934a" />}
    >
      {/* Current plan */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px", border: "1px solid rgba(184,147,74,0.4)", background: "rgba(184,147,74,0.07)", borderRadius: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, margin: 0, fontFamily: "var(--font-hanken)" }}>Paket Anda</p>
          <p style={{ fontFamily: "var(--font-garamond)", fontSize: 26, fontWeight: 500, color: "#14203a", margin: "2px 0 0" }}>{tierName}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, height: 28, padding: "0 12px", borderRadius: 999, background: "#e9f1ea", border: "1px solid #b3d4bb" }}>
          <CheckCircle2 size={13} color="#3f7d54" />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#3f7d54", fontFamily: "var(--font-hanken)" }}>Aktif</span>
        </div>
      </div>

      {/* Add-ons (darkened when not active) */}
      <p style={{ fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, margin: "0 0 10px", fontFamily: "var(--font-hanken)" }}>Modul Add-on</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
        {ADDON_KEYS.map(key => {
          const active = hasAddOn(addOns, key);
          return (
            <div key={key} style={{
              position: "relative", padding: "15px 16px", borderRadius: 12,
              border: active ? "1px solid rgba(63,125,84,0.4)" : "1px dashed #d8d2c4",
              background: active ? "#f5faf6" : "#f4f1ea",
              opacity: active ? 1 : 0.68,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#14203a", fontFamily: "var(--font-hanken)" }}>{ADDON_LABEL[key]}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#b8934a", background: "rgba(184,147,74,0.14)", borderRadius: 5, padding: "3px 7px", fontFamily: "var(--font-hanken)" }}>
                  <Puzzle size={10} /> Add-on
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#8f897a", margin: "8px 0 0", lineHeight: 1.5, fontFamily: "var(--font-hanken)" }}>{ADDON_DESC[key]}</p>
              <p style={{ fontSize: 11, margin: "8px 0 0", fontStyle: "italic", color: active ? "#3f7d54" : "#a79f8d", fontFamily: "var(--font-hanken)" }}>
                {active ? "✓ Aktif" : "Add-on terpisah — belum aktif. Hubungi Sterith untuk mengaktifkan."}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div style={{ marginBottom: 7 }}>
      <p style={{ fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, margin: 0, fontFamily: "var(--font-hanken)" }}>{label}</p>
      {hint && <p style={{ fontSize: 11, color: "#b3ad9e", margin: "3px 0 0", fontFamily: "var(--font-hanken)" }}>{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", masked }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; masked?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <input
        type={masked && !show ? "password" : type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", height: 44, border: "1px solid #e0dbd0", borderRadius: 10,
          padding: masked ? "0 44px 0 14px" : "0 14px",
          fontSize: 13.5, color: "#14203a", background: "#fafaf7",
          fontFamily: "var(--font-hanken)", outline: "none", boxSizing: "border-box",
        }}
      />
      {masked && (
        <button onClick={() => setShow(s => !s)} type="button"
          style={{ position: "absolute", right: 12, background: "transparent", border: "none", cursor: "pointer", color: "#8f897a", padding: 2 }}>
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
  );
}

export default function PengaturanPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Static QRIS state
  const [qrisUrl, setQrisUrl] = useState("");
  const [savingStatic, setSavingStatic] = useState(false);
  const [staticMsg, setStaticMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Midtrans state
  const [serverKey, setServerKey] = useState("");
  const [clientKey, setClientKey] = useState("");
  const [savingMidtrans, setSavingMidtrans] = useState(false);
  const [midtransMsg, setMidtransMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Master lock state
  const [locked, setLocked] = useState(false);
  const [savingLock, setSavingLock] = useState(false);
  const [lockMsg, setLockMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/settings");
      const data: StoreSettings = await res.json();
      setSettings(data);
      setQrisUrl(data.qris_image_url ?? "");
      setClientKey(data.midtrans_client_key ?? "");
      setLocked(!!data.settings_locked);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveStatic() {
    setSavingStatic(true);
    setStaticMsg(null);
    try {
      const res = await fetch("/api/store/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qris_image_url: qrisUrl }),
      });
      if (!res.ok) throw new Error();
      setStaticMsg({ type: "ok", text: "Tersimpan!" });
      load();
    } catch {
      setStaticMsg({ type: "err", text: "Gagal menyimpan, coba lagi." });
    } finally {
      setSavingStatic(false);
      setTimeout(() => setStaticMsg(null), 3500);
    }
  }

  async function saveMidtrans() {
    if (!serverKey.trim() && !settings?.midtrans_server_key_set) {
      setMidtransMsg({ type: "err", text: "Server Key wajib diisi." });
      return;
    }
    setSavingMidtrans(true);
    setMidtransMsg(null);
    try {
      const body: Record<string, string> = { midtrans_client_key: clientKey };
      if (serverKey.trim()) body.midtrans_server_key = serverKey;
      const res = await fetch("/api/store/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setMidtransMsg({ type: "ok", text: "Tersimpan! Server Key aman di server." });
      setServerKey("");
      load();
    } catch {
      setMidtransMsg({ type: "err", text: "Gagal menyimpan, coba lagi." });
    } finally {
      setSavingMidtrans(false);
      setTimeout(() => setMidtransMsg(null), 3500);
    }
  }

  async function clearServerKey() {
    if (!confirm("Hapus Midtrans Server Key? POS tidak bisa generate QRIS otomatis sampai diisi lagi.")) return;
    await fetch("/api/store/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ midtrans_server_key: "" }),
    });
    load();
  }

  async function toggleLock(next: boolean) {
    if (next && !confirm("Kunci pengaturan di POS? Kasir/perangkat kasir tidak bisa lagi mengubah pengaturan apa pun — semua diatur dari Back Office ini.")) return;
    setSavingLock(true);
    setLockMsg(null);
    const prev = locked;
    setLocked(next); // optimistic
    try {
      const res = await fetch("/api/store/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings_locked: next }),
      });
      if (!res.ok) throw new Error();
      setLockMsg({ type: "ok", text: next ? "Pengaturan POS dikunci." : "Pengaturan POS dibuka." });
    } catch {
      setLocked(prev); // revert
      setLockMsg({ type: "err", text: "Gagal menyimpan, coba lagi." });
    } finally {
      setSavingLock(false);
      setTimeout(() => setLockMsg(null), 3500);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "32px 36px" }}>
        <div style={{ width: 200, height: 32, background: "#f0ece3", borderRadius: 8, marginBottom: 12 }} />
        <div style={{ width: "100%", maxWidth: 680, height: 180, background: "#f0ece3", borderRadius: 16 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 36px", maxWidth: 720 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>
          SISTEM · PENGATURAN
        </p>
        <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#14203a", lineHeight: 1.15, marginBottom: 6 }}>
          Pengaturan toko
        </h1>
        <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6 }}>
          Langganan, add-on, dan konfigurasi pembayaran QRIS untuk POS Anda.
        </p>
      </div>

      {/* Subscription & add-ons */}
      <SubscriptionSection />

      {/* Static QRIS Section */}
      <Section
        title="QRIS Statis"
        subtitle="Gratis · Konfirmasi manual oleh kasir"
        icon={<QrCode size={18} color="#b8934a" />}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
          <div style={{ flex: 1 }}>
            <FieldLabel
              label="URL Gambar QRIS"
              hint="Paste link gambar QRIS statis Anda (bisa dari Google Drive, Imgur, dll). Ukuran ideal 500×500px."
            />
            <Input
              value={qrisUrl}
              onChange={setQrisUrl}
              placeholder="https://drive.google.com/uc?id=..."
            />
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              {qrisUrl && (
                <button
                  onClick={() => { setQrisUrl(""); }}
                  type="button"
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", fontSize: 11.5, color: "#c77e5c", fontFamily: "var(--font-hanken)", padding: 0 }}>
                  <Trash2 size={12} /> Hapus
                </button>
              )}
            </div>
          </div>

          {qrisUrl && (
            <div style={{ width: 110, height: 110, border: "1px solid #e8e3d5", borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f6f3ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrisUrl} alt="QRIS preview" style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, padding: "12px 16px", background: "#fdf8ee", border: "1px solid #edd99a", borderRadius: 10, fontSize: 12, color: "#7c6430", lineHeight: 1.6 }}>
          <strong>Cara kerja:</strong> Kasir klik &quot;SELESAIKAN&quot; di POS → QR tampil di layar → pelanggan scan &amp; bayar → kasir klik &quot;Sudah Dibayar ✓&quot; secara manual.
        </div>

        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={saveStatic}
            disabled={savingStatic}
            style={{
              height: 42, padding: "0 24px", background: "#14203a", color: "#f8f6ef",
              border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
              fontFamily: "var(--font-hanken)", cursor: savingStatic ? "not-allowed" : "pointer",
              opacity: savingStatic ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8,
            }}>
            {savingStatic ? "Menyimpan…" : (
              <><Upload size={14} /> Simpan QRIS Statis</>
            )}
          </button>
          {staticMsg && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: staticMsg.type === "ok" ? "#3f7d54" : "#c25e3d" }}>
              {staticMsg.type === "ok" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {staticMsg.text}
            </div>
          )}
        </div>
      </Section>

      {/* Midtrans Section */}
      <Section
        title="Midtrans QRIS Dinamis"
        subtitle="Berbayar · 0.7% MDR · Konfirmasi otomatis"
        icon={<CreditCard size={18} color="#2a5f78" />}
      >
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "#f0f7fb", border: "1px solid #c0dbe8", borderRadius: 10, fontSize: 12, color: "#2a5f78", lineHeight: 1.6 }}>
          <strong>Cara kerja:</strong> Setiap transaksi Midtrans generate QR unik → pelanggan scan → Midtrans kirim konfirmasi otomatis ke POS. Perlu akun Midtrans Business dan NPWP.
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <FieldLabel
              label="Server Key"
              hint="Dimulai dengan SB- (sandbox) atau tanpa prefix (production). Hanya disimpan di server, tidak pernah ke browser."
            />
            {settings?.midtrans_server_key_set && !serverKey && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "8px 14px", background: "#e9f1ea", border: "1px solid #b3d4bb", borderRadius: 8 }}>
                <CheckCircle2 size={13} color="#3f7d54" />
                <span style={{ fontSize: 12, color: "#3f7d54", fontFamily: "var(--font-hanken)" }}>Server Key sudah dikonfigurasi</span>
                <button onClick={clearServerKey} type="button"
                  style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", fontSize: 11, color: "#c77e5c", fontFamily: "var(--font-hanken)", textDecoration: "underline" }}>
                  Hapus
                </button>
              </div>
            )}
            <Input
              value={serverKey}
              onChange={setServerKey}
              placeholder={settings?.midtrans_server_key_set ? "Isi untuk mengganti Server Key…" : "SB-Mid-server-xxxxxxxxxxxx"}
              masked
            />
          </div>

          <div>
            <FieldLabel
              label="Client Key"
              hint="Dimulai dengan SB- (sandbox) atau Mid-client- (production). Aman untuk di-share."
            />
            <Input
              value={clientKey}
              onChange={setClientKey}
              placeholder="SB-Mid-client-xxxxxxxxxxxx"
            />
          </div>
        </div>

        <div style={{ marginTop: 8, padding: "10px 14px", background: "#fafaf7", border: "1px solid #e8e3d5", borderRadius: 8, fontSize: 11.5, color: "#8f897a", lineHeight: 1.6 }}>
          Daftar di <strong>dashboard.midtrans.com</strong> → Settings → Access Keys. Pastikan mode sandbox/production sudah sesuai.
        </div>

        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={saveMidtrans}
            disabled={savingMidtrans}
            style={{
              height: 42, padding: "0 24px", background: "#2a5f78", color: "#fff",
              border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
              fontFamily: "var(--font-hanken)", cursor: savingMidtrans ? "not-allowed" : "pointer",
              opacity: savingMidtrans ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8,
            }}>
            {savingMidtrans ? "Menyimpan…" : (
              <><CreditCard size={14} /> Simpan Midtrans</>
            )}
          </button>
          {midtransMsg && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: midtransMsg.type === "ok" ? "#3f7d54" : "#c25e3d" }}>
              {midtransMsg.type === "ok" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {midtransMsg.text}
            </div>
          )}
        </div>
      </Section>

      {/* Webhook info */}
      <div style={{ padding: "16px 20px", background: "#f6f3ea", border: "1px dashed #d4c99a", borderRadius: 12, fontSize: 12, color: "#7c6430", lineHeight: 1.7 }}>
        <strong>Webhook URL untuk Midtrans:</strong><br />
        <code style={{ background: "rgba(0,0,0,0.06)", padding: "2px 8px", borderRadius: 5, fontSize: 11.5, fontFamily: "monospace" }}>
          {typeof window !== "undefined" ? `${window.location.origin}/api/qris/webhook` : "https://backoffice.sterith.com/api/qris/webhook"}
        </code>
        <br />
        <span style={{ fontSize: 11 }}>Masukkan URL ini di Midtrans Dashboard → Settings → Configuration → Payment Notification URL.</span>
      </div>

      {/* Master lock — Premium (all Back Office owners are Premium+) */}
      <Section
        title="Kunci Pengaturan POS"
        subtitle="Atur semua pengaturan hanya dari Back Office"
        icon={<Lock size={18} color="#96762f" />}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, color: "#14203a", lineHeight: 1.7, margin: 0, fontFamily: "var(--font-hanken)" }}>
              Saat aktif, menu <strong>Pengaturan</strong> di aplikasi kasir (POS)
              disembunyikan sepenuhnya. Kasir atau siapa pun di perangkat kasir tidak bisa
              mengubah metode pembayaran, fitur, atau pengaturan apa pun — semua Anda atur
              dari sini. Perlindungan anti-utak-atik untuk perangkat jualan.
            </p>
            <p style={{ fontSize: 11.5, color: "#8f897a", margin: "10px 0 0", lineHeight: 1.6, fontFamily: "var(--font-hanken)" }}>
              Data yang sudah ada tidak terpengaruh. Perubahan berlaku saat POS memuat ulang toko (login berikutnya).
            </p>
            {lockMsg && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, marginTop: 12, color: lockMsg.type === "ok" ? "#3f7d54" : "#c25e3d" }}>
                {lockMsg.type === "ok" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {lockMsg.text}
              </div>
            )}
          </div>
          {/* Toggle */}
          <button
            role="switch"
            aria-checked={locked}
            disabled={savingLock}
            onClick={() => toggleLock(!locked)}
            style={{
              width: 52, height: 30, borderRadius: 999, border: "none", flexShrink: 0,
              cursor: savingLock ? "not-allowed" : "pointer", position: "relative",
              background: locked ? "#96762f" : "#d8d2c4", transition: "background 0.15s",
              opacity: savingLock ? 0.6 : 1, marginTop: 2,
            }}>
            <span style={{ position: "absolute", top: 3, left: locked ? 25 : 3, width: 24, height: 24, borderRadius: 999, background: "#fff", transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
          </button>
        </div>
        <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: locked ? "rgba(150,118,47,0.10)" : "#f0ece3", border: `1px solid ${locked ? "rgba(150,118,47,0.4)" : "#e8e3d5"}` }}>
          <Lock size={13} color={locked ? "#96762f" : "#8f897a"} />
          <span style={{ fontSize: 12, fontWeight: 700, color: locked ? "#96762f" : "#8f897a", fontFamily: "var(--font-hanken)" }}>
            {locked ? "Terkunci — hanya Back Office" : "Terbuka — POS bisa ubah sendiri"}
          </span>
        </div>
      </Section>
    </div>
  );
}
