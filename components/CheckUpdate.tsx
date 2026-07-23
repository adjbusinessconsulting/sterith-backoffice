"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

// "Cek pembaruan" for Back Office. Its service worker is pass-through (no cache),
// so reloading always pulls the latest build from the network — we just nudge the
// SW to update first, then reload.
export default function CheckUpdate({ style }: { style?: React.CSSProperties }) {
  const [checking, setChecking] = useState(false);

  async function onClick() {
    if (checking) return;
    setChecking(true);
    try {
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        const r = await navigator.serviceWorker.getRegistration();
        await r?.update();
      }
    } catch { /* ignore */ }
    window.location.reload();
  }

  return (
    <button onClick={onClick} disabled={checking} title="Muat ulang untuk versi terbaru"
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        background: "transparent", border: "none", cursor: checking ? "default" : "pointer",
        color: "#8f897a", fontSize: 12, fontWeight: 500, fontFamily: "var(--font-hanken)",
        padding: "6px 4px", ...style,
      }}>
      <RefreshCw size={13} strokeWidth={1.9} style={checking ? { animation: "spin360 0.8s linear infinite" } : undefined} />
      {checking ? "Memuat ulang…" : "Cek pembaruan"}
    </button>
  );
}
