"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, SlidersHorizontal } from "lucide-react";
import { FilterParams, SpecFacetOptions } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  facets?: SpecFacetOptions;
  currentFilters: FilterParams;
}

const RAM_OPTIONS = [8, 16, 32, 64, 128];
const STORAGE_OPTIONS = [
  { label: "256 GB", value: 256 },
  { label: "512 GB", value: 512 },
  { label: "1 TB", value: 1000 },
  { label: "2 TB", value: 2000 },
  { label: "4 TB", value: 4000 },
];
const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest First", value: "release_date" },
];

const DEFAULT_BRANDS = [
  "Apple",
  "ASUS ROG",
  "NVIDIA",
  "Razer",
  "Microsoft",
  "Dell",
];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-slate-900 mb-2.5">{children}</h3>
  );
}

function Divider() {
  return <hr className="border-slate-100 my-4" />;
}

export default function FilterSidebar({
  facets,
  currentFilters,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const hasFilters =
    (currentFilters.brand?.length ?? 0) > 0 ||
    currentFilters.minPrice != null ||
    currentFilters.maxPrice != null ||
    currentFilters.minRamGb != null ||
    currentFilters.minStorageGb != null ||
    currentFilters.sortBy != null;

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      // Reset to page 1 on filter change
      params.delete("page");
      startTransition(() => router.push(`/products?${params.toString()}`));
    },
    [router, searchParams]
  );

  const toggleArrayParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const existing = params.getAll(key);
      if (existing.includes(value)) {
        params.delete(key);
        existing.filter((v) => v !== value).forEach((v) => params.append(key, v));
      } else {
        params.append(key, value);
      }
      params.delete("page");
      startTransition(() => router.push(`/products?${params.toString()}`));
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    startTransition(() => router.push("/products"));
  }, [router]);

  const brands = facets?.brands?.map((b) => b.name) ?? DEFAULT_BRANDS;

  return (
    <aside
      className={cn(
        "bg-white border-r border-slate-100 p-4 w-64 shrink-0 self-start sticky top-20",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <SlidersHorizontal className="h-4 w-4 text-blue-600" />
          Filters
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <X className="h-3 w-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Sort By */}
      <div>
        <SectionHeader>Sort By</SectionHeader>
        <select
          value={currentFilters.sortBy ?? "featured"}
          onChange={(e) => updateParam("sortBy", e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <Divider />

      {/* Price Range */}
      <div>
        <SectionHeader>Price Range</SectionHeader>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              $
            </span>
            <input
              type="number"
              min={0}
              placeholder="Min"
              defaultValue={currentFilters.minPrice ?? ""}
              onBlur={(e) =>
                updateParam(
                  "minPrice",
                  e.target.value ? e.target.value : null
                )
              }
              className="w-full rounded-lg border border-slate-200 pl-6 pr-2 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <span className="text-slate-400 text-xs">–</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              $
            </span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              defaultValue={currentFilters.maxPrice ?? ""}
              onBlur={(e) =>
                updateParam(
                  "maxPrice",
                  e.target.value ? e.target.value : null
                )
              }
              className="w-full rounded-lg border border-slate-200 pl-6 pr-2 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        {facets?.priceRange && (
          <p className="mt-1 text-xs text-slate-400">
            Range: ${facets.priceRange.min.toLocaleString()} –{" "}
            ${facets.priceRange.max.toLocaleString()}
          </p>
        )}
      </div>

      <Divider />

      {/* Brand */}
      <div>
        <SectionHeader>Brand</SectionHeader>
        <ul className="space-y-2">
          {brands.map((brand) => {
            const isChecked = currentFilters.brand?.includes(brand) ?? false;
            return (
              <li key={brand}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 hover:text-slate-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayParam("brand", brand)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  {brand}
                  {facets?.brands && (
                    <span className="ml-auto text-xs text-slate-400">
                      ({facets.brands.find((b) => b.name === brand)?.count ?? 0})
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <Divider />

      {/* RAM */}
      <div>
        <SectionHeader>RAM</SectionHeader>
        <ul className="space-y-2">
          {RAM_OPTIONS.map((ram) => {
            const isChecked = currentFilters.minRamGb === ram;
            return (
              <li key={ram}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 hover:text-slate-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      updateParam("minRamGb", isChecked ? null : String(ram))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  {ram} GB
                  {facets?.ramOptions && (
                    <span className="ml-auto text-xs text-slate-400">
                      (
                      {facets.ramOptions.find((r) => r.value === ram)?.count ??
                        0}
                      )
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <Divider />

      {/* Storage */}
      <div>
        <SectionHeader>Storage</SectionHeader>
        <ul className="space-y-2">
          {STORAGE_OPTIONS.map(({ label, value }) => {
            const isChecked = currentFilters.minStorageGb === value;
            return (
              <li key={value}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 hover:text-slate-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      updateParam(
                        "minStorageGb",
                        isChecked ? null : String(value)
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  {label}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
