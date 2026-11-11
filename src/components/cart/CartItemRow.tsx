"use client";

// src/components/cart/CartItemRow.tsx
// Individual cart line item — quantity stepper, warranty badge, stock warning

import Image from "next/image";
import { Trash2, Minus, Plus, AlertTriangle, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { CartLineItem } from "@/types/storefront";
import { clsx } from "clsx";

interface CartItemRowProps {
  item: CartLineItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem, removeWarranty } = useCartStore();

  const isNearStockLimit =
    item.stockAvailable > 0 && item.quantity >= item.stockAvailable - 2;
  const isAtStockLimit = item.quantity >= item.stockAvailable;

  const handleDecrement = () => {
    updateQuantity(item.id, item.quantity - 1);
  };

  const handleIncrement = () => {
    if (!isAtStockLimit) {
      updateQuantity(item.id, item.quantity + 1);
    }
  };

  return (
    <div className="flex gap-3">
      {/* ── Product Image ───────────────────────────────────────────────── */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
        <Image
          src={item.imageUrl || "https://via.placeholder.com/64x64?text=No+Image"}
          alt={item.productName}
          fill
          sizes="64px"
          className="object-cover"
          unoptimized={item.imageUrl?.startsWith("https://via.placeholder")}
        />
      </div>

      {/* ── Item Details ────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate leading-tight">
              {item.productName}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {item.edition}
              {item.color ? ` · ${item.color}` : ""}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{item.brandName}</p>
          </div>

          {/* Unit price */}
          <p className="text-sm font-semibold text-slate-900 shrink-0">
            ${(item.unitPrice * item.quantity).toFixed(2)}
          </p>
        </div>

        {/* ── Quantity Stepper + Remove ──────────────────────────────────── */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={handleDecrement}
              aria-label="Decrease quantity"
              className={clsx(
                "w-7 h-7 flex items-center justify-center transition-colors",
                item.quantity <= 1
                  ? "text-slate-300 cursor-not-allowed bg-slate-50"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Minus className="w-3 h-3" />
            </button>

            <span className="w-8 text-center text-sm font-medium text-slate-900 select-none">
              {item.quantity}
            </span>

            <button
              onClick={handleIncrement}
              aria-label="Increase quantity"
              disabled={isAtStockLimit}
              className={clsx(
                "w-7 h-7 flex items-center justify-center transition-colors",
                isAtStockLimit
                  ? "text-slate-300 cursor-not-allowed bg-slate-50"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            aria-label={`Remove ${item.productName} from cart`}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* ── Stock Warning ─────────────────────────────────────────────── */}
        {isNearStockLimit && (
          <div className="flex items-center gap-1.5 mt-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-600">
              {isAtStockLimit
                ? `Only ${item.stockAvailable} in stock — you have the max`
                : `Only ${item.stockAvailable - item.quantity} left in stock`}
            </p>
          </div>
        )}

        {/* ── Attached Warranty ─────────────────────────────────────────── */}
        {item.attachedWarranty && (
          <div className="flex items-center justify-between mt-2 pl-2 border-l-2 border-blue-200">
            <div className="min-w-0">
              <p className="text-xs text-blue-700 font-medium truncate">
                + {item.attachedWarranty.name}{" "}
                <span className="font-normal text-blue-500">
                  ({item.attachedWarranty.durationYears}-Year Coverage)
                </span>
              </p>
              <p className="text-xs text-slate-400">
                +${item.attachedWarranty.price.toFixed(2)} / item
              </p>
            </div>
            <button
              onClick={() => removeWarranty(item.id)}
              aria-label="Remove warranty"
              className="ml-2 p-0.5 text-slate-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
