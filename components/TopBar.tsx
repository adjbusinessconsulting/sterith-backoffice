"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Sparkles, Puzzle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useUIStore } from "@/store/ui";
import UpgradeModal from "@/components/UpgradeModal";

const INV_ADDON_ROUTES = ["/inventori/ringkasan", "/inventori/gudang", "/inventori/toko", "/inventori/opname", "/inventori/riwayat"];

export default function TopBar() {
  const openModal = useUIStore(s => s.openModal);
  const { data: session } = useSession();
  const tier = (session?.user?.tier as string) ?? "premium";
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const pathname = usePathname();
  const showInvAddon = INV_ADDON_ROUTES.some(r => pathname.startsWith(r));

  return (
    <header style={{
      height: 56,
      background: "#fff",
      borderBottom: "1px solid #e8e3d5",
      display: "flex", alignItems: "center",
      padding: "0 24px",
      gap: 16,
      flexShrink: 0,
    }}>
      {/* Search */}
      <div style={{
        flex: 1, maxWidth: 440,
        height: 36,
        background: "#f8f6ef",
        border: "1px solid #e8e3d5",
        borderRadius: 10,
        display: "flex", alignItems: "center",
        padding: "0 12px",
        gap: 8,
        cursor: "text",
      }}>
        <Search size={14} color="#8f897a" strokeWidth={1.8} />
        <span style={{ flex: 1, fontSize: 13, color: "#8f897a", fontFamily: "var(--font-hanken)", userSelect: "none" }}>
          Cari produk, SKU, atau supplier...
        </span>
        <span style={{
          fontSize: 10.5, color: "#8f897a",
          background: "#e8e3d5", padding: "2px 6px",
          borderRadius: 5, letterSpacing: "0.02em",
          fontFamily: "var(--font-hanken)",
        }}>
          ⌘K
        </span>
      </div>

      {/* Add-on context tag */}
      {showInvAddon && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, height: 28, padding: "0 11px", borderRadius: 999, background: "rgba(184,147,74,0.10)", border: "1px solid rgba(184,147,74,0.3)", flexShrink: 0 }}>
          <Puzzle size={12} color="#b8934a" strokeWidth={2} />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#b8934a", fontFamily: "var(--font-hanken)", whiteSpace: "nowrap" }}>Add-on · Inventori Lengkap</span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Sync status */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3f7d54", display: "inline-block" }} />
        <span style={{ fontSize: 12.5, color: "#8f897a", fontFamily: "var(--font-hanken)", whiteSpace: "nowrap" }}>
          Tersinkron · {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* Tier badge → upgrade */}
      <button onClick={() => setUpgradeOpen(true)} title="Lihat paket / upgrade"
        style={{
          display: "flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px",
          borderRadius: 999, border: "1px solid rgba(184,147,74,0.4)", background: "rgba(184,147,74,0.10)",
          cursor: "pointer", flexShrink: 0,
        }}>
        <Sparkles size={13} color="#b8934a" strokeWidth={2} />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b8934a", fontFamily: "var(--font-hanken)" }}>{tier}</span>
      </button>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      {/* Bell */}
      <button
        style={{
          position: "relative", background: "transparent", border: "none",
          cursor: "pointer", padding: 6, borderRadius: 8, color: "#14203a",
        }}
        title="Notifikasi"
      >
        <Bell size={18} strokeWidth={1.6} />
        <span style={{
          position: "absolute", top: 2, right: 2,
          width: 16, height: 16, borderRadius: "50%",
          background: "#b8934a", color: "#fff",
          fontSize: 9, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-hanken)",
        }}>
          6
        </span>
      </button>
    </header>
  );
}
