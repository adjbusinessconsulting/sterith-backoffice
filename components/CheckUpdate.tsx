"use client";

import { useState } from "react";
import { RefreshCw, Check } from "lucide-react";
import { BO_BUILD } from "@/lib/build";

// "Cek pembaruan" for Back Office. Compares the running build (baked into this
// bundle) with the server's current build. If the server is ahead → a new deploy
// exists → nudge the SW and reload (BO's SW is pass-through, so a reload pulls the
// latest). If they match → shows "Sudah versi terbaru".
export default function CheckUpdate({ style }: { style?: React.CSSProperties }) {
  const [state, setState] = useState<"idle" | "checking" | "current">("idle");

  async function onClick() {
    if (state === "checking") return;
    setState("checking");
    try {
      const res = await fetch("/api/version", { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      if (j.build && j.build !== BO_BUILD) {
        try {
          if ("serviceWorker" in navigator) {
            const r = await navigator.serviceWorker.getRegistration();
            await r?.update();
          }
        } catch { /* ignore */ }
        window.location.reload();
        return;
      }
      setState("current");
      setTimeout(() => setState("idle"), 2600);
    } catch {
      window.location.reload();   // couldn't check → reload to be safe
    }
  }

  const label =
    state === "checking" ? "Mengecek pembaruan…"
    : state === "current" ? `Sudah versi terbaru · Build ${BO_BUILD}`
    : "Cek pembaruan";

  return (
    <button onClick={onClick} disabled={state === "checking"} title="Cek versi terbaru Back Office"
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        background: "transparent", border: "none", cursor: state === "checking" ? "default" : "pointer",
        color: state === "current" ? "#3f7d54" : "#8f897a",
        fontSize: 12, fontWeight: 500, fontFamily: "var(--font-hanken)",
        padding: "6px 4px", ...style,
      }}>
      {state === "current"
        ? <Check size={13} strokeWidth={2.2} />
        : <RefreshCw size={13} strokeWidth={1.9} style={state === "checking" ? { animation: "spin360 0.8s linear infinite" } : undefined} />}
      {label}
    </button>
  );
}
