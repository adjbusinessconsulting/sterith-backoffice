"use client";
import { useState, useEffect, useCallback } from "react";

interface Transaction {
  id: string; no: string; cashierName: string; method: string; total: number; createdAt: string; shift: number | null;
  voided?: boolean; customerName?: string | null;
  items: { name: string; qty: number; price: number; subtotal: number }[];
}

interface CashEntry {
  id: string; type: string; amount: number; label: string; description: string | null;
  cashierName: string | null; hasPhoto: boolean; createdAt: string;
}

interface Summary {
  totalOmzet: number; transaksi: number; rataRata: number;
  saldoLaci: number; modalAwal: number; autoTunai: number; kasMasuk: number; kasKeluar: number;
}

interface HutangRow {
  id: string; customerName: string; phone: string | null; amount: number; paidAmount: number;
  status: string; cashierName: string | null; createdAt: string; settledAt: string | null;
}
interface LogRow { id: string; type: string; detail: string; actor: string; createdAt: string; }
interface ShiftClose {
  businessDate: string; openedAt: string | null; closedAt: string; cashierName: string | null;
  omzet: number; trx: number; shiftCount: number; modalAwal: number; expected: number;
  counted: number | null; selisih: number | null; reconciled: boolean; autoClosed: boolean;
  breakdown: Record<string, number>;
}

type Tab = "riwayat" | "kasir" | "hutang" | "log" | "shift";
const TABS: { id: Tab; label: string }[] = [
  { id: "riwayat", label: "Riwayat" },
  { id: "kasir", label: "Kasir" },
  { id: "hutang", label: "Hutang" },
  { id: "log", label: "Log" },
  { id: "shift", label: "Tutup Shift" },
];
const hutangLabel = (s: string) => s === "lunas" ? "Lunas" : s === "partial" ? "Sebagian" : "Belum lunas";
const hutangColor = (s: string) => s === "lunas" ? "#3f7d54" : s === "partial" ? "#96762f" : "#b0492f";

const methodLabel = (m: string) => m?.toLowerCase() === "qris" ? "QRIS" : m?.toLowerCase() === "tunai" ? "Tunai" : (m || "—");
const pad = (n: number) => String(n).padStart(2, "0");
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

