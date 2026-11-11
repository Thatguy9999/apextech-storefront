"use client";

// src/components/cart/CartDrawer.tsx
// Slide-over cart drawer — fixed right panel with overlay, item list, and checkout CTA

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { CartItemRow } from "./CartItemRow";
import { clsx } from "clsx";

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, setDrawerOpen, getSubtotal, getTotalItemsCount } =
    useCartStore();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setDrawerOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setDrawerOpen]);

  const subtotal = getSubtotal();
  const itemCount = getTotalItemsCount();

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const payload = {
        items: items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          ...(item.attachedWarranty && {
            attachedWarranty: item.attachedWarranty,
          }),
        })),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create checkout session.");
      }

      const { checkoutUrl } = await res.json();
      router.push(checkoutUrl);
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      {/* ── Backdrop Overlay ─────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
        className={clsx(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* ── Drawer Panel ─────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={clsx(
          "fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Your Cart</h2>
            {itemCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-blue-600 text-white text-xs font-bold leading-none">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close cart"
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <EmptyCartState onClose={() => setDrawerOpen(false)} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.id} className="px-6 py-4">
                  <CartItemRow item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        {items.length > 0 && (
          <footer className="border-t border-slate-100 px-6 py-5 space-y-4 shrink-0 bg-white">
            {/* Subtotal row */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
              <span className="font-semibold text-slate-900 text-base">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Shipping and taxes calculated at checkout.
            </p>

            {/* Error message */}
            {checkoutError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {checkoutError}
              </p>
            )}

            {/* Checkout CTA */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className={clsx(
                "w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl",
                "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
                "text-white font-semibold text-sm transition-colors",
                "disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              )}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing checkout…</span>
                </>
              ) : (
                <>
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* View full cart */}
            <Link
              href="/cart"
              onClick={() => setDrawerOpen(false)}
              className="block text-center text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              View full cart
            </Link>
          </footer>
        )}
      </div>
    </>
  );
}

/* ── Empty State ──────────────────────────────────────────────────────────── */

function EmptyCartState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-16 text-center">
      {/* SVG illustration */}
      <div className="w-24 h-24 mb-6 rounded-full bg-slate-50 flex items-center justify-center">
        <ShoppingBag className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        Your cart is empty
      </h3>
      <p className="text-sm text-slate-500 mb-8 max-w-[240px]">
        Looks like you haven&apos;t added any items yet. Explore our
        collection to find something you&apos;ll love.
      </p>
      <Link
        href="/products"
        onClick={onClose}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
      >
        Shop Now
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
