"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Email atau password salah.");
    else window.location.href = "/inventori/ringkasan";
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try { await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); } catch { /* ignore */ }
    setLoading(false);
    setSent(true);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#eceadf",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-hanken), system-ui, sans-serif",
      padding: 16,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#f8f6ef",
        borderRadius: 18,
        padding: "24px 32px 20px",
        border: "1px solid #ddd9cc",
        boxShadow: "0 8px 40px rgba(20,32,58,0.09)",
      }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#e7c987",
              boxShadow: "0 0 0 3px rgba(231,201,135,0.25)",
            }} />
            <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "#8f897a", fontWeight: 600, textTransform: "uppercase" }}>
              Restricted Access
            </span>
          </div>
          <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "#b8a88a", fontWeight: 500 }}>V1.0.0</span>
        </div>

        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src="/stacked-light.png"
            alt="Sterith"
            style={{ width: 200, display: "block", margin: "0 auto 4px", mixBlendMode: "multiply" }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ height: 1, width: 32, background: "#b8934a", opacity: 0.6 }} />
            <span style={{ fontSize: 9, letterSpacing: "0.25em", color: "#b8934a", textTransform: "uppercase", fontWeight: 600 }}>
              Backoffice
            </span>
            <div style={{ height: 1, width: 32, background: "#b8934a", opacity: 0.6 }} />
          </div>

          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 22, fontWeight: 500, color: "#0D1117", marginBottom: 5, lineHeight: 1.25 }}>
            Premium Member Only
          </h1>
          <p style={{ fontSize: 12, color: "#8f897a", lineHeight: 1.5, margin: 0 }}>
            All access is logged and audited.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={mode === "forgot" ? handleForgot : handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 6 }}>
              Email Pemilik
            </label>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#8f897a" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="owner@toko.com"
                required
                style={{
                  width: "100%", height: 46, boxSizing: "border-box",
                  border: "1.5px solid #ddd9cc", borderRadius: 10,
                  padding: "0 14px 0 42px",
                  fontSize: 13, color: "#0D1117",
                  background: "#fff", fontFamily: "inherit", outline: "none",
                }}
              />
            </div>
          </div>

          {mode === "login" && <div>
            <label style={{ display: "block", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#8f897a" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: "100%", height: 46, boxSizing: "border-box",
                  border: "1.5px solid #ddd9cc", borderRadius: 10,
                  padding: "0 44px 0 42px",
                  fontSize: 13, color: "#0D1117",
                  background: "#fff", fontFamily: "inherit", outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#8f897a", padding: 4, display: "flex",
                }}
              >
                {showPassword ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>}

          {mode === "forgot" && (
            <p style={{ fontSize: 12, color: "#8f897a", lineHeight: 1.5, margin: 0 }}>
              Masukkan email akun Anda. Kami kirim tautan untuk membuat kata sandi baru — ini juga menyamakan kembali kata sandi Back Office dengan akun.
            </p>
          )}

          {error && (
            <p style={{ fontSize: 12, color: "#b0492f", background: "#f4e9e4", padding: "9px 12px", borderRadius: 8, margin: 0 }}>
              {error}
            </p>
          )}
          {sent && (
            <p style={{ fontSize: 12, color: "#3f7d54", background: "#e9f1ea", padding: "9px 12px", borderRadius: 8, margin: 0 }}>
              Jika email terdaftar, tautan reset sudah dikirim. Cek inbox atau folder spam.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 48, background: "#e7c987", color: "#0D1117",
              border: "none", borderRadius: 10, fontSize: 11,
              fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, marginTop: 4,
              fontFamily: "inherit", letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {loading ? "MEMUAT…" : mode === "forgot" ? "KIRIM TAUTAN RESET →" : "MASUK KE BACKOFFICE →"}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === "forgot" ? "login" : "forgot"); setError(""); setSent(false); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#8f897a", fontSize: 12, fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 3, marginTop: 2 }}
          >
            {mode === "forgot" ? "← Kembali ke login" : "Lupa password?"}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 20, paddingTop: 16, borderTop: "1px solid #ddd9cc",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#b8a88a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ fontSize: 10, color: "#b8a88a" }}>TLS 1.3 · Audit logged</span>
          </div>
          <span style={{ fontSize: 10, color: "#b8a88a" }}>© 2026 STERITH</span>
        </div>
      </div>
    </div>
  );
}
