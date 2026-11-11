'use client';

// src/components/compare/CompareTable.tsx
// Side-by-side technical specification matrix table with best-in-class highlights

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check, X, ExternalLink, Sparkles } from 'lucide-react';
import { ProductDTO } from '@/types/storefront';
import { useCartStore } from '@/store/useCartStore';
import { useCompareStore } from '@/store/useCompareStore';
import { formatCurrency, formatRam, formatStorage, formatResolution, cn } from '@/lib/utils';

export interface CompareTableProps {
  products: ProductDTO[];
}

interface SpecRowConfig {
  id: string;
  label: string;
  category?: string;
  better?: 'higher' | 'lower';
  getRaw?: (p: ProductDTO) => number | undefined;
  getValue: (p: ProductDTO) => React.ReactNode;
}

export function CompareTable({ products }: CompareTableProps) {
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCompareStore((s) => s.removeItem);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const handleAddToCart = (product: ProductDTO) => {
    const activeVariant =
      product.variants?.find((v) => v.isAvailable) ?? product.variants?.[0];
    if (!activeVariant) return;

    addItem({
      productVariantId: activeVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      brandName: product.brand?.name ?? '',
      series: product.series,
      edition: activeVariant.edition,
      color: activeVariant.color,
      unitPrice: activeVariant.price ?? product.basePrice,
      quantity: 1,
      imageUrl: product.primaryImageUrl,
      stockAvailable: activeVariant.stockQuantity ?? 10,
    });

    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  // Specification Row Definitions matching exact spec requirements
  const specRows: SpecRowConfig[] = [
    {
      id: 'brand',
      label: 'Brand',
      getValue: (p) => p.brand?.name || null,
    },
    {
      id: 'series',
      label: 'Series',
      getValue: (p) => p.series || null,
    },
    {
      id: 'price',
      label: 'Price',
      better: 'lower',
      getRaw: (p) => {
        const v = p.variants?.find((x) => x.isAvailable) ?? p.variants?.[0];
        return v?.price ?? p.basePrice;
      },
      getValue: (p) => {
        const v = p.variants?.find((x) => x.isAvailable) ?? p.variants?.[0];
        const pr = v?.price ?? p.basePrice;
        return (
          <span className="font-bold text-slate-900 text-base">
            {formatCurrency(pr)}
          </span>
        );
      },
    },
    {
      id: 'processor',
      label: 'Processor',
      getValue: (p) => {
        if (!p.specs?.processor) return null;
        const cores = p.specs.processorCores ? ` (${p.specs.processorCores} Cores)` : '';
        return `${p.specs.processor}${cores}`;
      },
    },
    {
      id: 'ram',
      label: 'RAM',
      better: 'higher',
      getRaw: (p) => p.specs?.ramGb,
      getValue: (p) => (p.specs?.ramGb ? formatRam(p.specs.ramGb, p.specs.ramType) : null),
    },
    {
      id: 'storage',
      label: 'Storage',
      better: 'higher',
      getRaw: (p) => p.specs?.storageGb,
      getValue: (p) => {
        if (!p.specs?.storageGb) return null;
        const formatted = formatStorage(p.specs.storageGb);
        return p.specs.storageType ? `${formatted} ${p.specs.storageType}` : formatted;
      },
    },
    {
      id: 'gpu',
      label: 'GPU',
      getValue: (p) => p.specs?.gpuModel || null,
    },
    {
      id: 'vram',
      label: 'VRAM',
      better: 'higher',
      getRaw: (p) => p.specs?.vramGb,
      getValue: (p) => (p.specs?.vramGb ? `${p.specs.vramGb} GB` : null),
    },
    {
      id: 'displaySize',
      label: 'Display Size',
      better: 'higher',
      getRaw: (p) => (p.specs?.displaySizeInches ? Number(p.specs.displaySizeInches) : undefined),
      getValue: (p) => (p.specs?.displaySizeInches ? `${p.specs.displaySizeInches}"` : null),
    },
    {
      id: 'resolution',
      label: 'Resolution',
      getValue: (p) =>
        p.specs?.displayResolution ? formatResolution(p.specs.displayResolution) : null,
    },
    {
      id: 'panelType',
      label: 'Panel Type',
      getValue: (p) => p.specs?.panelType || null,
    },
    {
      id: 'refreshRate',
      label: 'Refresh Rate',
      better: 'higher',
      getRaw: (p) => p.specs?.refreshRateHz,
      getValue: (p) => (p.specs?.refreshRateHz ? `${p.specs.refreshRateHz} Hz` : null),
    },
    {
      id: 'battery',
      label: 'Battery',
      better: 'higher',
      getRaw: (p) =>
        p.specs?.batteryCapacityWh ? Number(p.specs.batteryCapacityWh) : undefined,
      getValue: (p) =>
        p.specs?.batteryCapacityWh ? `${p.specs.batteryCapacityWh} Wh` : null,
    },
    {
      id: 'os',
      label: 'OS',
      getValue: (p) => p.specs?.operatingSystem || null,
    },
    {
      id: 'weight',
      label: 'Weight',
      better: 'lower',
      getRaw: (p) => (p.specs?.weightKg ? Number(p.specs.weightKg) : undefined),
      getValue: (p) => (p.specs?.weightKg ? `${p.specs.weightKg} kg` : null),
    },
    {
      id: 'ioPorts',
      label: 'I/O Ports',
      getValue: (p) => p.specs?.ioPorts || null,
    },
  ];

  // Compute best value per row for highlighting
  const bestMap: Record<string, number | null> = {};

  specRows.forEach((row) => {
    if (!row.better || !row.getRaw) return;

    const rawValues = products
      .map((p) => row.getRaw!(p))
      .filter((v): v is number => typeof v === 'number' && !isNaN(v) && v > 0);

    // Only compute "Best" if there are at least two distinct values to compare
    const uniqueValues = Array.from(new Set(rawValues));
    if (uniqueValues.length >= 2) {
      if (row.better === 'higher') {
        bestMap[row.id] = Math.max(...rawValues);
      } else {
        bestMap[row.id] = Math.min(...rawValues);
      }
    } else {
      bestMap[row.id] = null;
    }
  });

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Horizontal scroll container for full responsiveness */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
        <table className="w-full border-collapse text-left min-w-[700px]">
          {/* Column definitions */}
          <colgroup>
            <col className="w-48 sm:w-60 min-w-[190px]" />
            {products.map((p) => (
              <col key={p.id} className="min-w-[220px]" />
            ))}
          </colgroup>

          {/* Sticky Header with Product Cards */}
          <thead className="sticky top-16 z-20 bg-white border-b border-slate-200 shadow-[0_4px_6px_-2px_rgba(0,0,0,0.04)]">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-30 bg-white p-4 sm:p-6 border-r border-slate-200 align-bottom"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Specification
                </div>
                <div className="text-sm font-semibold text-slate-800 mt-1">
                  Comparing {products.length} Products
                </div>
              </th>

              {products.map((product) => {
                const activeVariant =
                  product.variants?.find((v) => v.isAvailable) ?? product.variants?.[0];
                const isOutOfStock =
                  !activeVariant ||
                  !activeVariant.isAvailable ||
                  activeVariant.stockQuantity === 0;
                const isAdded = addedMap[product.id];

                return (
                  <th
                    key={product.id}
                    scope="col"
                    className="p-4 sm:p-6 text-center align-top border-r last:border-r-0 border-slate-200 bg-white"
                  >
                    <div className="flex flex-col items-center gap-3">
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="self-end p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                        title="Remove from comparison"
                        aria-label={`Remove ${product.name} from comparison`}
                      >
                        <X className="h-4 w-4" />
                      </button>

                      {/* Product Thumbnail (120x120 centered) */}
                      <div className="relative w-[120px] h-[120px] rounded-xl bg-slate-50 flex items-center justify-center p-2 border border-slate-100 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            product.primaryImageUrl ||
                            'https://via.placeholder.com/120?text=Apex'
                          }
                          alt={product.name}
                          className="max-w-[120px] max-h-[120px] w-auto h-auto object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>

                      {/* Brand & Name */}
                      <div className="text-center">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                          {product.brand?.name}
                        </span>
                        <Link
                          href={`/products/${product.slug}`}
                          className="group flex items-center justify-center gap-1 mt-1 text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          <span>{product.name}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </Link>
                      </div>

                      {/* Quick Add To Cart Button */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                        className={cn(
                          'w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm',
                          isAdded
                            ? 'bg-emerald-500 text-white'
                            : isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                        )}
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body: Spec Rows */}
          <tbody className="divide-y divide-slate-200">
            {specRows.map((row, idx) => {
              const isEven = idx % 2 === 1;
              const rowBg = isEven ? 'bg-slate-50/50' : 'bg-white';
              const targetBest = bestMap[row.id];

              return (
                <tr key={row.id} className={cn('transition-colors hover:bg-slate-100/40', rowBg)}>
                  {/* Sticky Left Spec Name */}
                  <th
                    scope="row"
                    className={cn(
                      'sticky left-0 z-10 px-4 sm:px-6 py-3.5 text-xs sm:text-sm font-semibold text-slate-700 border-r border-slate-200 whitespace-nowrap shadow-[2px_0_4px_-2px_rgba(0,0,0,0.04)]',
                      rowBg
                    )}
                  >
                    {row.label}
                  </th>

                  {/* Product Values */}
                  {products.map((product) => {
                    const value = row.getValue(product);
                    const raw = row.getRaw ? row.getRaw(product) : undefined;
                    const isBest =
                      targetBest != null &&
                      typeof raw === 'number' &&
                      raw === targetBest;

                    return (
                      <td
                        key={product.id}
                        className={cn(
                          'px-4 sm:px-6 py-3.5 text-xs sm:text-sm text-center border-r last:border-r-0 border-slate-200 transition-colors',
                          isBest
                            ? 'bg-blue-50/80 border-blue-200/80 text-blue-950 font-medium'
                            : 'text-slate-800'
                        )}
                      >
                        <div className="flex items-center justify-center flex-wrap gap-1.5">
                          {value != null && value !== '' ? (
                            <>
                              <span>{value}</span>
                              {isBest && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-1.5 py-0.5 rounded-full shadow-xs">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  Best
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-400 italic font-normal select-none">
                              —
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Bottom Row: Add to Cart Buttons */}
            <tr className="bg-slate-50 border-t-2 border-slate-200">
              <th
                scope="row"
                className="sticky left-0 z-10 px-4 sm:px-6 py-5 text-xs sm:text-sm font-semibold text-slate-700 border-r border-slate-200 bg-slate-50 whitespace-nowrap"
              >
                Purchase
              </th>

              {products.map((product) => {
                const activeVariant =
                  product.variants?.find((v) => v.isAvailable) ?? product.variants?.[0];
                const isOutOfStock =
                  !activeVariant ||
                  !activeVariant.isAvailable ||
                  activeVariant.stockQuantity === 0;
                const isAdded = addedMap[product.id];

                return (
                  <td
                    key={product.id}
                    className="p-4 sm:p-5 text-center border-r last:border-r-0 border-slate-200"
                  >
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={cn(
                        'w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm',
                        isAdded
                          ? 'bg-emerald-500 text-white'
                          : isOutOfStock
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                      )}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                        </>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompareTable;
