'use client';

// src/components/compare/CompareDock.tsx
// Fixed bottom docking tray for comparing up to 4 products

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, GitCompare, ArrowRight, Trash2, Plus } from 'lucide-react';
import { useCompareStore, MAX_COMPARE_ITEMS } from '@/store/useCompareStore';
import { cn } from '@/lib/utils';

export function CompareDock() {
  const [mounted, setMounted] = useState(false);
  const items = useCompareStore((s) => s.items);
  const isDockVisible = useCompareStore((s) => s.isDockVisible);
  const removeItem = useCompareStore((s) => s.removeItem);
  const clearAll = useCompareStore((s) => s.clearAll);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const count = items.length;
  const isVisible = count > 0 && isDockVisible;

  // Fill up to 4 slots
  const emptySlotsCount = Math.max(0, MAX_COMPARE_ITEMS - count);

  return (
    <aside
      aria-label="Product comparison dock"
      aria-live="polite"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-6 transition-all duration-300 ease-out transform',
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none select-none'
      )}
    >
      <div className="max-w-3xl mx-auto bg-slate-900 text-white px-4 sm:px-6 py-3 rounded-t-2xl shadow-2xl border-t border-x border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Header & Product Thumbnails */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-slate-800">
              <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
                <GitCompare className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-200">Compare</p>
                <p className="text-[11px] text-slate-400">{count} of {MAX_COMPARE_ITEMS}</p>
              </div>
            </div>

            {/* Product Slots */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              {items.map((product) => {
                const imgUrl =
                  product.primaryImageUrl ||
                  'https://via.placeholder.com/100?text=Apex';

                return (
                  <div
                    key={product.id}
                    className="relative group shrink-0 flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-1.5 pr-2.5 transition-all"
                  >
                    <div className="relative h-9 w-9 rounded-lg bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                      <Image
                        src={imgUrl}
                        alt={product.name}
                        width={36}
                        height={36}
                        className="object-contain w-full h-full"
                      />
                    </div>

                    <div className="max-w-[90px] sm:max-w-[110px] min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate leading-tight">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {product.brand?.name}
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="ml-1 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Remove ${product.name} from comparison`}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}

              {/* Empty placeholder slots */}
              {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="hidden md:flex items-center justify-center h-12 w-28 border border-dashed border-slate-700/70 rounded-xl text-slate-500 text-[11px] gap-1 px-2 shrink-0 select-none"
                  aria-hidden="true"
                >
                  <Plus className="h-3 w-3 text-slate-600" />
                  <span>Slot {count + idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
            <button
              type="button"
              onClick={clearAll}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-slate-600"
              aria-label="Clear all compared products"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Clear All</span>
            </button>

            <Link
              href="/compare"
              className={cn(
                'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md',
                'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400'
              )}
            >
              <span>Compare Now</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default CompareDock;
