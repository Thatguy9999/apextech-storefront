"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { ShoppingCart, Check, GitCompare } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useCompareStore } from "@/store/useCompareStore";
import { ProductDTO, ProductVariantDTO } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductDTO;
  variant?: ProductVariantDTO;
}

function getStockStatus(variant?: ProductVariantDTO) {
  if (!variant) return { label: "Out of Stock", color: "red" as const };
  if (!variant.isAvailable || variant.stockQuantity === 0)
    return { label: "Out of Stock", color: "red" as const };
  if (variant.stockQuantity <= variant.lowStockThreshold)
    return {
      label: `Low Stock (${variant.stockQuantity} left)`,
      color: "amber" as const,
    };
  return { label: "In Stock", color: "green" as const };
}

function StockBadge({ variant }: { variant?: ProductVariantDTO }) {
  const { label, color } = getStockStatus(variant);
  const colorMap = {
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    red: "bg-red-50 text-red-700 border border-red-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        colorMap[color]
      )}
    >
      <span
        className={cn("mr-1 h-1.5 w-1.5 rounded-full", {
          "bg-emerald-500": color === "green",
          "bg-amber-500": color === "amber",
          "bg-red-500": color === "red",
        })}
      />
      {label}
    </span>
  );
}

export default function ProductCard({ product, variant }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInComparison } = useCompareStore();

  const [addedToCart, setAddedToCart] = useState(false);
  const inComparison = isInComparison(product.id);

  const activeVariant = variant ?? product.variants[0];
  const price = activeVariant?.price ?? product.basePrice;
  const compareAtPrice = activeVariant?.compareAtPrice;
  const discountPct =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  const isOutOfStock =
    !activeVariant || !activeVariant.isAvailable || activeVariant.stockQuantity === 0;

  const handleAddToCart = useCallback(() => {
    if (!activeVariant || isOutOfStock || addedToCart) return;

    addItem({
      productVariantId: activeVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      brandName: product.brand.name,
      series: product.series,
      edition: activeVariant.edition,
      color: activeVariant.color,
      unitPrice: price,
      quantity: 1,
      imageUrl: product.primaryImageUrl,
      stockAvailable: activeVariant.stockQuantity,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  }, [activeVariant, isOutOfStock, addedToCart, addItem, product, price]);

  const handleCompare = useCallback(() => {
    toggleItem(product, activeVariant ?? product.variants[0]);
  }, [toggleItem, product, activeVariant]);

  return (
    <article className="group flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block">
        <div className="relative h-52 w-full bg-slate-50">
          <Image
            src={product.primaryImageUrl || "https://via.placeholder.com/400x300?text=No+Image"}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        {discountPct && (
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discountPct}%
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Brand */}
        <span className="text-xs uppercase tracking-widest text-slate-500 font-medium">
          {product.brand.name}
        </span>

        {/* Product name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Series badge */}
        {product.series && (
          <span className="self-start bg-slate-100 text-slate-600 text-xs rounded-full px-2.5 py-0.5 font-medium">
            {product.series}
          </span>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-slate-900">
            ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-xs text-slate-400 line-through">
              ${compareAtPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>

        {/* Stock */}
        <StockBadge variant={activeVariant} />

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={addedToCart ? "Added to cart" : "Add to cart"}
          className={cn(
            "mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200",
            addedToCart
              ? "bg-emerald-500 text-white cursor-default"
              : isOutOfStock
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          {addedToCart ? (
            <>
              <Check className="h-4 w-4" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </>
          )}
        </button>

        {/* Compare ghost button */}
        <button
          onClick={handleCompare}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-1.5 text-xs font-medium transition-colors",
            inComparison
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
          )}
        >
          <GitCompare className="h-3.5 w-3.5" />
          {inComparison ? "Remove from Compare" : "Compare"}
        </button>
      </div>
    </article>
  );
}
