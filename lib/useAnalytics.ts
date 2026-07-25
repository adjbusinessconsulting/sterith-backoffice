"use client";
import { useState, useEffect, useCallback } from "react";

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

export function useAnalytics() {
  const [days, setDaysState] = useState(30);
  const [custom, setCustomState] = useState<CustomRange | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Choosing a preset clears the custom range; choosing a custom range parks days at 0.
  const setDays = useCallback((d: number) => { setCustomState(null); setDaysState(d); }, []);
  const setCustom = useCallback((r: CustomRange) => { setDaysState(0); setCustomState(r); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = custom ? `from=${custom.from}&to=${custom.to}` : `days=${days}`;
      const res = await fetch(`/api/analytics?${qs}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [days, custom]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, days, setDays, custom, setCustom };
}

export const fmtRp = (n: number) => {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace(".0", "")}jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`;
  return `Rp ${n}`;
};

export const fmtRpFull = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export const fmtNum = (n: number) => n.toLocaleString("id-ID");
