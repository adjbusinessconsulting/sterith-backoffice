"use client";
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import StokMasukModal from "@/components/StokMasukModal";
import TransferModal from "@/components/TransferModal";
import ProdukModal from "@/components/ProdukModal";
import TambahKasirModal from "@/components/TambahKasirModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Auto-logout if the client gets suspended mid-session.
  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/session-check", { cache: "no-store" });
        const json = await res.json().catch(() => ({ suspended: false }));
        if (!cancelled && (res.status === 401 || json.suspended)) {
          signOut({ callbackUrl: "/login" });
        }
      } catch { /* ignore transient errors */ }
    }
    check();
    const t = setInterval(check, 60000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: "auto", background: "#eceadf" }}>
          {children}
        </main>
      </div>
      <StokMasukModal />
      <TransferModal />
      <ProdukModal />
      <TambahKasirModal />
    </div>
  );
}
