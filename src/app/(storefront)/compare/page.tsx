'use client';

// src/app/(storefront)/compare/page.tsx
// Interactive Side-by-Side Comparison page

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GitCompare,
  Plus,
  ArrowLeft,
  X,
  Trash2,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { useCompareStore, MAX_COMPARE_ITEMS } from '@/store/useCompareStore';
import { CompareTable } from '@/components/compare/CompareTable';
import { formatCurrency, cn } from '@/lib/utils';

export default function ComparePage() {
  const [mounted, setMounted] = useState(false);
  const items = useCompareStore((s) => s.items);
  const removeItem = useCompareStore((s) => s.removeItem);
  const clearAll = useCompareStore((s) => s.clearAll);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-slate-200 rounded-lg" />
            <div className="h-4 w-96 bg-slate-200 rounded" />
            <div className="h-96 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  const count = items.length;

  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Catalog</span>
          </Link>
        </div>

        {/* ── Case 0: Empty State (0 items) ── */}
        {count === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-16 text-center max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <GitCompare className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              No products to compare
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
              You haven&apos;t added any items to compare yet. Browse our premium laptops,
              workstations, and GPUs to evaluate their specifications side by side.
            </p>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-lg"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Explore Products</span>
            </Link>
          </div>
        )}

        {/* ── Case 1: Single item State (Need at least 1 more) ── */}
        {count === 1 && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Compare Products
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    1 of {MAX_COMPARE_ITEMS} selected
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  Add at least one more product to compare side by side.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </button>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add More Products</span>
                </Link>
              </div>
            </div>

            {/* Incomplete Grid Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Product Card 1 */}
              {items.map((product) => {
                const activeVariant =
                  product.variants?.find((v) => v.isAvailable) ?? product.variants?.[0];
                const price = activeVariant?.price ?? product.basePrice;

                return (
                  <div
                    key={product.id}
                    className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between"
                  >
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                      <div className="w-28 h-28 bg-slate-50 rounded-xl flex items-center justify-center p-2 mb-4">
                        <Image
                          src={
                            product.primaryImageUrl ||
                            'https://via.placeholder.com/120?text=Apex'
                          }
                          alt={product.name}
                          width={110}
                          height={110}
                          className="object-contain max-h-24 w-auto"
                        />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        {product.brand?.name}
                      </span>
                      <h3 className="font-semibold text-slate-900 text-sm mt-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-base font-bold text-slate-900 mt-2">
                        {formatCurrency(price)}
                      </p>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <span>View details</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })}

              {/* Placeholder Slot */}
              <Link
                href="/products"
                className="group border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all min-h-[260px]"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition-colors mb-3">
                  <Plus className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                  Add second device
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[180px]">
                  Select another product to compare hardware specifications
                </p>
              </Link>
            </div>
          </div>
        )}

        {/* ── Case 2: Multi-item State (2 to 4 items) ── */}
        {count >= 2 && (
          <div className="space-y-8">
            {/* Header with Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Compare Products
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    {count} of {MAX_COMPARE_ITEMS} items
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  Side-by-side hardware specification matrix with best-in-class highlights
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All</span>
                </button>

                {count < MAX_COMPARE_ITEMS && (
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add More Products</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Product Cards Row Above Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map((product) => {
                const activeVariant =
                  product.variants?.find((v) => v.isAvailable) ?? product.variants?.[0];
                const price = activeVariant?.price ?? product.basePrice;

                return (
                  <div
                    key={product.id}
                    className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between"
                  >
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center p-1.5 shrink-0 border border-slate-100">
                        <Image
                          src={
                            product.primaryImageUrl ||
                            'https://via.placeholder.com/64?text=Apex'
                          }
                          alt={product.name}
                          width={60}
                          height={60}
                          className="object-contain max-h-14 w-auto"
                        />
                      </div>

                      <div className="min-w-0 flex-1 pr-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                          {product.brand?.name}
                        </span>
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-semibold text-slate-900 text-xs hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                          {formatCurrency(price)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="mt-2.5 text-center text-[11px] font-medium text-slate-500 hover:text-red-600 transition-colors py-1 border-t border-slate-100"
                    >
                      Remove from Compare
                    </button>
                  </div>
                );
              })}

              {/* If fewer than 4 items, show slot for adding more */}
              {count < MAX_COMPARE_ITEMS && (
                <Link
                  href="/products"
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all group min-h-[96px]"
                >
                  <Plus className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors mb-1" />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600">
                    Add Product
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({MAX_COMPARE_ITEMS - count} slot remaining)
                  </span>
                </Link>
              )}
            </div>

            {/* Full-width sticky-header Comparison Matrix Table */}
            <CompareTable products={items} />
          </div>
        )}
      </div>
    </main>
  );
}
