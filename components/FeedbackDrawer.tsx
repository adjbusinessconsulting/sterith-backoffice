"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { X, Check } from "lucide-react";

/**
 * Kritik & Saran drawer for Back Office owners. Unlike the POS version there's no
 * email step — the owner is already signed in, so we take the email from the session
 * and get straight to the message. Posts to /api/feedback → Master Office Layanan.
 */
export default function FeedbackDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const [kind, setKind] = useState<"feedback" | "complain">("feedback");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function handleClose() {
    setKind("feedback"); setMessage(""); setError(""); setLoading(false); setDone(false);
    onClose();
  }

  async function submit() {
    if (!message.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), type: kind }),
      });
      setLoading(false);
      if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error ?? "Gagal mengirim. Coba lagi."); return; }
      setDone(true);
    } catch {
      setLoading(false); setError("Tidak dapat terhubung. Periksa koneksi lalu coba lagi.");
    }
  }

  if (!open) return null;

  const label: React.CSSProperties = { display: "block", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7, fontFamily: "var(--font-hanken)" };

  const content = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #e8e3d5", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <p style={{ margin: 0, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b8934a", fontWeight: 700 }}>Sterith · Back Office</p>
          <p style={{ margin: "2px 0 0", fontFamily: "var(--font-garamond)", fontSize: 20, fontWeight: 600, color: "#14203a" }}>Kritik & Saran</p>
        </div>
        <button onClick={handleClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "#b8b0a8" }}><X size={16} /></button>
      </div>

      {done ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(92,158,126,0.12)", border: "1px solid rgba(92,158,126,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Check size={22} color="#5C9E7E" strokeWidth={2.5} />
          </div>
          <p style={{ fontFamily: "var(--font-garamond)", fontSize: 20, fontWeight: 600, color: "#14203a", margin: "0 0 6px" }}>Terima kasih!</p>
          <p style={{ fontSize: 12.5, color: "#8f897a", margin: "0 0 24px", lineHeight: 1.6 }}>Masukan Anda sudah kami terima dan akan ditinjau oleh tim Sterith.</p>
          <button onClick={handleClose} style={{ background: "#14203a", color: "#f8f6ef", border: "none", borderRadius: 10, height: 42, padding: "0 28px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>Tutup</button>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <p style={{ fontSize: 12.5, color: "#8f897a", lineHeight: 1.6, margin: "0 0 18px" }}>
            Ada masukan, saran, atau kendala? Tulis di sini — tim kami meninjau setiap pesan.
          </p>

          {/* Signed-in identity — no retyping */}
          <div style={{ background: "rgba(92,158,126,0.06)", border: "1px solid rgba(92,158,126,0.2)", borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Check size={12} color="#5C9E7E" strokeWidth={2.5} />
            <span style={{ fontSize: 11.5, color: "#5C9E7E", fontWeight: 500 }}>{email || "Sesi aktif"}</span>
          </div>

          <label style={label}>Jenis</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {([["feedback", "Saran"], ["complain", "Kendala"]] as const).map(([k, l]) => {
              const on = kind === k;
              return (
                <button key={k} onClick={() => setKind(k)}
                  style={{ flex: 1, height: 38, borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer", background: on ? "#14203a" : "#fff", color: on ? "#f8f6ef" : "#8f897a", border: `1px solid ${on ? "#14203a" : "#e8e3d5"}` }}>{l}</button>
              );
            })}
          </div>

          <label style={label}>{kind === "complain" ? "Kendala yang Anda alami" : "Kritik & saran Anda"}</label>
          <textarea value={message} onChange={e => { setMessage(e.target.value); setError(""); }} rows={7}
            placeholder={kind === "complain" ? "Ceritakan kendalanya — makin detail makin cepat kami bantu…" : "Tulis masukan atau saran Anda…"}
            style={{ width: "100%", background: "#fff", border: `1.5px solid ${message.trim() ? "#e7c987" : "#e8e3d5"}`, borderRadius: 10, padding: "12px 13px", fontSize: 13.5, color: "#14203a", resize: "none", outline: "none", lineHeight: 1.6, boxSizing: "border-box", fontFamily: "inherit" }} />
          {error && <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#b0492f" }}>{error}</p>}

          <button onClick={submit} disabled={loading || !message.trim()}
            style={{ width: "100%", marginTop: 14, height: 46, background: "#e7c987", color: "#14203a", border: "none", borderRadius: 10, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", cursor: loading || !message.trim() ? "not-allowed" : "pointer", opacity: !message.trim() ? 0.5 : 1 }}>
            {loading ? "Mengirim…" : "Kirim →"}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(20,32,58,0.4)", zIndex: 900 }} />
      {/* Desktop: right drawer */}
      <div className="hidden lg:flex" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 360, background: "#f8f6ef", zIndex: 901, flexDirection: "column", boxShadow: "-8px 0 48px rgba(20,32,58,0.14)" }}>
        {content}
      </div>
      {/* Mobile: bottom sheet */}
      <div className="lg:hidden" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#f8f6ef", zIndex: 901, borderRadius: "18px 18px 0 0", maxHeight: "88dvh", display: "flex", flexDirection: "column", boxShadow: "0 -8px 48px rgba(20,32,58,0.14)" }}>
        <div style={{ width: 36, height: 4, background: "#e8e3d5", borderRadius: 99, margin: "10px auto 0", flexShrink: 0 }} />
        {content}
      </div>
    </>
  );
}
