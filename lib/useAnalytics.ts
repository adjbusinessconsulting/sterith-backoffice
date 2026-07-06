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

export function useAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, days, setDays };
}

export const fmtRp = (n: number) => {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace(".0", "")}jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`;
  return `Rp ${n}`;
};

export const fmtRpFull = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export const fmtNum = (n: number) => n.toLocaleString("id-ID");
