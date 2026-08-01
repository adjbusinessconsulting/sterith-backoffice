"use client";
import { useState } from "react";

export interface Bar {
  key: string;
  label: string;              // "12 Jul" / "14.00" — shown as the tooltip heading
  value: number;              // the bar's height driver (omzet)
  valueText: string;          // preformatted, e.g. "Rp 1.250.000"
  meta?: string;              // "4 transaksi"
  emphasis?: boolean;         // peak bar — drawn in ink
}

/**
 * Bars with a readable hover/tap readout.
 *
 * The native `title` attribute this replaces waited about a second, rendered in
 * the OS tooltip style, and never appeared on touch at all — so on a phone the
 * figures behind the chart were simply unreachable.
 */
export default function BarChart({
  bars, height = 150, gap = 3, footer,
}: { bars: Bar[]; height?: number; gap?: number; footer?: React.ReactNode }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...bars.map(b => b.value), 1);
  const cur = active === null ? null : bars[active];

  // Anchor the readout over the hovered bar, but keep it inside the panel:
  // near either end it hugs that edge instead of hanging off the card.
  const centre = active === null ? 0 : ((active + 0.5) / bars.length) * 100;
  const side = centre < 14 ? "start" : centre > 86 ? "end" : "centre";
  const place: React.CSSProperties =
    side === "start" ? { left: 0 }
    : side === "end" ? { right: 0 }
    : { left: `${centre}%`, transform: "translateX(-50%)" };

  return (
    <div style={{ position: "relative" }} onPointerLeave={() => setActive(null)}>
      {cur && (
        <div
          role="status"
          style={{
            position: "absolute", bottom: height + 10, zIndex: 5, ...place,
            background: "#0D1117", color: "#f8f6ef", borderRadius: 10,
            padding: "9px 12px", pointerEvents: "none", whiteSpace: "nowrap",
            boxShadow: "0 6px 18px rgba(13,17,23,.18)",
          }}
        >
          <div style={{
            fontFamily: "var(--font-hanken)", fontSize: 9.5, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#c9a55f", fontWeight: 600,
          }}>{cur.label}</div>
          <div style={{
            fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums",
            fontSize: 16, fontWeight: 700, marginTop: 3,
          }}>{cur.valueText}</div>
          {cur.meta && (
            <div style={{
              fontFamily: "var(--font-hanken)", fontVariantNumeric: "tabular-nums lining-nums",
              fontSize: 11, color: "#a8a294", marginTop: 2,
            }}>{cur.meta}</div>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-end", gap, height }}>
        {bars.map((b, i) => {
          const on = active === i;
          const bg = b.emphasis ? "#0D1117"
            : b.value > 0 ? "linear-gradient(180deg,#e7c987,#b8934a)"
            : "#ece8dc";
          return (
            <button
              key={b.key}
              type="button"
              aria-label={`${b.label}: ${b.valueText}${b.meta ? ", " + b.meta : ""}`}
              onPointerEnter={() => setActive(i)}
              onPointerDown={() => setActive(i)}     // touch: tap a bar to read it
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              style={{
                flex: 1, minWidth: 2, padding: 0, border: "none", cursor: "pointer",
                height: `${Math.max((b.value / max) * 100, b.value > 0 ? 3 : 0.5)}%`,
                background: bg,
                borderRadius: "3px 3px 1px 1px",
                // Dim the rest rather than brightening the hovered bar, so the gold
                // stays the same gold and only the comparison changes.
                opacity: active === null || on ? 1 : 0.45,
                transition: "opacity .12s ease",
              }}
            />
          );
        })}
      </div>
      {footer}
    </div>
  );
}
