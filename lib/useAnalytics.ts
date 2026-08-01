"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export interface AnalyticsData {
  range: { days: number; from: string; to: string };
  totals: { revenue: number; transactions: number; avgBasket: number; itemsSold: number };
  daily: { date: string; revenue: number; transactions: number }[];
  hourly: { hour: number; revenue: number; transactions: number }[];
  paymentMix: { method: string; revenue: number; count: number }[];
  cashiers: { cashierId: string; cashierName: string; revenue: number; transactions: number; avgBasket: number; shifts: Record<number, number> }[];
  products: { productId: string; productName: string; qty: number; revenue: number }[];
  deadStock: { id: string; name: string; emoji: string | null; category: string; stock: number }[];
}

export interface CustomRange { from: string; to: string }  // YYYY-MM-DD

// Answers already fetched this page-load, keyed by query string. Switching between
// periods is the common move, and re-asking the server for a month you looked at
// ten seconds ago is the whole reason the tabs felt sluggish.
const cache = new Map<string, AnalyticsData>();

export function useAnalytics(initialCustom?: CustomRange) {
  const [days, setDaysState] = useState(30);
  const [custom, setCustomState] = useState<CustomRange | null>(initialCustom ?? null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const inFlight = useRef<AbortController | null>(null);

  // Choosing a preset clears the custom range; choosing a custom range parks days at 0.
  const setDays = useCallback((d: number) => { setCustomState(null); setDaysState(d); }, []);
  const setCustom = useCallback((r: CustomRange) => { setDaysState(0); setCustomState(r); }, []);

  const load = useCallback(async () => {
    const tz = -new Date().getTimezoneOffset();   // minutes east of UTC (WIB = 420)
    const qs = custom ? `from=${custom.from}&to=${custom.to}` : `days=${days}`;
    const key = `${qs}&tz=${tz}`;

    // Show what we already have straight away, then refresh it underneath — the
    // period switch feels instant and the figures still end up current.
    const hit = cache.get(key);
    if (hit) { setData(hit); setLoading(false); } else { setLoading(true); }

    // Drop the previous request. Without this the slowest reply wins, so rattling
    // through the tabs could leave one period's numbers under another's label.
    inFlight.current?.abort();
    const ctrl = new AbortController();
    inFlight.current = ctrl;

    try {
      const res = await fetch(`/api/analytics?${key}`, { signal: ctrl.signal });
      if (!res.ok) return;
      const fresh: AnalyticsData = await res.json();
      cache.set(key, fresh);
      if (!ctrl.signal.aborted) setData(fresh);
    } catch {
      /* aborted or offline — keep showing whatever is on screen */
    } finally {
      if (inFlight.current === ctrl) { inFlight.current = null; setLoading(false); }
    }
  }, [days, custom]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => () => inFlight.current?.abort(), []);   // cancel on unmount

  return { data, loading, days, setDays, custom, setCustom };
}

export const fmtRp = (n: number) => {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace(".0", "")}jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`;
  return `Rp ${n}`;
};

export const fmtRpFull = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export const fmtNum = (n: number) => n.toLocaleString("id-ID");
