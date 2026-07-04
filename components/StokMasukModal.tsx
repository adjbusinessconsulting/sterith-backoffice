"use client";
import { useState, useRef } from "react";
import { X } from "lucide-react";
import { useUIStore } from "@/store/ui";

type Step = "method" | "upload" | "reading" | "review" | "manual";

interface ReviewLine {
  name: string; qty: number; unitPrice: number; sku: string | null; isNew: boolean;
}

export default function StokMasukModal() {
  const { modal, closeModal } = useUIStore();
  const [step, setStep] = useState<Step>("method");
  const [file, setFile] = useState<File | null>(null);
  const [supplier, setSupplier] = useState("");
  const [lines, setLines] = useState<ReviewLine[]>([]);
  const [readPct, setReadPct] = useState(0);
  const [readStep, setReadStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [manualLines, setManualLines] = useState([{ name: "", qty: "", price: "", sku: "" }]);
  const fileRef = useRef<HTMLInputElement>(null);

  const open = modal === "stokMasuk";

  function reset() {
    setStep("method"); setFile(null); setSupplier(""); setLines([]);
    setReadPct(0); setReadStep(0); setManualLines([{ name: "", qty: "", price: "", sku: "" }]);
  }

  function handleClose() { reset(); closeModal(); }

  async function startAIScan() {
    if (!file) return;
    setStep("reading");
    setReadPct(0); setReadStep(0);

    const timer1 = setTimeout(() => { setReadPct(35); setReadStep(1); }, 600);
    const timer2 = setTimeout(() => { setReadPct(70); setReadStep(2); }, 1400);

    const form = new FormData();
    form.append("image", file);
    try {
      const res = await fetch("/api/ai/scan-receipt", { method: "POST", body: form });
      const data = await res.json();
      clearTimeout(timer1); clearTimeout(timer2);
      setReadPct(100); setReadStep(3);
      if (data.supplier) setSupplier(data.supplier);
      setLines((data.lines ?? []).map((l: { name: string; qty: number; unitPrice: number; skuGuess?: string | null }) => ({
        name: l.name, qty: l.qty, unitPrice: l.unitPrice, sku: l.skuGuess ?? null, isNew: !l.skuGuess,
      })));
      setTimeout(() => setStep("review"), 400);
    } catch {
      clearTimeout(timer1); clearTimeout(timer2);
      alert("Gagal membaca faktur. Coba lagi.");
      setStep("upload");
    }
  }

  async function confirmStokMasuk() {
    setSubmitting(true);
    const payload = {
      supplier,
      items: lines.map(l => ({ name: l.name, qty: l.qty, unitPrice: l.unitPrice, sku: l.sku })),
    };
    await fetch("/api/stock/masuk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSubmitting(false);
    handleClose();
  }

  async function confirmManual() {
    setSubmitting(true);
    const validLines = manualLines.filter(l => l.name.trim() && parseInt(l.qty) > 0);
    const payload = {
      supplier,
      items: validLines.map(l => ({ name: l.name, qty: parseInt(l.qty), unitPrice: parseInt(l.price) || 0, sku: l.sku || null })),
    };
    await fetch("/api/stock/masuk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSubmitting(false);
    handleClose();
  }

  if (!open) return null;

  const READ_STEPS = ["Mengenali pemasok", "Membaca item", "Mencocokkan SKU..."];

  return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(20,32,58,0.45)", zIndex: 1000 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 720, maxWidth: "95vw", maxHeight: "90vh",
        background: "#fff", borderRadius: 16, zIndex: 1001,
        display: "flex", flexDirection: "column",
        boxShadow: "0 20px 80px rgba(20,32,58,0.22)",
        overflow: "hidden",
      }}>
        {/* Modal header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0ebe0", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "#14203a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f8f6ef" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#14203a" }}>Stok Masuk ke Gudang</p>
            <p style={{ fontSize: 12.5, color: "#8f897a", marginTop: 1 }}>
              {step === "method" ? "Pilih metode input"
               : step === "upload" ? "Unggah faktur supplier"
               : step === "reading" ? "AI membaca faktur"
               : step === "review" ? "Periksa & konfirmasi"
               : "Input manual"}
            </p>
          </div>
          <button onClick={handleClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: "#8f897a", borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* STEP: METHOD */}
          {step === "method" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <button
                onClick={() => setStep("upload")}
                style={{
                  padding: "28px 24px", borderRadius: 14, cursor: "pointer", textAlign: "left",
                  background: "#f8f6ef", border: "2px solid #e7c987",
                  position: "relative",
                }}
              >
                <span style={{
                  position: "absolute", top: 12, right: 12,
                  fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em",
                  color: "#b8934a", background: "#f1e7cd", padding: "2px 8px", borderRadius: 99,
                }}>DIREKOMENDASI</span>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#14203a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f8f6ef" strokeWidth="1.6"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#14203a", marginBottom: 8 }}>Scan struk / faktur</p>
                <p style={{ fontSize: 12.5, color: "#8f897a", lineHeight: 1.6 }}>Foto faktur supplier, AI membaca nama, jumlah, dan harga otomatis.</p>
                <p style={{ fontSize: 11.5, color: "#b8934a", marginTop: 12, fontWeight: 500 }}>✦ Didukung Claude Haiku 4.5</p>
              </button>

              <button
                onClick={() => setStep("manual")}
                style={{ padding: "28px 24px", borderRadius: 14, cursor: "pointer", textAlign: "left", background: "#fff", border: "1.5px solid #e8e3d5" }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f8f6ef", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8f897a" strokeWidth="1.6"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#14203a", marginBottom: 8 }}>Input manual</p>
                <p style={{ fontSize: 12.5, color: "#8f897a", lineHeight: 1.6 }}>Ketik produk, jumlah, dan harga satu per satu.</p>
                <p style={{ fontSize: 11.5, color: "#8f897a", marginTop: 12 }}>Cocok untuk 1–2 item</p>
              </button>
            </div>
          )}

          {/* STEP: UPLOAD */}
          {step === "upload" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: "2px dashed #e8e3d5", borderRadius: 14, padding: "48px 20px",
                    textAlign: "center", cursor: "pointer", marginBottom: 14,
                    background: file ? "#f8f6ef" : "#fff",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.5" style={{ margin: "0 auto 12px" }}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#14203a", marginBottom: 6 }}>Seret foto faktur ke sini</p>
                  <p style={{ fontSize: 12, color: "#8f897a" }}>atau klik untuk unggah · JPG, PNG, HEIC</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
                {file && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8f6ef", border: "1px solid #e8e3d5", borderRadius: 10, padding: "10px 14px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8f897a" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 500, color: "#14203a" }}>{file.name}</p>
                      <p style={{ fontSize: 11, color: "#8f897a" }}>{Math.round(file.size / 1024)} KB · siap dibaca</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3f7d54" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                )}
              </div>

              {/* Sample invoice preview */}
              <div style={{ background: "#f8f6ef", border: "1px solid #e8e3d5", borderRadius: 12, padding: "16px 18px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#14203a", marginBottom: 4 }}>PT SINAR SEMBAKO JAYA</p>
                <p style={{ fontSize: 10.5, color: "#8f897a", marginBottom: 12 }}>Jl. Industri No. 12 · Faktur #INV-2291</p>
                {[["Beras Pandan 5kg ×20", "1.420.000"], ["Minyak Bimoli 2L ×24", "840.000"], ["Gula Pasir 1kg ×30", "405.000"], ["Telur Ayam 1kg ×15", "390.000"], ["Kecap Bango 220ml ×12", "114.000"]].map(([n, p]) => (
                  <div key={n} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11.5, color: "#14203a" }}>{n}</span>
                    <span style={{ fontSize: 11.5, color: "#14203a" }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP: READING */}
          {step === "reading" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", textAlign: "center" }}>
              <div style={{ width: 260, background: "#f8f6ef", border: "1px solid #e8e3d5", borderRadius: 12, padding: "24px 20px", marginBottom: 32 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#14203a", marginBottom: 4 }}>PT SINAR SEMBAKO JAYA</p>
                <p style={{ fontSize: 11, color: "#8f897a", marginBottom: 16 }}>Faktur #INV-2291</p>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ height: 10, background: "#e8e3d5", borderRadius: 4, marginBottom: 8, opacity: 0.5 + i * 0.1 }} />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #e7c987", borderTopColor: "#14203a", animation: "spin 0.8s linear infinite" }} />
                <p style={{ fontSize: 14, color: "#14203a", fontWeight: 500 }}>Claude sedang membaca faktur...</p>
              </div>
              <div style={{ width: 280, height: 5, background: "#f0ebe0", borderRadius: 99, marginBottom: 12, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#e7c987", borderRadius: 99, width: `${readPct}%`, transition: "width 0.4s ease" }} />
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {READ_STEPS.map((s, i) => (
                  <span key={s} style={{ fontSize: 11, color: i < readStep ? "#3f7d54" : i === readStep ? "#b8934a" : "#8f897a", fontWeight: i === readStep ? 600 : 400 }}>
                    {i < readStep ? "✓ " : ""}{s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* STEP: REVIEW */}
          {step === "review" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ background: "#f1e7cd", color: "#b8934a", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>✦ Hasil AI · Claude Haiku 4.5</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #e8e3d5", borderRadius: 8, padding: "6px 12px" }}>
                  <span style={{ fontSize: 11.5, color: "#8f897a" }}>Supplier</span>
                  <input value={supplier} onChange={e => setSupplier(e.target.value)}
                    style={{ border: "none", fontSize: 13, color: "#14203a", fontFamily: "var(--font-hanken)", background: "transparent", minWidth: 160 }} />
                </div>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "#8f897a" }}>Periksa & sesuaikan sebelum simpan</span>
              </div>

              <div style={{ border: "1px solid #e8e3d5", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f0ebe0" }}>
                      {["PRODUK", "QTY", "HARGA SATUAN", "SUBTOTAL", "STATUS", ""].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8f5ef" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <p style={{ fontSize: 13.5, fontWeight: 500, color: "#14203a" }}>{l.name}</p>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <input
                            type="number" value={l.qty}
                            onChange={e => setLines(prev => prev.map((x, j) => j === i ? { ...x, qty: parseInt(e.target.value) || 0 } : x))}
                            style={{ width: 60, height: 34, border: "1.5px solid #e8e3d5", borderRadius: 8, padding: "0 8px", textAlign: "center", fontSize: 14, fontFamily: "var(--font-garamond)", color: "#14203a", background: "#fff" }}
                          />
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <input
                            type="number" value={l.unitPrice}
                            onChange={e => setLines(prev => prev.map((x, j) => j === i ? { ...x, unitPrice: parseInt(e.target.value) || 0 } : x))}
                            style={{ width: 90, height: 34, border: "1.5px solid #e8e3d5", borderRadius: 8, padding: "0 8px", textAlign: "right", fontSize: 14, fontFamily: "var(--font-garamond)", color: "#14203a", background: "#fff" }}
                          />
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontFamily: "var(--font-garamond)", fontSize: 14, color: "#14203a" }}>Rp {(l.qty * l.unitPrice).toLocaleString("id-ID")}</span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 99, color: l.isNew ? "#2a5f78" : "#3f7d54", background: l.isNew ? "#e4f0f5" : "#e9f1ea" }}>
                            {l.isNew ? "Baru" : "Cocok"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px", width: 32 }}>
                          <button onClick={() => setLines(prev => prev.filter((_, j) => j !== i))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8f897a" }}>
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* STEP: MANUAL */}
          {step === "manual" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 10.5, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600, marginBottom: 7 }}>NAMA SUPPLIER</label>
                <input value={supplier} onChange={e => setSupplier(e.target.value)}
                  placeholder="mis. PT Sinar Sembako Jaya"
                  style={{ width: "100%", height: 42, border: "1.5px solid #e8e3d5", borderRadius: 10, padding: "0 14px", fontSize: 14, color: "#14203a", fontFamily: "var(--font-hanken)", background: "#fff" }} />
              </div>

              <div style={{ border: "1px solid #e8e3d5", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f0ebe0" }}>
                      {["NAMA PRODUK", "SKU", "QTY", "HARGA SATUAN", ""].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8f897a", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {manualLines.map((l, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8f5ef" }}>
                        <td style={{ padding: "10px 14px" }}>
                          <input value={l.name} onChange={e => setManualLines(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                            placeholder="Nama produk..." style={{ width: "100%", border: "1.5px solid #e8e3d5", borderRadius: 8, height: 36, padding: "0 10px", fontSize: 13.5, color: "#14203a", fontFamily: "var(--font-hanken)", background: "#fff" }} />
                        </td>
                        <td style={{ padding: "10px 10px" }}>
                          <input value={l.sku} onChange={e => setManualLines(prev => prev.map((x, j) => j === i ? { ...x, sku: e.target.value } : x))}
                            placeholder="SKU" style={{ width: 80, border: "1.5px solid #e8e3d5", borderRadius: 8, height: 36, padding: "0 8px", fontSize: 13, color: "#14203a", fontFamily: "var(--font-hanken)", background: "#fff" }} />
                        </td>
                        <td style={{ padding: "10px 10px" }}>
                          <input type="number" value={l.qty} onChange={e => setManualLines(prev => prev.map((x, j) => j === i ? { ...x, qty: e.target.value } : x))}
                            placeholder="0" style={{ width: 64, border: "1.5px solid #e8e3d5", borderRadius: 8, height: 36, padding: "0 8px", textAlign: "center", fontSize: 14, fontFamily: "var(--font-garamond)", color: "#14203a", background: "#fff" }} />
                        </td>
                        <td style={{ padding: "10px 10px" }}>
                          <input type="number" value={l.price} onChange={e => setManualLines(prev => prev.map((x, j) => j === i ? { ...x, price: e.target.value } : x))}
                            placeholder="0" style={{ width: 100, border: "1.5px solid #e8e3d5", borderRadius: 8, height: 36, padding: "0 8px", textAlign: "right", fontSize: 14, fontFamily: "var(--font-garamond)", color: "#14203a", background: "#fff" }} />
                        </td>
                        <td style={{ padding: "10px 8px", width: 32 }}>
                          {manualLines.length > 1 && (
                            <button onClick={() => setManualLines(prev => prev.filter((_, j) => j !== i))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8f897a" }}>
                              <X size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => setManualLines(prev => [...prev, { name: "", qty: "", price: "", sku: "" }])}
                style={{ fontSize: 12.5, color: "#b8934a", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontFamily: "var(--font-hanken)" }}>
                + Tambah baris
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {(step === "upload" || step === "review" || step === "manual") && (
          <div style={{ padding: "16px 24px", borderTop: "1px solid #f0ebe0", display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0 }}>
            <button
              onClick={() => { if (step === "upload") setStep("method"); else if (step === "review") setStep("upload"); else setStep("method"); }}
              style={{ height: 40, padding: "0 18px", background: "#fff", border: "1.5px solid #e8e3d5", borderRadius: 10, fontSize: 13, color: "#14203a", cursor: "pointer", fontFamily: "var(--font-hanken)" }}
            >
              Kembali
            </button>
            {step === "upload" && (
              <button
                onClick={startAIScan}
                disabled={!file}
                style={{ height: 40, padding: "0 20px", background: !file ? "#e8e3d5" : "#14203a", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: !file ? "#8f897a" : "#f8f6ef", cursor: !file ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-hanken)" }}
              >
                ✦ Baca dengan AI →
              </button>
            )}
            {step === "review" && (
              <button
                onClick={confirmStokMasuk}
                disabled={submitting || lines.length === 0}
                style={{ height: 40, padding: "0 20px", background: "#14203a", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#f8f6ef", cursor: "pointer", fontFamily: "var(--font-hanken)" }}
              >
                {submitting ? "Menyimpan…" : "Konfirmasi stok masuk →"}
              </button>
            )}
            {step === "manual" && (
              <button
                onClick={confirmManual}
                disabled={submitting || manualLines.every(l => !l.name.trim())}
                style={{ height: 40, padding: "0 20px", background: "#14203a", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#f8f6ef", cursor: "pointer", fontFamily: "var(--font-hanken)" }}
              >
                {submitting ? "Menyimpan…" : "Simpan stok masuk →"}
              </button>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
