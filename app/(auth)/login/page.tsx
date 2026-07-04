"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email atau password salah.");
    } else {
      router.push("/inventori/ringkasan");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#eceadf",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-hanken), system-ui, sans-serif",
    }}>
      <div style={{
        width: 400,
        background: "#fff",
        borderRadius: 16,
        padding: "40px 36px",
        boxShadow: "0 4px 32px rgba(20,32,58,0.08)",
        border: "1px solid #e8e3d5",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <svg width="32" height="32" viewBox="0 0 100 100">
            <rect x="10" y="62" width="14" height="26" rx="3" fill="#b8934a"/>
            <rect x="30" y="50" width="14" height="38" rx="3" fill="#c9a55f"/>
            <rect x="50" y="34" width="14" height="54" rx="3" fill="#d4b36c"/>
            <rect x="70" y="22" width="14" height="66" rx="3" fill="#e7c987"/>
            <polygon points="63,22 91,22 77,4" fill="#e7c987"/>
          </svg>
          <div>
            <div style={{ fontFamily: "var(--font-garamond)", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em", color: "#14203a", lineHeight: 1 }}>
              STERITH
            </div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#b8934a", textTransform: "uppercase", marginTop: 2, fontWeight: 500 }}>
              BACKOFFICE
            </div>
          </div>
        </div>

        <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 26, fontWeight: 500, color: "#14203a", marginBottom: 6 }}>
          Masuk ke backoffice
        </h1>
        <p style={{ fontSize: 13, color: "#8f897a", marginBottom: 28, lineHeight: 1.5 }}>
          Khusus pemilik dan manajer toko.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 6 }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@toko.com"
              required
              style={{
                width: "100%", height: 46,
                border: "1.5px solid #e8e3d5",
                borderRadius: 10, padding: "0 14px",
                fontSize: 14, color: "#14203a",
                background: "#fff", fontFamily: "inherit",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 6 }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%", height: 46,
                border: "1.5px solid #e8e3d5",
                borderRadius: 10, padding: "0 14px",
                fontSize: 14, color: "#14203a",
                background: "#fff", fontFamily: "inherit",
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12.5, color: "#b0492f", background: "#f4e9e4", padding: "10px 14px", borderRadius: 8 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 48, background: "#14203a", color: "#f8f6ef",
              border: "none", borderRadius: 10, fontSize: 14,
              fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, marginTop: 4,
              fontFamily: "inherit", letterSpacing: "0.02em",
            }}
          >
            {loading ? "Memuat…" : "Masuk →"}
          </button>
        </form>
      </div>
    </div>
  );
}
