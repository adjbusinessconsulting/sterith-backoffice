"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { hasAddOn } from "@/lib/addons";
import DemoBanner from "@/components/DemoBanner";
import ShopperPhone from "@/components/ShopperPhone";
import { SHOWCASE_DEMO_STORE, productById } from "@/lib/demo/showcase";

const HERO = productById("n2")!; // Dunk Low — a drop

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on} style={{ width: 46, height: 27, borderRadius: 99, border: "none", flexShrink: 0, cursor: "pointer", position: "relative", background: on ? "#3f7d54" : "#d8d2c4", transition: "background 0.15s" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 22 : 3, width: 21, height: 21, borderRadius: 99, background: "#fff", transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
    </button>
  );
}

export default function ShowcasePengaturanPage() {
  const { data: session } = useSession();
  const owned = hasAddOn(session?.user?.addOns, "showcase");
  const [nudge, setNudge] = useState<string | null>(null);
  // Preset for a boutique; toggling is soft-gated in demo.
  const engines = [
    { key: "browse", label: "Etalase (Browse)", desc: "Katalog produk dengan foto & stok live. Selalu aktif.", on: true, lock: true },
    { key: "order", label: "Order-ahead", desc: "Pesan online, ambil di toko (click & collect).", on: true },
    { key: "reserve", label: "Reserve / Hold", desc: "Tahan item ('tahan size M, saya datang coba').", on: true },
    { key: "drops", label: "Member Drops", desc: "Akses awal koleksi baru khusus member.", on: true },
    { key: "restock", label: "Notifikasi Restok", desc: "Beritahu pelanggan saat ukuran mereka kembali ada.", on: true },
  ];

  function softGate(what: string) {
    setNudge(`${what} tersedia setelah Showcase aktif — ini mode demo.`);
    setTimeout(() => setNudge(null), 2600);
  }

  const bizTypes = ["Boutique", "F&B", "Lainnya"];
  const activeBiz = "Boutique";

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1120 }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>SHOWCASE · PENGATURAN</p>
        <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#14203a", lineHeight: 1.15, marginBottom: 6 }}>Pengaturan Showcase</h1>
        <p style={{ fontSize: 13, color: "#8f897a", lineHeight: 1.6, maxWidth: 470 }}>Atur cara kerja etalase: engine aktif, tipe bisnis, dan tampilan pelanggan.</p>
      </div>

      <DemoBanner owned={owned} addOn="showcase" storeName={SHOWCASE_DEMO_STORE} />

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Settings */}
        <div style={{ flex: 1, minWidth: 340, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Engines */}
          <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 14, padding: "18px 20px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, marginBottom: 4 }}>Engine</p>
            <p style={{ fontSize: 12, color: "#8f897a", marginBottom: 12 }}>Nyalakan hanya yang sesuai bisnis Anda.</p>
            {engines.map((e, i) => (
              <div key={e.key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: i ? "1px solid #f4f1ea" : "none" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: "#14203a" }}>{e.label}</p>
                    {e.lock && <span style={{ fontSize: 8, letterSpacing: "0.1em", fontWeight: 700, color: "#8f897a", background: "#f0ece3", padding: "1px 6px", borderRadius: 4, textTransform: "uppercase" }}>Wajib</span>}
                  </div>
                  <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 2, lineHeight: 1.5 }}>{e.desc}</p>
                </div>
                <Toggle on={e.on} onClick={() => !e.lock && softGate("Ubah engine")} />
              </div>
            ))}
          </div>

          {/* Business type */}
          <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 14, padding: "18px 20px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, marginBottom: 4 }}>Tipe Bisnis</p>
            <p style={{ fontSize: 12, color: "#8f897a", marginBottom: 12 }}>Menentukan default engine yang pas.</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {bizTypes.map((b) => (
                <button key={b} onClick={() => softGate("Ubah tipe bisnis")} style={{ height: 36, padding: "0 16px", borderRadius: 99, background: b === activeBiz ? "#14203a" : "#fff", border: `1.5px solid ${b === activeBiz ? "#14203a" : "#e8e3d5"}`, color: b === activeBiz ? "#f8f6ef" : "#14203a", fontSize: 13, fontWeight: b === activeBiz ? 600 : 400, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>{b}</button>
              ))}
            </div>
          </div>

          {/* Branding + CRM link */}
          <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 14, padding: "18px 20px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f897a", fontWeight: 700, marginBottom: 12 }}>Tampilan & Integrasi</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "6px 0" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "#14203a" }}>Nama etalase</p>
                <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 2 }}>{SHOWCASE_DEMO_STORE}</p>
              </div>
              <button onClick={() => softGate("Ubah branding")} style={{ height: 32, padding: "0 14px", borderRadius: 8, border: "1.5px solid #e8e3d5", background: "#fff", color: "#14203a", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-hanken)" }}>Ubah</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0 6px", borderTop: "1px solid #f4f1ea" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "#14203a" }}>Hubungkan ke CRM</p>
                <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 2, lineHeight: 1.5 }}>Poin loyalti & riwayat belanja di aplikasi pelanggan (opsional — perlu add-on CRM).</p>
              </div>
              <Toggle on={false} onClick={() => softGate("Hubungkan CRM")} />
            </div>
          </div>
        </div>

        {/* Phone preview */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <ShopperPhone product={HERO} />
        </div>
      </div>

      {nudge && (
        <div style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 1000, background: "#14203a", color: "#f8f6ef", fontSize: 13, fontWeight: 500, padding: "11px 18px", borderRadius: 11, boxShadow: "0 12px 40px rgba(20,32,58,0.4)", fontFamily: "var(--font-hanken)" }}>{nudge}</div>
      )}
    </div>
  );
}
