"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Check,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  ProductDTO,
  ProductVariantDTO,
  CompatibilityRecommendation,
  TechnicalSpecDTO,
} from "@/types/storefront";
import { useCartStore } from "@/store/useCartStore";
import SpecBadge from "@/components/catalog/SpecBadge";
import ProductCard from "@/components/catalog/ProductCard";
import { cn } from "@/lib/utils";

interface PDPImage {
  url: string;
  isPrimary: boolean;
  altText?: string | null;
}

interface PDPClientProps {
  product: ProductDTO;
  allImages: PDPImage[];
  compatibilities: CompatibilityRecommendation[];
}

type TabType = "specs" | "description" | "reviews";

export default function PDPClient({
  product,
  allImages,
  compatibilities,
}: PDPClientProps) {
  const addItem = useCartStore((s) => s.addItem);

  // Fallback image handling
  const galleryImages = useMemo(() => {
    if (allImages && allImages.length > 0) {
      return allImages;
    }
    return [
      {
        url:
          product.primaryImageUrl ||
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        isPrimary: true,
        altText: product.name,
      },
    ];
  }, [allImages, product.primaryImageUrl, product.name]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDTO>(
    product.variants[0] || {
      id: "default",
      productId: product.id,
      sku: product.modelNumber || "SKU-DEFAULT",
      edition: "Standard",
      price: product.basePrice,
      stockQuantity: 10,
      lowStockThreshold: 3,
      isAvailable: true,
    }
  );

  const [activeTab, setActiveTab] = useState<TabType>("specs");
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Variant details
  const currentPrice = selectedVariant.price;
  const comparePrice = selectedVariant.compareAtPrice;
  const discountPercent =
    comparePrice && comparePrice > currentPrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : null;

  const isOutOfStock =
    !selectedVariant.isAvailable || selectedVariant.stockQuantity <= 0;
  const isLowStock =
    !isOutOfStock &&
    selectedVariant.stockQuantity <= selectedVariant.lowStockThreshold;

  const handleAddToCart = () => {
    if (isOutOfStock || isAddedToCart) return;

    addItem({
      productVariantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      brandName: product.brand.name,
      series: product.series,
      edition: selectedVariant.edition,
      color: selectedVariant.color,
      unitPrice: currentPrice,
      quantity: 1,
      imageUrl: galleryImages[selectedImageIndex]?.url || product.primaryImageUrl,
      stockAvailable: selectedVariant.stockQuantity,
    });

    setIsAddedToCart(true);
    setTimeout(() => {
      setIsAddedToCart(false);
    }, 1500);
  };

  // Spec helper
  const specs = product.specs || {};
  const specList: { label: string; value: string | number; unit?: string; highlight?: boolean }[] = [];

  if (specs.processor) {
    specList.push({
      label: "Processor",
      value: specs.processor,
      highlight: true,
    });
  }
  if (specs.processorCores) {
    specList.push({
      label: "CPU Cores",
      value: `${specs.processorCores} Cores${specs.processorThreads ? ` / ${specs.processorThreads} Threads` : ""}`,
    });
  }
  if (specs.baseClockGhz || specs.boostClockGhz) {
    specList.push({
      label: "Clock Speeds",
      value: `${specs.baseClockGhz || "?"} GHz Base / ${specs.boostClockGhz || "?"} GHz Boost`,
    });
  }
  if (specs.ramGb) {
    specList.push({
      label: "RAM Memory",
      value: `${specs.ramGb} GB`,
      unit: specs.ramType || "Unified",
      highlight: true,
    });
  }
  if (specs.storageGb) {
    const storageDisplay =
      specs.storageGb >= 1000
        ? `${specs.storageGb / 1000} TB`
        : `${specs.storageGb} GB`;
    specList.push({
      label: "Internal Storage",
      value: storageDisplay,
      unit: specs.storageType || "NVMe PCIe 4.0 SSD",
      highlight: true,
    });
  }
  if (specs.gpuModel) {
    specList.push({
      label: "Graphics Card (GPU)",
      value: specs.gpuModel,
      unit: specs.vramGb ? `${specs.vramGb}GB VRAM` : undefined,
      highlight: true,
    });
  }
  if (specs.displaySizeInches || specs.displayResolution) {
    specList.push({
      label: "Display",
      value: `${specs.displaySizeInches ? `${specs.displaySizeInches}" ` : ""}${specs.displayResolution || ""}`,
      unit: specs.refreshRateHz ? `${specs.refreshRateHz}Hz ${specs.panelType || "OLED"}` : specs.panelType,
      highlight: true,
    });
  }
  if (specs.batteryCapacityWh) {
    specList.push({
      label: "Battery",
      value: specs.batteryCapacityWh,
      unit: "Wh Lithium-Polymer",
    });
  }
  if (specs.powerSupplyWattage) {
    specList.push({
      label: "Power Supply",
      value: specs.powerSupplyWattage,
      unit: "Watts",
    });
  }
  if (specs.weightKg) {
    specList.push({
      label: "Weight",
      value: specs.weightKg,
      unit: "kg",
    });
  }
  if (specs.dimensionsMm) {
    specList.push({
      label: "Dimensions",
      value: specs.dimensionsMm,
      unit: "mm",
    });
  }
  if (specs.operatingSystem) {
    specList.push({
      label: "Operating System",
      value: specs.operatingSystem,
    });
  }
  if (specs.wirelessStandard) {
    specList.push({
      label: "Connectivity",
      value: specs.wirelessStandard,
    });
  }
  if (specs.ioPorts) {
    specList.push({
      label: "I/O Ports",
      value: specs.ioPorts,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600 transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Product Main Section: Gallery & Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 lg:p-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Left: Image Gallery */}
            <div className="flex flex-col space-y-4">
              <div className="relative aspect-square w-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                <Image
                  src={
                    galleryImages[selectedImageIndex]?.url ||
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={
                    galleryImages[selectedImageIndex]?.altText || product.name
                  }
                  fill
                  priority
                  className="object-contain p-6 transition-all duration-300"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {discountPercent && (
                  <div className="absolute top-4 left-4 bg-blue-600 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-full shadow-sm">
                    Save {discountPercent}%
                  </div>
                )}
                {product.featured && (
                  <div className="absolute top-4 right-4 bg-slate-900 text-white font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Featured
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        "relative w-20 h-20 rounded-lg overflow-hidden border-2 bg-slate-50 flex-shrink-0 transition-all",
                        selectedImageIndex === idx
                          ? "border-blue-600 ring-2 ring-blue-100"
                          : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={img.url}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-contain p-1.5"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details & Controls */}
            <div className="flex flex-col">
              {/* Brand & Series */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {product.brand.name}
                </span>
                {product.series && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {product.series}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                {product.name}
              </h1>

              {/* Rating & Stock status row */}
              <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < 4 ? "fill-amber-400" : "fill-amber-200 text-amber-200"
                      )}
                    />
                  ))}
                  <span className="ml-2 text-xs font-semibold text-slate-700">
                    4.9
                  </span>
                  <span className="ml-1 text-xs text-slate-400">
                    (128 reviews)
                  </span>
                </div>

                <span className="text-slate-300">|</span>

                {/* Stock Badge */}
                {isOutOfStock ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Low Stock: {selectedVariant.stockQuantity} remaining
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    In Stock & Ready to Ship
                  </span>
                )}
              </div>

              {/* Price section */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  {comparePrice && comparePrice > currentPrice && (
                    <span className="text-lg text-slate-400 line-through">
                      ${comparePrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Taxes and shipping calculated at checkout. Free 2-day priority delivery.
                </p>
              </div>

              {/* Variant Selector (Editions & Swatches) */}
              {product.variants.length > 1 && (
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                      Edition / Configuration
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {product.variants.map((v) => {
                        const isSelected = selectedVariant.id === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariant(v)}
                            className={cn(
                              "flex flex-col items-start p-3 rounded-lg border text-left transition-all",
                              isSelected
                                ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 text-slate-900"
                                : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                            )}
                          >
                            <span className="text-xs font-bold">{v.edition}</span>
                            <span className="text-xs text-slate-500 mt-0.5">
                              ${v.price.toLocaleString()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Colors if present */}
                  {product.variants.some((v) => v.color) && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                        Selected Finish:{" "}
                        <span className="text-blue-600 font-bold normal-case">
                          {selectedVariant.color || "Standard"}
                        </span>
                      </label>
                      <div className="flex items-center gap-3">
                        {product.variants
                          .filter(
                            (v, index, self) =>
                              v.color &&
                              index === self.findIndex((t) => t.color === v.color)
                          )
                          .map((v) => {
                            const isSelected = selectedVariant.color === v.color;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => setSelectedVariant(v)}
                                className={cn(
                                  "group relative flex items-center justify-center p-1 rounded-full border-2 transition-all",
                                  isSelected
                                    ? "border-blue-600 scale-105"
                                    : "border-transparent hover:border-slate-300"
                                )}
                                title={v.color}
                              >
                                <span
                                  className="w-7 h-7 rounded-full shadow-inner border border-black/10"
                                  style={{
                                    backgroundColor: v.colorHex || "#1E293B",
                                  }}
                                />
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons: Add to Cart & Wishlist */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 mb-8">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm",
                    isAddedToCart
                      ? "bg-emerald-600 text-white shadow-emerald-200"
                      : isOutOfStock
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-blue-200"
                  )}
                >
                  {isAddedToCart ? (
                    <>
                      <Check className="w-5 h-5 animate-in zoom-in" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-semibold text-sm border transition-all",
                    isWishlisted
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  title="Add to wishlist"
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      isWishlisted && "fill-red-500 text-red-500"
                    )}
                  />
                  <span className="hidden sm:inline">Wishlist</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>2-Yr ApexTech Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>30-Day Hassle Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Section: Specs, Description, Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200 px-6 sm:px-10">
            <button
              onClick={() => setActiveTab("specs")}
              className={cn(
                "py-4 px-4 text-sm font-semibold border-b-2 transition-all -mb-px",
                activeTab === "specs"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab("description")}
              className={cn(
                "py-4 px-4 text-sm font-semibold border-b-2 transition-all -mb-px",
                activeTab === "description"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              Product Description
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={cn(
                "py-4 px-4 text-sm font-semibold border-b-2 transition-all -mb-px",
                activeTab === "reviews"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              Reviews (128)
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-10">
            {activeTab === "specs" && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-6">
                  Hardware Specifications & Performance Metrics
                </h3>
                {specList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specList.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-100"
                      >
                        <span className="text-xs font-semibold text-slate-600">
                          {item.label}
                        </span>
                        <div>
                          <SpecBadge
                            label={item.label}
                            value={item.value}
                            unit={item.unit}
                            highlight={item.highlight}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Detailed technical specifications are being verified for this model.
                  </p>
                )}
              </div>
            )}

            {activeTab === "description" && (
              <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-4">
                <p className="text-base font-medium text-slate-800">
                  {product.description}
                </p>
                <p>
                  Engineered to meet the exact demands of creative professionals, software engineers, and power users, the {product.name} delivers breakthrough computational performance with class-leading thermal efficiency.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">
                      Thermal Architecture
                    </h4>
                    <p className="text-xs text-slate-500">
                      Advanced vapor chamber cooling with whisper-quiet dual fans keeps throttling at zero even under 100% sustained multi-core loads.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">
                      Certified Precision
                    </h4>
                    <p className="text-xs text-slate-500">
                      Factory calibrated with 100% DCI-P3 color gamut coverage and sub-1 Delta E accuracy for color-critical workflows.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-center sm:text-left">
                    <div className="text-4xl font-extrabold text-slate-900">
                      4.9
                    </div>
                    <div className="flex items-center text-amber-400 mt-1 justify-center sm:justify-start">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Based on 128 verified customer reviews
                    </p>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    {[
                      { star: 5, pct: "92%" },
                      { star: 4, pct: "6%" },
                      { star: 3, pct: "1%" },
                      { star: 2, pct: "0%" },
                      { star: 1, pct: "1%" },
                    ].map((row) => (
                      <div key={row.star} className="flex items-center gap-3 text-xs">
                        <span className="w-12 text-slate-600">{row.star} stars</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: row.pct }}
                          />
                        </div>
                        <span className="w-8 text-right text-slate-400">{row.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample reviews */}
                <div className="space-y-4 pt-4">
                  {[
                    {
                      author: "Alex Morgan",
                      verified: true,
                      date: "2 days ago",
                      title: "Absolute powerhouse for 4K video rendering and dev builds",
                      comment:
                        "The thermals and build quality are completely unmatched. Docker compiles in seconds, and battery life easily gets me through a full work day without plugging in.",
                    },
                    {
                      author: "Sarah Lin",
                      verified: true,
                      date: "1 week ago",
                      title: "Flawless display calibration and silent fan profile",
                      comment:
                        "As a digital artist, color fidelity is everything. Out of the box it required zero calibration. Best purchase of the year.",
                    },
                  ].map((review, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-100 bg-white"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900">
                            {review.author}
                          </span>
                          {review.verified && (
                            <span className="inline-flex items-center text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">
                              Verified Owner
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {review.date}
                        </span>
                      </div>
                      <div className="flex items-center text-amber-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mb-1">
                        {review.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compatible Accessories Section */}
        {compatibilities.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Compatible Accessories & Add-ons
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Engineered and verified to work seamlessly with {product.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {compatibilities.map((compat, i) => (
                <div key={i} className="relative">
                  <ProductCard product={compat.compatibleProduct} />
                  {compat.discountPercentage && (
                    <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Bundle & Save {compat.discountPercentage}%
                    </div>
                  )}
                  {compat.notes && (
                    <div className="mt-2 text-[11px] text-slate-500 bg-slate-100 rounded-md p-2">
                      💡 {compat.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
