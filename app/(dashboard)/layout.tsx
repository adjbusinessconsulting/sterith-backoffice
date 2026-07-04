"use client";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import StokMasukModal from "@/components/StokMasukModal";
import TransferModal from "@/components/TransferModal";
import ProdukModal from "@/components/ProdukModal";
import TambahKasirModal from "@/components/TambahKasirModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
