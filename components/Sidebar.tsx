"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, TrendingUp, Package, Store,
  ArrowLeftRight, ClipboardCheck, History,
  Users, Grid2X2, BarChart2, Wallet, LogOut, ChevronDown, Settings2,
  LineChart, UserRound, Boxes,
  Heart, Images, Megaphone, Bookmark, SlidersHorizontal,
  MessageSquare,
} from "lucide-react";
import { useUIStore } from "@/store/ui";
import FeedbackDrawer from "./FeedbackDrawer";
import CheckUpdate from "./CheckUpdate";
import { boDeviceId } from "@/lib/boDevice";
import { isAtLeast, tierLabel } from "@/lib/tier";
import { hasAddOn, type AddOnKey } from "@/lib/addons";

type NavItem = { href: string; label: string; Icon: React.ElementType; lockTier?: string | null; requiresAddOn?: AddOnKey | null };

const UTAMA: NavItem[] = [
  { href: "/dashboard",           label: "Dashboard",    Icon: LayoutDashboard, lockTier: null },
];

const ANALITIK: NavItem[] = [
  { href: "/analitik/penjualan", label: "Dashboard Penjualan", Icon: LineChart,  lockTier: null },
  { href: "/analitik/kasir",     label: "Performa Kasir",      Icon: UserRound,  lockTier: null },
  { href: "/analitik/produk",    label: "Performa Produk",     Icon: Boxes,      lockTier: null },
];

// Full Inventori is a paid add-on ("inventori"); Stok Harian (Basic) stays bundled.
const INVENTORI: NavItem[] = [
  { href: "/inventori/stok",      label: "Stok Harian",  Icon: Boxes,          lockTier: null },
  { href: "/inventori/ringkasan", label: "Ringkasan",    Icon: TrendingUp,     requiresAddOn: "inventori" },
  { href: "/inventori/gudang",    label: "Gudang",       Icon: Package,        requiresAddOn: "inventori" },
  { href: "/inventori/toko",      label: "Toko",         Icon: Store,          requiresAddOn: "inventori" },
  { href: "/inventori/opname",    label: "Stok Opname",  Icon: ClipboardCheck, requiresAddOn: "inventori" },
  { href: "/inventori/riwayat",   label: "Riwayat Stok", Icon: History,        requiresAddOn: "inventori" },
];

// CRM + Loyalti add-on ("crm"). Premium can open + preview; needs the add-on to use.
const CRM: NavItem[] = [
  { href: "/crm/pelanggan", label: "Pelanggan", Icon: Users, requiresAddOn: "crm" },
  { href: "/crm/loyalti",   label: "Loyalti",   Icon: Heart, requiresAddOn: "crm" },
];

// Showcase add-on ("showcase") — customer-facing storefront wired to the POS.
const SHOWCASE: NavItem[] = [
  { href: "/showcase/katalog",    label: "Katalog",     Icon: Images,           requiresAddOn: "showcase" },
  { href: "/showcase/drops",      label: "Drops",       Icon: Megaphone,        requiresAddOn: "showcase" },
  { href: "/showcase/reservasi",  label: "Reservasi",   Icon: Bookmark,         requiresAddOn: "showcase" },
  { href: "/showcase/pengaturan", label: "Pengaturan",  Icon: SlidersHorizontal, requiresAddOn: "showcase" },
];

const MANAJEMEN: NavItem[] = [
  { href: "/manajemen/staf",     label: "Staf & Akses", Icon: Users,    lockTier: null },
  { href: "/manajemen/produk",   label: "Produk",       Icon: Grid2X2,  lockTier: null },
  { href: "/manajemen/laporan",  label: "Laporan",      Icon: BarChart2, lockTier: null },
  { href: "/manajemen/log",      label: "Log Aktivitas", Icon: History,  lockTier: null },
  { href: "/manajemen/keuangan", label: "Keuangan",     Icon: Wallet,   lockTier: null },
];

const PENGATURAN: NavItem[] = [
  { href: "/pengaturan", label: "Pengaturan", Icon: Settings2, lockTier: null },
];

const BADGE_STYLE: React.CSSProperties = {
  fontSize: 7, letterSpacing: "0.1em", fontWeight: 700,
  background: "rgba(184,147,74,0.15)", color: "#b8934a",
  border: "1px solid rgba(184,147,74,0.3)",
  padding: "1px 5px", borderRadius: 3, textTransform: "uppercase",
  whiteSpace: "nowrap",
};
// Muted "Add-on" tag for items the store already owns — still noted as an add-on.
const BADGE_ADDON_OWNED: React.CSSProperties = {
  ...BADGE_STYLE,
  background: "rgba(143,137,122,0.14)", color: "#8f897a",
  border: "1px solid rgba(143,137,122,0.28)",
};