function fmtRp(n: number) {
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1).replace(".0", "")}jt`;
  if (n >= 1000) return `Rp ${Math.round(n / 1000)}k`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}
function fmtRpFull(n: number) { return "Rp " + n.toLocaleString("id-ID"); }
function fmtTime(dt: string) { return new Date(dt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }); }
function fmtDate(dt: string) { return new Date(dt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }); }
const th: React.CSSProperties = { padding: "11px 16px", textAlign: "left", fontSize: 9.5, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600 };
const td: React.CSSProperties = { padding: "13px 16px" };
const tdNum: React.CSSProperties = { padding: "13px 16px", textAlign: "right", fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontWeight: 600, fontSize: 14, color: "#0D1117" };

export default function LaporanPage() {
  const [tab, setTab] = useState<Tab>("riwayat");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashEntries, setCashEntries] = useState<CashEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [hutang, setHutang] = useState<HutangRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [shiftClose, setShiftClose] = useState<ShiftClose | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(localToday());
  const [methodFilter, setMethodFilter] = useState<"semua" | "tunai" | "qris">("semua");
  const [shiftFilter, setShiftFilter] = useState<"semua" | number>("semua");
  const [hutangFilter, setHutangFilter] = useState<"semua" | "open" | "lunas">("semua");

  const loadData = useCallback(async () => {
    setLoading(true);
    const tz = -new Date().getTimezoneOffset();          // store-local day (WIB = 420)
    const qs = `date=${date}&tz=${tz}`;
    try {
      const [trxRes, sumRes, cashRes, hutRes, logRes, shiftRes] = await Promise.all([
        fetch(`/api/reports/transactions?${qs}`),
        fetch(`/api/reports/summary?${qs}`),
        fetch(`/api/reports/cash?${qs}`),
        fetch(`/api/reports/hutang`),
        fetch(`/api/reports/log?${qs}`),
        fetch(`/api/reports/shift?${qs}`),
      ]);
      const [trx, sum, cash, hut, log, shift] = await Promise.all([
        trxRes.json(), sumRes.json(), cashRes.json(), hutRes.json(), logRes.json(), shiftRes.json(),
      ]);
      if (Array.isArray(trx)) setTransactions(trx);
      if (sum && typeof sum === "object") setSummary(sum);
      if (Array.isArray(cash)) setCashEntries(cash);
      setHutang(Array.isArray(hut) ? hut : []);
      setLogs(Array.isArray(log) ? log : []);
      setShiftClose(shift && typeof shift === "object" ? shift : null);
    } catch {}
    setLoading(false);
  }, [date]);

  useEffect(() => { loadData(); }, [loadData]);

  // Filters (client-side): shift narrows the set; the payment pills sit on top of it.
  // Voided sales still show (with a badge) but don't count toward the pill numbers.
  const byShift = transactions.filter(t => shiftFilter === "semua" || t.shift === shiftFilter);
  const active = byShift.filter(t => !t.voided);
  const voidedTx = byShift.filter(t => t.voided);
  const voidedTotal = voidedTx.reduce((s, t) => s + t.total, 0);
  const totalTrx = active.length;
  const tunaiCount = active.filter(t => t.method?.toLowerCase() === "tunai").length;
  const qrisCount = active.filter(t => t.method?.toLowerCase() === "qris").length;
  const filtered = byShift.filter(t => methodFilter === "semua" || t.method?.toLowerCase() === methodFilter);

  // Hutang status filter (its own controls — the day/shift filters don't apply to a ledger).
  const hutangOutstanding = hutang.filter(h => h.status !== "lunas");
  const hutangLunas = hutang.filter(h => h.status === "lunas");
  const hutangFiltered = hutangFilter === "lunas" ? hutangLunas : hutangFilter === "open" ? hutangOutstanding : hutang;

  const shiftOptions = Array.from(new Set(transactions.map(t => t.shift).filter((s): s is number => s != null))).sort((a, b) => a - b);
  const activeShift = transactions.length ? transactions[0].shift : null;   // newest first → current shift
  const isToday = date === localToday();

  // Cash movements for the Kasir tab, mirroring the POS Kas screen: manual
  // entries, then the auto cash-from-sales and modal-awal rows.
  const moves = summary ? [
    ...cashEntries.map(e => ({
      id: e.id, label: e.label,
      sub: [e.cashierName, e.type === "hutang_settle" ? "pelunasan hutang" : e.type].filter(Boolean).join(" · "),
      amount: e.amount, time: fmtTime(e.createdAt),
    })),
    ...(summary.autoTunai > 0 ? [{ id: "auto", label: "Penjualan tunai", sub: "otomatis dari penjualan", amount: summary.autoTunai, time: "" }] : []),
    ...(summary.modalAwal > 0 ? [{ id: "modal", label: "Modal awal shift", sub: "saat buka toko", amount: summary.modalAwal, time: "" }] : []),
  ] : [];

  const pillBtn = (active: boolean): React.CSSProperties => ({
    height: 32, padding: "0 12px", borderRadius: 99,
    background: active ? "#0D1117" : "#fff",
    border: `1.5px solid ${active ? "#0D1117" : "#e8e3d5"}`,
    color: active ? "#f8f6ef" : "#0D1117",
    fontSize: 12, fontWeight: active ? 600 : 400,
    cursor: "pointer", fontFamily: "var(--font-hanken)",
  });

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#96762f", fontWeight: 600, marginBottom: 8 }}>
          LAPORAN
        </p>
        <h1 style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#0D1117", lineHeight: 1.15, marginBottom: 6 }}>
          Performa toko
        </h1>
        <p style={{ fontSize: 13, color: "#8f897a" }}>
          Tampilan sama seperti di POS — riwayat, kas, hutang, log &amp; tutup shift.
        </p>
      </div>

      {/* Tab + filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        {/* Riwayat / Kasir / Hutang / Log / Tutup Shift tabs */}
        <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 10, padding: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              height: 34, padding: "0 14px", borderRadius: 8,
              background: tab === t.id ? "#0D1117" : "transparent",
              border: "none",
              color: tab === t.id ? "#f8f6ef" : "#8f897a",
              fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              cursor: "pointer", fontFamily: "var(--font-hanken)", whiteSpace: "nowrap",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Date picker — for the day-scoped tabs (Hutang is a running ledger) */}
        {tab !== "hutang" && (
        <label style={{
          height: 38, padding: "0 14px", background: "#fff", border: "1.5px solid #e8e3d5",
          borderRadius: 10, fontSize: 12.5, color: "#0D1117", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-hanken)",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8f897a" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <input type="date" value={date} max={localToday()} onChange={e => setDate(e.target.value || localToday())}
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: "#0D1117", fontFamily: "var(--font-hanken)", cursor: "pointer" }} />
        </label>
        )}

        {/* Shift filter — Riwayat only */}
        {tab === "riwayat" && shiftOptions.length > 0 && (
          <div style={{
            height: 38, padding: "0 6px 0 12px", background: "#fff", border: "1.5px solid #e8e3d5",
            borderRadius: 10, display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-hanken)",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8f897a" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <select value={String(shiftFilter)} onChange={e => setShiftFilter(e.target.value === "semua" ? "semua" : Number(e.target.value))}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: "#0D1117", fontFamily: "var(--font-hanken)", cursor: "pointer", height: 36 }}>
              <option value="semua">Shift · Semua</option>
              {shiftOptions.map(s => <option key={s} value={s}>Shift {s}</option>)}
            </select>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Payment filter — Riwayat only; now actually filters the table */}
        {tab === "riwayat" && (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setMethodFilter("semua")} style={pillBtn(methodFilter === "semua")}>Semua · {totalTrx}</button>
          <button onClick={() => setMethodFilter("tunai")} style={pillBtn(methodFilter === "tunai")}>Tunai · {tunaiCount}</button>
          <button onClick={() => setMethodFilter("qris")} style={pillBtn(methodFilter === "qris")}>QRIS · {qrisCount}</button>
        </div>
        )}

        {/* Status filter — Hutang tab (replaces the day/shift filters, which a ledger has no use for) */}
        {tab === "hutang" && (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setHutangFilter("semua")} style={pillBtn(hutangFilter === "semua")}>Semua · {hutang.length}</button>
          <button onClick={() => setHutangFilter("open")} style={pillBtn(hutangFilter === "open")}>Belum lunas · {hutangOutstanding.length}</button>
          <button onClick={() => setHutangFilter("lunas")} style={pillBtn(hutangFilter === "lunas")}>Lunas · {hutangLunas.length}</button>
        </div>
        )}
      </div>

      {/* === RIWAYAT TAB === */}
      {tab === "riwayat" && (
        <>
          {/* Summary strip */}
          {summary && (
            <div className="bo-cols-4" style={{
              background: "#0D1117", borderRadius: 14, padding: "20px 24px",
              gap: 0, marginBottom: 24,
            }}>
              {[
                { label: isToday ? "TOTAL OMZET HARI INI" : "TOTAL OMZET", value: fmtRpFull(summary.totalOmzet) },
                { label: "TRANSAKSI", value: String(summary.transaksi) },
                { label: "RATA-RATA", value: fmtRp(summary.rataRata) },
                { label: "SHIFT AKTIF", value: activeShift != null ? `Shift ${activeShift}` : "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: "0 20px", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
                  <p style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(248,246,239,0.5)", fontWeight: 600, marginBottom: 8 }}>{label}</p>
                  <p style={{ fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontSize: 26, fontWeight: 700, color: label === "TRANSAKSI" ? "#e7c987" : "#f8f6ef" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}
          {voidedTx.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#fff", border: "1px solid #eaddd6", borderRadius: 12, padding: "12px 18px", marginTop: -12, marginBottom: 24 }}>
              <span style={{ fontSize: 12.5, color: "#b0492f", fontWeight: 500 }}>Dibatalkan · {voidedTx.length} transaksi <span style={{ color: "#a49d8c", fontWeight: 400 }}>(tidak dihitung dalam omzet)</span></span>
              <span style={{ fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontWeight: 600, fontSize: 16, color: "#b0492f", textDecoration: "line-through" }}>{fmtRpFull(voidedTotal)}</span>
            </div>
          )}

          {/* Transaction table */}
          <div className="bo-table-scroll" style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0ebe0" }}>
                  {["NO. TRX", "WAKTU", "KASIR", "ITEM", "METODE", "TOTAL"].map(h => (
                    <th key={h} style={{
                      padding: "11px 16px", textAlign: "left",
                      fontSize: 9.5, letterSpacing: "0.15em", textTransform: "uppercase",
                      color: "#8f897a", fontWeight: 600,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#8f897a", fontSize: 13 }}>Memuat...</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#8f897a", fontSize: 13 }}>{isToday ? "Belum ada transaksi hari ini" : "Tidak ada transaksi pada tanggal ini"}</td></tr>
                )}
                {filtered.map(t => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #f8f5ef", opacity: t.voided ? 0.55 : 1 }}>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontSize: 14, fontWeight: 600, color: "#0D1117" }}>{t.no}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontWeight: 600, fontSize: 14, color: "#0D1117" }}>{fmtTime(t.createdAt)}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 13, color: "#0D1117" }}>{t.cashierName || "—"}</span>
                      {t.customerName && <div style={{ fontSize: 11, color: "#96762f" }}>a.n. {t.customerName}</div>}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 12, color: "#8f897a", maxWidth: 220, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        title={Array.isArray(t.items) ? t.items.map(i => `${i.name} ×${i.qty}`).join(", ") : ""}>
                        {Array.isArray(t.items) && t.items.length
                          ? t.items.map(i => i.qty > 1 ? `${i.name} ×${i.qty}` : i.name).join(", ")
                          : "—"}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 12, color: "#0D1117" }}>{methodLabel(t.method)}</span>
                      {t.voided && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#b0492f", background: "rgba(176,73,47,0.1)", padding: "2px 6px", borderRadius: 4 }}>Dibatalkan</span>}
                    </td>
                    <td style={{ padding: "13px 16px", textAlign: "right" }}>
                      <span style={{ fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontSize: 14, fontWeight: 600, color: "#0D1117", textDecoration: t.voided ? "line-through" : "none" }}>Rp {t.total.toLocaleString("id-ID")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* === KASIR TAB (uang kas) === */}
      {tab === "kasir" && summary && (
        <div className="bo-cols-2" style={{ gap: 20 }}>
          {/* Saldo laci card */}
          <div style={{ background: "#0D1117", borderRadius: 14, padding: "24px 28px" }}>
            <p style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(248,246,239,0.5)", fontWeight: 600, marginBottom: 12 }}>
              SALDO LACI {isToday ? "SAAT INI" : ""}
            </p>
            <p style={{ fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontSize: 34, fontWeight: 700, color: "#f8f6ef", marginBottom: 8 }}>
              {fmtRpFull(summary.saldoLaci)}
            </p>
            <p style={{ fontSize: 12, color: "rgba(248,246,239,0.45)", marginBottom: 20 }}>
              Modal awal + penjualan tunai + kas masuk − kas keluar
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
              {[
                { label: "MODAL AWAL", value: summary.modalAwal, color: "#f8f6ef" },
                { label: "PENJUALAN TUNAI", value: summary.autoTunai, color: "#3f7d54" },
                { label: "KAS MASUK", value: summary.kasMasuk, color: "#3f7d54" },
                { label: "KAS KELUAR", value: -summary.kasKeluar, color: "#d98a6a" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(248,246,239,0.45)", fontWeight: 600, marginBottom: 4 }}>{label}</p>
                  <p style={{ fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontWeight: 600, fontSize: 16, color }}>{value < 0 ? "– " : "+ "}{fmtRpFull(Math.abs(value))}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cash movements */}
          <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 14, padding: "20px 24px" }}>
            <p style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 16 }}>
              PERGERAKAN {isToday ? "HARI INI" : "KAS"}
            </p>
            {moves.length === 0 && (
              <p style={{ fontSize: 13, color: "#8f897a" }}>Belum ada pergerakan</p>
            )}
            {moves.map(m => {
              const out = m.amount < 0;
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: out ? "#f4e9e4" : "#e9f1ea",
                    border: `1.5px solid ${out ? "#b0492f" : "#3f7d54"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 14, color: out ? "#b0492f" : "#3f7d54" }}>{out ? "–" : "+"}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 500, color: "#0D1117", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.label}</p>
                    <p style={{ fontSize: 11, color: "#8f897a", marginTop: 1 }}>{[m.time, m.sub].filter(Boolean).join(" · ")}</p>
                  </div>
                  <span style={{ fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontSize: 13, fontWeight: 600, color: out ? "#b0492f" : "#0D1117", whiteSpace: "nowrap" }}>
                    {out ? "–" : "+"} {fmtRpFull(Math.abs(m.amount))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === HUTANG TAB === */}
      {tab === "hutang" && (
        <div className="bo-table-scroll" style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0ebe0" }}>
                {["PELANGGAN", "TANGGAL", "KASIR", "JUMLAH", "DIBAYAR", "SISA", "STATUS"].map(h => (
                  <th key={h} style={{ ...th, textAlign: ["JUMLAH", "DIBAYAR", "SISA"].includes(h) ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "#8f897a", fontSize: 13 }}>Memuat...</td></tr>}
              {!loading && hutangFiltered.length === 0 && <tr><td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "#8f897a", fontSize: 13 }}>{hutang.length === 0 ? "Belum ada catatan hutang" : "Tidak ada pada filter ini"}</td></tr>}
              {hutangFiltered.map(h => (
                <tr key={h.id} style={{ borderBottom: "1px solid #f8f5ef" }}>
                  <td style={td}><span style={{ fontSize: 13, color: "#0D1117" }}>{h.customerName}</span>{h.phone && <span style={{ fontSize: 11, color: "#a49d8c" }}> · {h.phone}</span>}</td>
                  <td style={td}><span style={{ fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontWeight: 600, fontSize: 14, color: "#0D1117" }}>{fmtDate(h.createdAt)}</span></td>
                  <td style={td}><span style={{ fontSize: 12, color: "#8f897a" }}>{h.cashierName || "—"}</span></td>
                  <td style={tdNum}>{fmtRpFull(h.amount)}</td>
                  <td style={tdNum}>{fmtRpFull(h.paidAmount)}</td>
                  <td style={{ ...tdNum, fontWeight: 500 }}>{fmtRpFull(Math.max(0, h.amount - h.paidAmount))}</td>
                  <td style={td}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: hutangColor(h.status), background: `${hutangColor(h.status)}14`, border: `1px solid ${hutangColor(h.status)}40`, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>{hutangLabel(h.status)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === LOG TAB === */}
      {tab === "log" && (
        <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, overflow: "hidden" }}>
          {loading && <p style={{ padding: "40px", textAlign: "center", color: "#8f897a", fontSize: 13 }}>Memuat...</p>}
          {!loading && logs.length === 0 && <p style={{ padding: "40px", textAlign: "center", color: "#8f897a", fontSize: 13 }}>{isToday ? "Belum ada aktivitas hari ini" : "Tidak ada aktivitas pada tanggal ini"}</p>}
          {logs.map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "11px 20px", borderBottom: "1px solid #f8f5ef" }}>
              <span style={{ fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontWeight: 600, fontSize: 13, color: "#8f897a", width: 42, flexShrink: 0 }}>{fmtTime(l.createdAt)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: "#0D1117" }}>{l.detail || l.type}</p>
                {(l.actor || l.type) && <p style={{ fontSize: 11, color: "#a49d8c", marginTop: 1 }}>{[l.actor, l.type].filter(Boolean).join(" · ")}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === TUTUP SHIFT TAB === */}
      {tab === "shift" && (
        !shiftClose ? (
          <div style={{ background: "#fff", border: "1px dashed #e0dac9", borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-garamond)", fontSize: 18, color: "#0D1117", marginBottom: 6 }}>Belum ada tutup shift</p>
            <p style={{ fontSize: 13, color: "#8f897a" }}>Tidak ada nota tutup shift untuk tanggal ini.</p>
          </div>
        ) : (
          <div className="bo-cols-2" style={{ gap: 20 }}>
            {/* Nota */}
            <div style={{ background: "#0D1117", borderRadius: 14, padding: "24px 28px" }}>
              <p style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(248,246,239,0.5)", fontWeight: 600, marginBottom: 12 }}>NOTA TUTUP SHIFT</p>
              <p style={{ fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontSize: 34, fontWeight: 700, color: "#f8f6ef", marginBottom: 6 }}>{fmtRpFull(shiftClose.omzet)}</p>
              <p style={{ fontSize: 12, color: "rgba(248,246,239,0.45)", marginBottom: 20 }}>
                {shiftClose.trx} transaksi · {shiftClose.shiftCount} shift · ditutup {fmtTime(shiftClose.closedAt)}{shiftClose.cashierName ? ` · ${shiftClose.cashierName}` : ""}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
                {[
                  { label: "MODAL AWAL", value: fmtRpFull(shiftClose.modalAwal), color: "#f8f6ef" },
                  { label: "DRAWER SEHARUSNYA", value: fmtRpFull(shiftClose.expected), color: "#f8f6ef" },
                  { label: "DIHITUNG", value: shiftClose.counted != null ? fmtRpFull(shiftClose.counted) : "—", color: "#f8f6ef" },
                  { label: "SELISIH", value: shiftClose.selisih != null ? `${shiftClose.selisih >= 0 ? "+ " : "– "}${fmtRpFull(Math.abs(shiftClose.selisih))}` : "—", color: shiftClose.selisih == null ? "#f8f6ef" : shiftClose.selisih === 0 ? "#3f7d54" : shiftClose.selisih > 0 ? "#e7c987" : "#d98a6a" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(248,246,239,0.45)", fontWeight: 600, marginBottom: 4 }}>{label}</p>
                    <p style={{ fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontWeight: 600, fontSize: 16, color }}>{value}</p>
                  </div>
                ))}
              </div>
              {shiftClose.autoClosed
                ? <p style={{ fontSize: 11.5, color: "rgba(248,246,239,0.4)", marginTop: 16 }}>Ditutup otomatis — kas tidak dihitung.</p>
                : !shiftClose.reconciled && <p style={{ fontSize: 11.5, color: "rgba(248,246,239,0.4)", marginTop: 16 }}>Ditutup tanpa hitung kas.</p>}
            </div>

            {/* Breakdown per method */}
            <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 14, padding: "20px 24px" }}>
              <p style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 12 }}>RINCIAN PER METODE</p>
              {Object.entries(shiftClose.breakdown || {}).length === 0 && <p style={{ fontSize: 13, color: "#8f897a" }}>Tidak ada rincian</p>}
              {Object.entries(shiftClose.breakdown || {}).map(([method, amt]) => (
                <div key={method} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f8f5ef" }}>
                  <span style={{ fontSize: 13, color: "#0D1117", textTransform: "capitalize" }}>{method}</span>
                  <span style={{ fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums", fontWeight: 600, fontSize: 14, color: "#0D1117" }}>{fmtRpFull(Number(amt) || 0)}</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
