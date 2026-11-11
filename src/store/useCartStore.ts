// src/store/useCartStore.ts
// Zustand global state management for persistent cart and micro-interactions

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartLineItem } from '@/types/storefront';

interface CartState {
  items: CartLineItem[];
  isOpen: boolean;
  isUpdating: boolean;

  // Actions
  addItem: (item: Omit<CartLineItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  attachWarranty: (itemId: string, warranty: CartLineItem['attachedWarranty']) => void;
  removeWarranty: (itemId: string) => void;
  clearCart: () => void;
  setDrawerOpen: (open: boolean) => void;

  // Computed Selectors
  getSubtotal: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isUpdating: false,

      addItem: (newItem) => {
        const currentItems = get().items;
        const compositeKey = `${newItem.productVariantId}_${newItem.attachedWarranty?.warrantyId || 'nowarranty'}`;
        
        const existingIndex = currentItems.findIndex((i) => i.id === compositeKey);

        if (existingIndex > -1) {
          // Update quantity within available stock limits
          const updated = [...currentItems];
          const target = updated[existingIndex];
          const nextQty = Math.min(target.quantity + newItem.quantity, target.stockAvailable);
          updated[existingIndex] = { ...target, quantity: nextQty };
          set({ items: updated, isOpen: true });
        } else {
          // Insert new line item
          const lineItem: CartLineItem = {
            ...newItem,
            id: compositeKey,
            quantity: Math.min(newItem.quantity, newItem.stockAvailable),
          };
          set({ items: [...currentItems, lineItem], isOpen: true });
        }
      },

      removeItem: (itemId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === itemId) {
              const boundedQty = Math.min(quantity, item.stockAvailable);
              return { ...item, quantity: boundedQty };
            }
            return item;
          }),
        }));
      },

      attachWarranty: (itemId: string, warranty) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, attachedWarranty: warranty } : item
          ),
        }));
      },

      removeWarranty: (itemId: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, attachedWarranty: undefined } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      setDrawerOpen: (open: boolean) => {
        set({ isOpen: open });
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const itemBase = item.unitPrice * item.quantity;
          const warrantyCost = item.attachedWarranty ? item.attachedWarranty.price * item.quantity : 0;
          return total + itemBase + warrantyCost;
        }, 0);
      },

      getTotalItemsCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: 'apextech_cart_session_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

