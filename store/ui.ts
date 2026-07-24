"use client";
import { create } from "zustand";

type Modal = "none" | "stokMasuk" | "transfer" | "produk" | "tambahKasir" | "tambahShift";

interface UIStore {
  modal: Modal;
  editProductId: string | null;
  openModal: (m: Modal, productId?: string) => void;
  closeModal: () => void;
  // Bumped whenever a modal saves data, so list pages can refetch without a reload.
  dataVersion: number;
  bumpData: () => void;
  // Mobile off-canvas sidebar (desktop ignores this — sidebar is always in-flow there)
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  modal: "none",
  editProductId: null,
  openModal: (m, productId) => set({ modal: m, editProductId: productId ?? null }),
  closeModal: () => set({ modal: "none", editProductId: null }),
  dataVersion: 0,
  bumpData: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
