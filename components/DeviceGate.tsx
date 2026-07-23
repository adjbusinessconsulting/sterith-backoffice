"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { boDeviceId } from "@/lib/boDevice";

// Gates the Back Office dashboard behind the single-device lock: first login holds,
// a second device is blocked until the first logs out (or is forced / goes stale).
export default function DeviceGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "ok" | "blocked">("checking");
  const [busy, setBusy] = useState(false);
  const [storeName, setStoreName] = useState("");
  const hb = useRef<ReturnType<typeof setInterval> | null>(null);

  async function claim(force: boolean) {
    setBusy(true);
    try {
      const res = await fetch("/api/bo-device", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim", deviceId: boDeviceId(), force }),
      });
      const j = await res.json().catch(() => ({}));
      if (j.ok) { setState("ok"); startHeartbeat(); }
      else { setStoreName(j.storeName || ""); setState("blocked"); }
    } catch {
      setState("ok");   // fail open — a network hiccup shouldn't lock the owner out
    } finally {
      setBusy(false);
    }
  }

  function startHeartbeat() {
    if (hb.current) return;
    const beat = async () => {
      try {
        const res = await fetch("/api/bo-device", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "heartbeat", deviceId: boDeviceId() }),
        });
        const j = await res.json().catch(() => ({ owner: true }));
        if (j.owner === false) signOut({ callbackUrl: "/login" });
      } catch { /* ignore transient errors */ }
    };
    hb.current = setInterval(beat, 25000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") beat(); });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { claim(false); return () => { if (hb.current) clearInterval(hb.current); }; }, []);

  if (state === "ok") return <>{children}</>;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF7", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      {state === "checking" ? (
        <div style={{ width: 26, height: 26, borderRadius: "50%", border: "2px solid #e8e3d5", borderTopColor: "#b8934a", animation: "spin360 0.8s linear infinite" }} />
      ) : (
        <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f1e7cd", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#b8934a", fontWeight: 600, marginBottom: 8, fontFamily: "var(--font-hanken)" }}>SUDAH MASUK</p>
          <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 28, fontWeight: 500, color: "#0D1117", margin: "0 0 8px", lineHeight: 1.2 }}>Back Office sedang dipakai</h1>
          <p style={{ fontSize: 13, color: "#8f897a", margin: "0 0 24px", lineHeight: 1.6, fontFamily: "var(--font-hanken)" }}>
            {storeName ? <>Back Office <b style={{ color: "#0D1117" }}>{storeName}</b> </> : "Akun ini "}sedang login di perangkat lain. Satu akun hanya bisa aktif di satu perangkat. Keluar dulu dari perangkat itu, lalu tekan <b style={{ color: "#0D1117" }}>Coba lagi</b>.
          </p>
          <button onClick={() => claim(false)} disabled={busy}
            style={{ width: "100%", height: 48, borderRadius: 11, border: "none", background: "#0D1117", color: "#FAFAF7", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "var(--font-hanken)" }}>
            {busy ? "Mengecek…" : "Coba lagi"}
          </button>
          <button onClick={() => claim(true)} disabled={busy}
            style={{ width: "100%", marginTop: 10, height: 44, borderRadius: 11, border: "1px solid #e8e3d5", background: "white", color: "#0D1117", fontSize: 12.5, fontWeight: 600, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "var(--font-hanken)" }}>
            Paksa masuk di sini (keluarkan perangkat lain)
          </button>
          <button onClick={() => signOut({ callbackUrl: "/login" })} disabled={busy}
            style={{ width: "100%", marginTop: 10, background: "transparent", border: "none", fontSize: 12, color: "#8f897a", cursor: "pointer", fontFamily: "var(--font-hanken)" }}>
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
