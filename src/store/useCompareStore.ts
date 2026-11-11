// src/store/useCompareStore.ts
// Zustand store for product comparison tray (max 4 items)

import { create } from 'zustand';
import { ProductDTO, ProductVariantDTO } from '@/types/storefront';

export const MAX_COMPARE_ITEMS = 4;

export interface CompareState {
  items: ProductDTO[];
  isDockVisible: boolean;

  // Actions
  toggleItem: (product: ProductDTO, variant?: ProductVariantDTO) => void;
  addItem: (product: ProductDTO) => void;
  removeItem: (productId: string) => void;
  clearAll: () => void;
  setDockVisible: (visible: boolean) => void;

  // Selectors
  isInComparison: (productId: string) => boolean;
  getCount: () => number;
}

export const useCompareStore = create<CompareState>()((set, get) => ({
  items: [],
  isDockVisible: true,

  toggleItem: (product, _variant) => {
    const existing = get().items;
    const idx = existing.findIndex((i) => i.id === product.id);

    if (idx > -1) {
      // Remove from comparison
      const updated = existing.filter((i) => i.id !== product.id);
      set({
        items: updated,
        isDockVisible: updated.length > 0 ? get().isDockVisible : false,
      });
    } else {
      // Add if under limit
      if (existing.length >= MAX_COMPARE_ITEMS) return;
      set({
        items: [...existing, product],
        isDockVisible: true,
      });
    }
  },

  addItem: (product) => {
    const existing = get().items;
    if (existing.some((i) => i.id === product.id)) return;
    if (existing.length >= MAX_COMPARE_ITEMS) return;
    set({
      items: [...existing, product],
      isDockVisible: true,
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const updated = state.items.filter((i) => i.id !== productId);
      return {
        items: updated,
        isDockVisible: updated.length > 0 ? state.isDockVisible : false,
      };
    });
  },

  clearAll: () => set({ items: [], isDockVisible: false }),

  setDockVisible: (visible) => set({ isDockVisible: visible }),

  isInComparison: (productId) => {
    return get().items.some((i) => i.id === productId);
  },

  getCount: () => {
    return get().items.length;
  },
}));
