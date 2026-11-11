"use client";

// src/components/cart/CrossSellCard.tsx
// Compatible product recommendation card for cart upsell sections

import Image from "next/image";
import { Plus, Star, Tag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { CompatibilityRecommendation } from "@/types/storefront";
import { clsx } from "clsx";

interface CrossSellCardProps {
  recommendation: CompatibilityRecommendation;
}

const COMPATIBILITY_LABELS: Record<string, string> = {
  ACCESSORY: "Accessory",
  CHARGER: "Charger",
  WARRANTY: "Protection Plan",
  SPARE_PART: "Spare Part",
  SOFTWARE_BUNDLE: "Software Bundle",
};

const COMPATIBILITY_COLORS: Record<string, string> = {
  ACCESSORY: "bg-purple-50 text-purple-700 border-purple-200",
  CHARGER: "bg-orange-50 text-orange-700 border-orange-200",
  WARRANTY: "bg-green-50 text-green-700 border-green-200",
  SPARE_PART: "bg-slate-50 text-slate-700 border-slate-200",
  SOFTWARE_BUNDLE: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export function CrossSellCard({ recommendation }: CrossSellCardProps) {
  const { addItem } = useCartStore();
  const { compatibleProduct, compatibilityType, isRecommended, discountPercentage } =
    recommendation;

  const baseVariant = compatibleProduct.variants[0];
  const displayPrice = baseVariant?.price ?? compatibleProduct.basePrice;
  const compareAtPrice = baseVariant?.compareAtPrice;

  const handleAddToCart = () => {
    if (!baseVariant) return;

    addItem({
      productVariantId: baseVariant.id,
      productId: compatibleProduct.id,
      productName: compatibleProduct.name,
      productSlug: compatibleProduct.slug,
      brandName: compatibleProduct.brand.name,
      series: compatibleProduct.series,
      edition: baseVariant.edition,
      color: baseVariant.color,
      unitPrice: displayPrice,
      quantity: 1,
      imageUrl: compatibleProduct.primaryImageUrl,
      stockAvailable: baseVariant.stockQuantity,
    });
  };

  const compatLabel = COMPATIBILITY_LABELS[compatibilityType] ?? compatibilityType;
  const compatStyle =
    COMPATIBILITY_COLORS[compatibilityType] ?? "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <div className="flex gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all group">
      {/* ── Product Image ───────────────────────────────────────────────── */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
        <Image
          src={
            compatibleProduct.primaryImageUrl ||
            "https://via.placeholder.com/56x56?text=+"
          }
          alt={compatibleProduct.name}
          fill
          sizes="56px"
          className="object-cover"
          unoptimized={compatibleProduct.primaryImageUrl?.startsWith("https://via.placeholder")}
        />
      </div>

      {/* ── Info ────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span
            className={clsx(
              "inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full border leading-tight",
              compatStyle
            )}
          >
            {compatLabel}
          </span>
          {isRecommended && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 leading-tight">
              <Star className="w-2.5 h-2.5 fill-blue-600 stroke-blue-600" />
              Recommended
            </span>
          )}
          {discountPercentage && discountPercentage > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200 leading-tight">
              <Tag className="w-2.5 h-2.5" />
              Save {discountPercentage}%
            </span>
          )}
        </div>

        {/* Product name */}
        <p className="text-sm font-medium text-slate-900 leading-tight truncate">
          {compatibleProduct.name}
        </p>
        <p className="text-xs text-slate-400 truncate">{compatibleProduct.brand.name}</p>

        {/* Price + Add button */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-slate-900">
              ${displayPrice.toFixed(2)}
            </span>
            {compareAtPrice && compareAtPrice > displayPrice && (
              <span className="text-xs text-slate-400 line-through">
                ${compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!baseVariant || !baseVariant.isAvailable}
            className={clsx(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors",
              "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600"
            )}
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
