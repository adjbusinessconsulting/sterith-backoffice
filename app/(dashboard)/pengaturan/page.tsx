"use client";
import { useState, useEffect, useCallback } from "react";
import { QrCode, CreditCard, CheckCircle2, AlertCircle, Eye, EyeOff, Upload, Trash2 } from "lucide-react";

interface StoreSettings {
  qris_image_url: string | null;
  midtrans_client_key: string | null;
  midtrans_server_key_set: boolean;
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/settings");
      const data: StoreSettings = await res.json();
      setSettings(data);
      setQrisUrl(data.qris_image_url ?? "");
      setClientKey(data.midtrans_client_key ?? "");
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
          Konfigurasi pembayaran QRIS untuk POS Anda.
        </p>
      </div>

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
              <img src={qrisUrl} alt="QRIS preview" style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, padding: "12px 16px", background: "#fdf8ee", border: "1px solid #edd99a", borderRadius: 10, fontSize: 12, color: "#7c6430", lineHeight: 1.6 }}>
          <strong>Cara kerja:</strong> Kasir klik "SELESAIKAN" di POS → QR tampil di layar → pelanggan scan & bayar → kasir klik "Sudah Dibayar ✓" secara manual.
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
    </div>
  );
}
