"use client";

// src/components/cart/ClearCartOnMount.tsx
// Clears Zustand cart from localStorage once an order is successfully confirmed

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

export function ClearCartOnMount() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
