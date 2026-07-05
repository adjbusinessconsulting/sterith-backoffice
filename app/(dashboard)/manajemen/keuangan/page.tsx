"use client";
import { useSession } from "next-auth/react";
import { isAtLeast } from "@/lib/tier";
import LockedSection from "@/components/LockedSection";

export default function KeuanganPage() {
  const { data: session } = useSession();
  const userTier = session?.user?.tier ?? 'premium';

  if (!isAtLeast(userTier, 'enterprise')) return <LockedSection requiredTier="enterprise" />;

  return (
    <div style={{ padding: "32px 36px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-garamond)", fontSize: 26, fontWeight: 500, color: "#14203a", marginBottom: 8 }}>
          Segera hadir
        </p>
        <p style={{ fontSize: 13.5, color: "#8f897a", lineHeight: 1.6, maxWidth: 320 }}>
          Modul keuangan sedang dalam pengembangan. Termasuk laporan laba rugi, analisis margin, dan proyeksi arus kas.
        </p>
      </div>
    </div>
  );
}
