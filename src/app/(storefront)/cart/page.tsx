"use client";

// src/app/(storefront)/cart/page.tsx
// Full-page cart view with two-column layout: items list + order summary

import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingBag, ArrowRight, Loader2, ChevronRight, Package } from "lucide-react";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { clsx } from "clsx";

// Placeholder cross-sell products for "You Might Also Need"
const PLACEHOLDER_ACCESSORIES = [
  {
    id: "acc-1",
    name: "ApexTech USB-C 140W GaN Charger",
    brand: "ApexTech",
    price: 69.99,
    image: "https://via.placeholder.com/80x80?text=Charger",
    badge: "Charger",
  },
  {
    id: "acc-2",
    name: "Slim Laptop Carry Sleeve 16\"",
    brand: "ApexTech",
    price: 39.99,
    image: "https://via.placeholder.com/80x80?text=Sleeve",
    badge: "Accessory",
  },
  {
    id: "acc-3",
    name: "3-Year Extended Warranty Plan",
    brand: "ApexTech Care",
    price: 149.99,
    image: "https://via.placeholder.com/80x80?text=Warranty",
    badge: "Protection",
  },
];

export default function CartPage() {
  const router = useRouter();
  const { items, getSubtotal, getTotalItemsCount } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const itemCount = getTotalItemsCount();
  const shippingCost = subtotal >= 99 ? 0 : 9.99;
  const estimatedTotal = subtotal + shippingCost;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const payload = {
        items: items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          ...(item.attachedWarranty && { attachedWarranty: item.attachedWarranty }),
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

  // ── Empty State ──────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Your cart is empty
          </h2>
          <p className="text-slate-500 mb-8">
            Looks like you haven&apos;t added anything yet. Discover our range of
            premium electronics.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  // ── Filled Cart ──────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-medium">Cart</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
          Shopping Cart
          <span className="ml-3 text-base font-normal text-slate-400">
            ({itemCount} item{itemCount !== 1 ? "s" : ""})
          </span>
        </h1>

        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 items-start">
          {/* ── Left Column: Items ───────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {items.map((item) => (
                  <li key={item.id} className="p-5 sm:p-6">
                    <CartItemRow item={item} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Continue shopping link */}
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors px-1"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              Continue Shopping
            </Link>

            {/* ── Cross-sell Section ────────────────────────────────────── */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                You Might Also Need
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {PLACEHOLDER_ACCESSORIES.map((acc) => (
                  <div
                    key={acc.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    {/* Badge */}
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 mb-3">
                      {acc.badge}
                    </span>
                    {/* Product info */}
                    <div className="flex items-start gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={acc.image}
                          alt={acc.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 leading-tight line-clamp-2">
                          {acc.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{acc.brand}</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">
                          ${acc.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button className="mt-3 w-full py-1.5 text-xs font-semibold rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                      + Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column: Order Summary ──────────────────────────────── */}
          <div className="mt-8 lg:mt-0 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>

              {/* Line items summary */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                  </span>
                  <span className="text-slate-900 font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Estimated Shipping</span>
                  <span
                    className={clsx(
                      "font-medium",
                      shippingCost === 0 ? "text-green-600" : "text-slate-900"
                    )}
                  >
                    {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                {shippingCost > 0 && (
                  <p className="text-xs text-slate-400 -mt-1">
                    Free shipping on orders over $99
                  </p>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax</span>
                  <span className="text-slate-400 italic text-xs self-center">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">Estimated Total</span>
                  <span className="font-bold text-slate-900 text-lg">
                    ${estimatedTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  *Final total calculated at checkout after tax
                </p>
              </div>

              {/* Error */}
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
                  "disabled:opacity-70 disabled:cursor-not-allowed",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                )}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing Checkout…
                  </>
                ) : (
                  <>
                    Checkout
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Package className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  Free returns within 30 days
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg
                    className="w-3.5 h-3.5 text-green-500 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Secure checkout powered by Stripe
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
