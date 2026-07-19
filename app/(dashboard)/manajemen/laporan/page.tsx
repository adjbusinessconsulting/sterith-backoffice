"use client";
import { useState, useEffect, useCallback } from "react";

interface Transaction {
  id: string; no: string; kasirId: string; method: string; total: number; createdAt: string; items: unknown;
  kasir?: { name: string };
}

interface CashEntry {
  id: string; entryType: string; amount: number; note: string | null; createdAt: string;
  byUser?: { name: string };
}

interface Summary {
  totalOmzet: number; transaksi: number; tunai: number; qris: number; rataRata: number;
  saldoLaci: number; kasukTotal: number; keluarTotal: number;
}

function fmtRp(n: number) {
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1).replace(".0", "")}jt`;
  if (n >= 1000) return `Rp ${Math.round(n / 1000)}k`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function fmtRpFull(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function LaporanPage() {
  const [tab, setTab] = useState<"riwayat" | "kasir">("riwayat");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashEntries, setCashEntries] = useState<CashEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [trxRes, sumRes] = await Promise.all([
        fetch("/api/reports/transactions"),
        fetch("/api/reports/summary"),
      ]);
      const trx = await trxRes.json();
      const sum = await sumRes.json();
      if (Array.isArray(trx)) setTransactions(trx);
      if (sum && typeof sum === "object") setSummary(sum);

      if (tab === "kasir") {
        const cashRes = await fetch("/api/reports/cash");
        const cash = await cashRes.json();
        if (Array.isArray(cash)) setCashEntries(cash);
      }
    } catch {}
    setLoading(false);
  }, [tab]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalTrx = transactions.length;
  const tunaiCount = transactions.filter(t => t.method === "TUNAI").length;
  const qrisCount = transactions.filter(t => t.method === "QRIS").length;

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
          Tampilan sama seperti di POS — riwayat transaksi dan uang kas.
        </p>
      </div>

      {/* Tab + filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        {/* Riwayat / Kasir tabs */}
        <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 10, padding: 3, display: "flex", gap: 2 }}>
          {(["riwayat", "kasir"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              height: 34, padding: "0 18px", borderRadius: 8,
              background: tab === t ? "#0D1117" : "transparent",
              border: "none",
              color: tab === t ? "#f8f6ef" : "#8f897a",
              fontSize: 13, fontWeight: tab === t ? 600 : 400,
              cursor: "pointer", fontFamily: "var(--font-hanken)",
              textTransform: "capitalize",
            }}>
              {t === "riwayat" ? "Riwayat" : "Kasir"}
            </button>
          ))}
        </div>

        {/* Date */}
        <button style={{
          height: 38, padding: "0 14px",
          background: "#fff", border: "1.5px solid #e8e3d5",
          borderRadius: 10, fontSize: 12.5, color: "#0D1117",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
          fontFamily: "var(--font-hanken)",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8f897a" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Tanggal · Hari ini
        </button>

        {/* Shift */}
        <button style={{
          height: 38, padding: "0 14px",
          background: "#fff", border: "1.5px solid #e8e3d5",
          borderRadius: 10, fontSize: 12.5, color: "#0D1117",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
          fontFamily: "var(--font-hanken)",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8f897a" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Shift · Semua
        </button>

        <div style={{ flex: 1 }} />

        {/* Payment filter */}
        <div style={{ display: "flex", gap: 8 }}>
          {[`Semua · ${totalTrx}`, `Tunai · ${tunaiCount}`, `QRIS · ${qrisCount}`].map(l => (
            <button key={l} style={{
              height: 32, padding: "0 12px", borderRadius: 99,
              background: l.startsWith("Semua") ? "#0D1117" : "#fff",
              border: `1.5px solid ${l.startsWith("Semua") ? "#0D1117" : "#e8e3d5"}`,
              color: l.startsWith("Semua") ? "#f8f6ef" : "#0D1117",
              fontSize: 12, fontWeight: l.startsWith("Semua") ? 600 : 400,
              cursor: "pointer", fontFamily: "var(--font-hanken)",
            }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* === RIWAYAT TAB === */}
      {tab === "riwayat" && (
        <>
          {/* Summary strip */}
          {summary && (
            <div style={{
              background: "#0D1117", borderRadius: 14, padding: "20px 24px",
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: 0, marginBottom: 24,
            }}>
              {[
                { label: "TOTAL OMZET HARI INI", value: fmtRpFull(summary.totalOmzet) },
                { label: "TRANSAKSI", value: String(summary.transaksi) },
                { label: "RATA-RATA", value: fmtRp(summary.rataRata) },
                { label: "SHIFT AKTIF", value: "Shift 2" },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: "0 20px", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
                  <p style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(248,246,239,0.5)", fontWeight: 600, marginBottom: 8 }}>{label}</p>
                  <p style={{ fontFamily: "var(--font-garamond)", fontSize: 26, fontWeight: 500, color: label === "TRANSAKSI" ? "#e7c987" : "#f8f6ef", fontFeatureSettings: '"onum"' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Transaction table */}
          <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 12, overflow: "hidden" }}>
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
                {!loading && transactions.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#8f897a", fontSize: 13 }}>Belum ada transaksi hari ini</td></tr>
                )}
                {transactions.map(t => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #f8f5ef" }}>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontFamily: "var(--font-garamond)", fontSize: 14, fontWeight: 500, color: "#0D1117" }}>{t.no}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontFamily: "var(--font-garamond)", fontSize: 14, color: "#0D1117" }}>{fmtTime(t.createdAt)}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 13, color: "#0D1117" }}>{t.kasir?.name ?? "—"}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 12, color: "#8f897a", maxWidth: 180, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {Array.isArray(t.items) ? t.items.map((i: { name?: string }) => i.name).join(", ") : "—"}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 12, color: "#0D1117" }}>{t.method}</span>
                    </td>
                    <td style={{ padding: "13px 16px", textAlign: "right" }}>
                      <span style={{ fontFamily: "var(--font-garamond)", fontSize: 14, fontWeight: 500, color: "#0D1117" }}>Rp {t.total.toLocaleString("id-ID")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* === KASIR TAB === */}
      {tab === "kasir" && summary && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Saldo laci card */}
          <div style={{ background: "#0D1117", borderRadius: 14, padding: "24px 28px" }}>
            <p style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(248,246,239,0.5)", fontWeight: 600, marginBottom: 12 }}>
              SALDO LACI SAAT INI
            </p>
            <p style={{ fontFamily: "var(--font-garamond)", fontSize: 34, fontWeight: 500, color: "#f8f6ef", marginBottom: 8 }}>
              {fmtRpFull(summary.saldoLaci)}
            </p>
            <p style={{ fontSize: 12, color: "rgba(248,246,239,0.45)", marginBottom: 20 }}>
              Modal awal + omzet tunai
            </p>
            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <p style={{ fontSize: 9.5, letterSpacing: "0.15em", textTransform: "uppercase", color: "#3f7d54", fontWeight: 600, marginBottom: 4 }}>MASUK</p>
                <p style={{ fontFamily: "var(--font-garamond)", fontSize: 16, color: "#3f7d54" }}>+ {fmtRpFull(summary.kasukTotal)}</p>
              </div>
              <div>
                <p style={{ fontSize: 9.5, letterSpacing: "0.15em", textTransform: "uppercase", color: "#b0492f", fontWeight: 600, marginBottom: 4 }}>KELUAR</p>
                <p style={{ fontFamily: "var(--font-garamond)", fontSize: 16, color: "#b0492f" }}>– {fmtRpFull(summary.keluarTotal)}</p>
              </div>
            </div>
          </div>

          {/* Cash movements */}
          <div style={{ background: "#fff", border: "1px solid #e8e3d5", borderRadius: 14, padding: "20px 24px" }}>
            <p style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 16 }}>
              PERGERAKAN HARI INI
            </p>
            {cashEntries.length === 0 && (
              <p style={{ fontSize: 13, color: "#8f897a" }}>Belum ada pergerakan</p>
            )}
            {cashEntries.slice(0, 8).map(e => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: e.entryType === "IN" || e.entryType === "OPEN" || e.entryType === "AUTO_SALES" ? "#e9f1ea" : "#f4e9e4",
                  border: `1.5px solid ${e.entryType === "IN" || e.entryType === "AUTO_SALES" ? "#3f7d54" : "#b0492f"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 14, color: e.entryType === "IN" || e.entryType === "AUTO_SALES" ? "#3f7d54" : "#b0492f" }}>
                    {e.entryType === "OUT" ? "–" : "+"}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 500, color: "#0D1117", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.note ?? e.entryType}</p>
                  <p style={{ fontSize: 11, color: "#8f897a", marginTop: 1 }}>
                    {fmtTime(e.createdAt)} · {e.byUser?.name}
                  </p>
                </div>
                <span style={{ fontFamily: "var(--font-garamond)", fontSize: 13, fontWeight: 500, color: e.entryType === "OUT" ? "#b0492f" : "#0D1117", whiteSpace: "nowrap" }}>
                  {e.entryType === "OUT" ? "–" : "+"} {fmtRpFull(e.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
