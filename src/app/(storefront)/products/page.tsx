import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { FilterParams, ProductDTO, SpecFacetOptions } from "@/types/storefront";
import ProductCard from "@/components/catalog/ProductCard";
import FilterSidebar from "@/components/catalog/FilterSidebar";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";
import { PackageSearch } from "lucide-react";
import { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseSearchParams(sp: Record<string, string | string[] | undefined>): FilterParams {
  const arr = (k: string): string[] | undefined => {
    const v = sp[k];
    if (!v) return undefined;
    return Array.isArray(v) ? v : [v];
  };
  const num = (k: string): number | undefined => {
    const v = sp[k];
    if (!v || Array.isArray(v)) return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  };
  const str = (k: string): string | undefined => {
    const v = sp[k];
    if (!v || Array.isArray(v)) return undefined;
    return v;
  };

  return {
    brand: arr("brand"),
    series: arr("series"),
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    minRamGb: num("minRamGb"),
    minStorageGb: num("minStorageGb"),
    gpuModel: arr("gpuModel"),
    processor: arr("processor"),
    sortBy: str("sortBy") as FilterParams["sortBy"],
    page: num("page") ?? 1,
    limit: num("limit") ?? 24,
  };
}

async function fetchProducts(filters: FilterParams): Promise<ProductDTO[]> {
  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    ...(filters.brand?.length && {
      brand: { name: { in: filters.brand } },
    }),
    ...(filters.series?.length && {
      series: { in: filters.series },
    }),
    ...((filters.minPrice != null || filters.maxPrice != null) && {
      basePrice: {
        ...(filters.minPrice != null && { gte: filters.minPrice }),
        ...(filters.maxPrice != null && { lte: filters.maxPrice }),
      },
    }),
    ...(filters.minRamGb != null && {
      specs: { ramGb: { gte: filters.minRamGb } },
    }),
    ...(filters.minStorageGb != null && {
      specs: { storageGb: { gte: filters.minStorageGb } },
    }),
    ...(filters.gpuModel?.length && {
      specs: { gpuModel: { in: filters.gpuModel } },
    }),
  };

  const orderBy = (() => {
    switch (filters.sortBy) {
      case "price_asc":
        return { basePrice: "asc" as const };
      case "price_desc":
        return { basePrice: "desc" as const };
      case "release_date":
        return { releaseDate: "desc" as const };
      default:
        return { featured: "desc" as const };
    }
  })();

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 24;

  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
    include: {
      brand: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
      images: { where: { isPrimary: true }, take: 1 },
      specs: true,
      variants: {
        where: { isAvailable: true },
        orderBy: { price: "asc" },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    brand: p.brand,
    category: p.category,
    series: p.series,
    modelNumber: p.modelNumber ?? undefined,
    releaseDate: p.releaseDate.toISOString(),
    basePrice: parseFloat(p.basePrice.toString()),
    isPublished: p.isPublished,
    featured: p.featured,
    primaryImageUrl: p.images[0]?.url ?? "",
    specs: p.specs
      ? {
          processor: p.specs.processor ?? undefined,
          processorCores: p.specs.processorCores ?? undefined,
          processorThreads: p.specs.processorThreads ?? undefined,
          baseClockGhz: p.specs.baseClockGhz ?? undefined,
          boostClockGhz: p.specs.boostClockGhz ?? undefined,
          ramGb: p.specs.ramGb ?? undefined,
          ramType: p.specs.ramType ?? undefined,
          storageGb: p.specs.storageGb ?? undefined,
          storageType: p.specs.storageType ?? undefined,
          gpuModel: p.specs.gpuModel ?? undefined,
          vramGb: p.specs.vramGb ?? undefined,
          displaySizeInches: p.specs.displaySizeInches ?? undefined,
          displayResolution: p.specs.displayResolution ?? undefined,
          panelType: p.specs.panelType ?? undefined,
          refreshRateHz: p.specs.refreshRateHz ?? undefined,
          batteryCapacityWh: p.specs.batteryCapacityWh ?? undefined,
          powerSupplyWattage: p.specs.powerSupplyWattage ?? undefined,
          weightKg: p.specs.weightKg ?? undefined,
          dimensionsMm: p.specs.dimensionsMm ?? undefined,
          operatingSystem: p.specs.operatingSystem ?? undefined,
          wirelessStandard: p.specs.wirelessStandard ?? undefined,
          ioPorts: p.specs.ioPorts ?? undefined,
        }
      : undefined,
    variants: p.variants.map((v) => ({
      id: v.id,
      productId: p.id,
      sku: v.sku,
      edition: v.edition,
      color: v.color ?? undefined,
      colorHex: v.colorHex ?? undefined,
      price: parseFloat(v.price.toString()),
      compareAtPrice: v.compareAtPrice
        ? parseFloat(v.compareAtPrice.toString())
        : undefined,
      stockQuantity: v.stockQuantity,
      lowStockThreshold: v.lowStockThreshold,
      isAvailable: v.isAvailable,
    })),
  }));
}

async function buildFacets(): Promise<SpecFacetOptions> {
  const [brands, priceAgg] = await Promise.all([
    prisma.brand.findMany({
      where: { products: { some: { isPublished: true } } },
      select: { name: true, _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.product.aggregate({
      where: { isPublished: true },
      _min: { basePrice: true },
      _max: { basePrice: true },
    }),
  ]);

  return {
    brands: brands.map((b) => ({ name: b.name, count: b._count.products })),
    series: [],
    ramOptions: [8, 16, 32, 64, 128].map((v) => ({
      value: v,
      label: `${v} GB`,
      count: 0,
    })),
    storageOptions: [],
    processors: [],
    gpus: [],
    priceRange: {
      min: parseFloat((priceAgg._min.basePrice ?? 0).toString()),
      max: parseFloat((priceAgg._max.basePrice ?? 10000).toString()),
    },
  };
}

// ---------------------------------------------------------------------------
// Skeleton grid
// ---------------------------------------------------------------------------

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product grid
// ---------------------------------------------------------------------------

async function ProductGrid({ filters }: { filters: FilterParams }) {
  const products = await fetchProducts(filters);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <PackageSearch className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">
          No products found
        </h2>
        <p className="text-sm text-slate-500 max-w-xs">
          Try adjusting your filters or clearing them to browse all available
          products.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-slate-500">
          Showing <span className="font-bold text-slate-900">{products.length}</span> {products.length === 1 ? "product" : "products"}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sp = await searchParams;
  const filters = parseSearchParams(sp);

  const [facets] = await Promise.allSettled([buildFacets()]);
  const resolvedFacets = facets.status === "fulfilled" ? facets.value : undefined;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse our full catalog of premium electronics
          </p>
        </div>

        <div className="flex gap-8 items-start">
          {/* Sidebar */}
          <FilterSidebar facets={resolvedFacets} currentFilters={filters} />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={<SkeletonGrid />}>
              <ProductGrid filters={filters} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
