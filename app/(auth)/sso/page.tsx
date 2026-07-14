"use client";
import { useEffect } from "react";
import { signIn } from "next-auth/react";

// Handoff target for the POS single-login portal. The POS validated the owner's
// password via Supabase and redirected here with a Supabase access token in the
// URL fragment (#at=...). We verify it via the supabase-token provider and land
// the owner straight in the Back Office — no second login.
export default function SsoPage() {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const at = new URLSearchParams(hash).get("at");
    // Strip the token from the URL immediately.
    history.replaceState(null, "", window.location.pathname);
    if (!at) { window.location.href = "/login"; return; }
    signIn("supabase-token", { accessToken: at, callbackUrl: "/dashboard" }).catch(() => {
      window.location.href = "/login?error=sso";
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#0D1117", color: "#f4efe6", fontFamily: "var(--font-hanken), system-ui, sans-serif" }}>
      <div style={{ width: 34, height: 34, border: "3px solid rgba(201,165,103,0.25)", borderTopColor: "#c9a567", borderRadius: "50%", animation: "sso-spin 0.8s linear infinite" }} />
      <p style={{ fontSize: 14, color: "#a8a095" }}>Menghubungkan ke Back Office…</p>
      <style>{`@keyframes sso-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