function NavSection({ label, items, pathname, userTier, addOns }: {
  label: string;
  items: NavItem[];
  pathname: string;
  userTier: string;
  addOns: string[];
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <p style={{
        fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
        color: "#8f897a", fontWeight: 600, padding: "10px 14px 4px",
        fontFamily: "var(--font-hanken)",
      }}>
        {label}
      </p>
      {items.map(({ href, label: itemLabel, Icon, lockTier, requiresAddOn }) => {
        // Tier locks are hard (non-clickable). Add-on items stay CLICKABLE even when
        // not owned, so Premium can open and preview what the add-on does.
        const tierLocked = lockTier ? !isAtLeast(userTier, lockTier) : false;
        const addOnMissing = requiresAddOn ? !hasAddOn(addOns, requiresAddOn) : false;
        const clickable = !tierLocked;
        const isActive = clickable && (pathname === href || (href !== "/dashboard" && pathname.startsWith(href)));

        const inner = (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 10px", borderRadius: 10,
            background: isActive ? "#0D1117" : "transparent",
            transition: "background 0.12s",
            cursor: clickable ? "pointer" : "not-allowed",
            opacity: tierLocked ? 0.5 : 1,
          }}>
            <Icon size={15} strokeWidth={isActive ? 2 : 1.6}
              color={isActive ? "#f8f6ef" : "#8f897a"} />
            <span style={{
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? "#f8f6ef" : "#0D1117",
              fontFamily: "var(--font-hanken)", flex: 1,
            }}>
              {itemLabel}
            </span>
            {requiresAddOn ? (
              <span style={addOnMissing ? BADGE_STYLE : BADGE_ADDON_OWNED}>Add-on</span>
            ) : tierLocked && lockTier ? (
              <span style={BADGE_STYLE}>{tierLabel(lockTier)}</span>
            ) : null}
          </div>
        );

        return clickable ? (
          <Link key={href} href={href} style={{ textDecoration: "none", display: "block", padding: "2px 8px" }}>
            {inner}
          </Link>
        ) : (
          <div key={href} style={{ padding: "2px 8px" }}>{inner}</div>
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const openModal = useUIStore(s => s.openModal);
  const sidebarOpen = useUIStore(s => s.sidebarOpen);
  const closeSidebar = useUIStore(s => s.closeSidebar);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [store, setStore] = useState<{ name: string; address: string } | null>(null);
  useEffect(() => {
    fetch("/api/store").then(r => r.json()).then(d => { if (d && (d.name || d.address)) setStore({ name: d.name ?? "", address: d.address ?? "" }); }).catch(() => {});
  }, []);
  const storeName = store?.name || "Toko";
  const storeInitials = (store?.name || "T").split(/\s+/).slice(0, 2).map((w: string) => w[0] ?? "").join("").toUpperCase() || "T";
  const storeMeta = store?.address ? `${store.address} · 1 outlet` : "1 outlet";

  const name = session?.user?.name ?? "User";
  const role = session?.user?.role ?? "OWNER";
  const userTier = session?.user?.tier ?? 'premium';
  const addOns = session?.user?.addOns ?? [];
  const initials = name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
  const roleLabel = role === "OWNER" ? "Owner · akses penuh" : "Manajer";
  const canTransfer = hasAddOn(addOns, "inventori");

  return (
    <>
    {/* Backdrop — only visible on mobile when the drawer is open */}
    <div className={`bo-backdrop${sidebarOpen ? " bo-open" : ""}`} onClick={closeSidebar} />
    <aside className={`bo-sidebar${sidebarOpen ? " bo-open" : ""}`} style={{
      width: 248, flexShrink: 0,
      background: "#f6f3ea",
      borderRight: "1px solid #e8e3d5",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: "20px 18px 14px", borderBottom: "1px solid #e8e3d5", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <svg width="28" height="28" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
            <rect x="10" y="62" width="14" height="26" rx="3" fill="#b8934a"/>
            <rect x="30" y="50" width="14" height="38" rx="3" fill="#c9a55f"/>
            <rect x="50" y="34" width="14" height="54" rx="3" fill="#d4b36c"/>
            <rect x="70" y="22" width="14" height="66" rx="3" fill="#e7c987"/>
            <polygon points="63,22 91,22 77,4" fill="#e7c987"/>
          </svg>
          <div>
            <div style={{ fontFamily: "var(--font-garamond)", fontWeight: 700, fontSize: 17, letterSpacing: "0.05em", color: "#0D1117", lineHeight: 1.1 }}>
              STERITH
            </div>
            <div style={{ fontSize: 8, letterSpacing: "0.22em", color: "#b8934a", textTransform: "uppercase", marginTop: 1.5, fontWeight: 600 }}>
              BACKOFFICE
            </div>
          </div>
        </div>
      </div>

      {/* Business selector */}
      <div style={{
        margin: "10px 8px 6px",
        padding: "9px 10px",
        background: "#fff",
        border: "1px solid #e8e3d5",
        borderRadius: 10,
        display: "flex", alignItems: "center", gap: 9,
        cursor: "pointer", flexShrink: 0,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "#2a5f78",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: "var(--font-garamond)", fontSize: 12, fontWeight: 700, color: "#fff" }}>{storeInitials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0D1117", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {storeName}
          </div>
          <div style={{ fontSize: 10.5, color: "#8f897a", marginTop: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{storeMeta}</div>
        </div>
        <ChevronDown size={13} color="#8f897a" />
      </div>

      {/* Nav (scrollable) — clicking any link closes the mobile drawer */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }} onClick={closeSidebar}>
        <NavSection label="UTAMA" items={UTAMA} pathname={pathname} userTier={userTier} addOns={addOns} />

        <NavSection label="ANALITIK" items={ANALITIK} pathname={pathname} userTier={userTier} addOns={addOns} />

        <NavSection label="INVENTORI" items={INVENTORI} pathname={pathname} userTier={userTier} addOns={addOns} />

        {/* Transfer — modal button, Business-locked */}
        <div style={{ padding: "2px 8px" }}>
          <button
            onClick={() => canTransfer && openModal("transfer")}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 10,
              background: "transparent", border: "none",
              cursor: canTransfer ? "pointer" : "not-allowed",
              opacity: canTransfer ? 1 : 0.5,
              textAlign: "left",
            }}
          >
            <ArrowLeftRight size={15} strokeWidth={1.6} color="#8f897a" />
            <span style={{ fontSize: 13, fontWeight: 400, color: "#0D1117", fontFamily: "var(--font-hanken)", flex: 1 }}>
              Transfer
            </span>
            {!canTransfer && <span style={BADGE_STYLE}>Add-on</span>}
          </button>
        </div>

        <NavSection label="MANAJEMEN" items={MANAJEMEN} pathname={pathname} userTier={userTier} addOns={addOns} />

        <NavSection label="CRM" items={CRM} pathname={pathname} userTier={userTier} addOns={addOns} />

        <NavSection label="SHOWCASE" items={SHOWCASE} pathname={pathname} userTier={userTier} addOns={addOns} />

        <NavSection label="SISTEM" items={PENGATURAN} pathname={pathname} userTier={userTier} addOns={addOns} />
      </div>

      {/* Kritik & Saran */}
      <div style={{ borderTop: "1px solid #e8e3d5", padding: "8px 12px", flexShrink: 0 }}>
        <button
          onClick={() => setFeedbackOpen(true)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, background: "transparent", border: "1px solid #e8e3d5", borderRadius: 9, padding: "8px 10px", cursor: "pointer", color: "#8f897a" }}
        >
          <MessageSquare size={13} strokeWidth={1.7} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#0D1117" }}>Kritik & Saran</span>
        </button>
        <CheckUpdate style={{ width: "100%", justifyContent: "center", marginTop: 6 }} />
      </div>
      <FeedbackDrawer open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      {/* User footer */}
      <div style={{
        borderTop: "1px solid #e8e3d5",
        padding: "10px 12px",
        display: "flex", alignItems: "center", gap: 9,
        flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "#0D1117",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: "var(--font-garamond)", fontSize: 13, fontWeight: 700, color: "#f8f6ef" }}>{initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0D1117", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
          <div style={{ fontSize: 10.5, color: "#8f897a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{roleLabel}</div>
        </div>
        <span style={{
          fontSize: 9, letterSpacing: "0.08em", fontWeight: 700,
          background: "#f1e7cd", color: "#b8934a",
          padding: "2px 7px", borderRadius: 99,
          whiteSpace: "nowrap", textTransform: "uppercase",
        }}>
          {tierLabel(userTier)}
        </span>
        <button
          onClick={async () => { try { await fetch("/api/bo-device", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "release", deviceId: boDeviceId() }) }); } catch { /* stale lock times out anyway */ } signOut({ callbackUrl: "/login" }); }}
          title="Keluar"
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: "#8f897a", borderRadius: 6, marginLeft: 2 }}
        >
          <LogOut size={13} strokeWidth={1.6} />
        </button>
      </div>
    </aside>
    </>
  );
}
