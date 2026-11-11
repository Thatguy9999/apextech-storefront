// src/app/api/products/filter/route.ts
// GET handler for filtered, paginated catalog retrieval with dynamic facets

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { ProductDTO, SpecFacetOptions } from '@/types/storefront';

function getArrayParam(searchParams: URLSearchParams, key: string): string[] {
  const all = searchParams.getAll(key);
  return all
    .flatMap((val) => val.split(','))
    .map((s) => s.trim())
    .filter(Boolean);
}

function getNumberParam(searchParams: URLSearchParams, key: string): number | undefined {
  const val = searchParams.get(key);
  if (!val) return undefined;
  const parsed = Number(val);
  return isNaN(parsed) ? undefined : parsed;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filter criteria
    const brands = getArrayParam(searchParams, 'brand');
    const series = getArrayParam(searchParams, 'series');
    const minPrice = getNumberParam(searchParams, 'minPrice');
    const maxPrice = getNumberParam(searchParams, 'maxPrice');
    const minRamGb = getNumberParam(searchParams, 'minRamGb');
    const minStorageGb = getNumberParam(searchParams, 'minStorageGb');
    const gpuModels = getArrayParam(searchParams, 'gpuModel');
    const minRefreshRateHz = getNumberParam(searchParams, 'minRefreshRateHz');
    const processors = getArrayParam(searchParams, 'processor');

    const sortBy = searchParams.get('sortBy') || 'featured';
    const page = Math.max(1, getNumberParam(searchParams, 'page') || 1);
    const limit = Math.min(100, Math.max(1, getNumberParam(searchParams, 'limit') || 24));

    // Build dynamic Prisma where clause
    const where: Prisma.ProductWhereInput = {
      isPublished: true,
      ...(brands.length > 0 && {
        brand: { name: { in: brands } },
      }),
      ...(series.length > 0 && {
        series: { in: series },
      }),
      ...((minPrice != null || maxPrice != null) && {
        basePrice: {
          ...(minPrice != null && { gte: minPrice }),
          ...(maxPrice != null && { lte: maxPrice }),
        },
      }),
      ...((minRamGb != null ||
        minStorageGb != null ||
        gpuModels.length > 0 ||
        minRefreshRateHz != null ||
        processors.length > 0) && {
        specs: {
          ...(minRamGb != null && { ramGb: { gte: minRamGb } }),
          ...(minStorageGb != null && { storageGb: { gte: minStorageGb } }),
          ...(gpuModels.length > 0 && { gpuModel: { in: gpuModels } }),
          ...(minRefreshRateHz != null && { refreshRateHz: { gte: minRefreshRateHz } }),
          ...(processors.length > 0 && { processor: { in: processors } }),
        },
      }),
    };

    // Determine sorting criteria
    const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
      switch (sortBy) {
        case 'price_asc':
          return { basePrice: 'asc' };
        case 'price_desc':
          return { basePrice: 'desc' };
        case 'release_date':
          return { releaseDate: 'desc' };
        case 'featured':
        default:
          return { featured: 'desc' };
      }
    })();

    // Run products query, count, and facet aggregations in parallel
    const [total, rawProducts, brandsWithCount, seriesAgg, priceAgg, ramAgg, storageAgg, procAgg, gpuAgg] =
      await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            brand: { select: { id: true, name: true, slug: true } },
            category: { select: { id: true, name: true, slug: true } },
            specs: true,
            variants: {
              where: { isAvailable: true },
              orderBy: { price: 'asc' },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        }),
        // Facets: Brands
        prisma.brand.findMany({
          where: { products: { some: { isPublished: true } } },
          select: {
            name: true,
            _count: { select: { products: { where: { isPublished: true } } } },
          },
          orderBy: { name: 'asc' },
        }),
        // Facets: Series
        prisma.product.groupBy({
          by: ['series'],
          where: { isPublished: true },
          _count: { _all: true },
          orderBy: { series: 'asc' },
        }),
        // Facets: Price Range
        prisma.product.aggregate({
          where: { isPublished: true },
          _min: { basePrice: true },
          _max: { basePrice: true },
        }),
        // Facets: RAM
        prisma.technicalSpec.groupBy({
          by: ['ramGb'],
          where: { product: { isPublished: true }, ramGb: { not: null } },
          _count: { _all: true },
          orderBy: { ramGb: 'asc' },
        }),
        // Facets: Storage
        prisma.technicalSpec.groupBy({
          by: ['storageGb'],
          where: { product: { isPublished: true }, storageGb: { not: null } },
          _count: { _all: true },
          orderBy: { storageGb: 'asc' },
        }),
        // Facets: Processors
        prisma.technicalSpec.groupBy({
          by: ['processor'],
          where: { product: { isPublished: true }, processor: { not: null } },
          _count: { _all: true },
          orderBy: { processor: 'asc' },
        }),
        // Facets: GPUs
        prisma.technicalSpec.groupBy({
          by: ['gpuModel'],
          where: { product: { isPublished: true }, gpuModel: { not: null } },
          _count: { _all: true },
          orderBy: { gpuModel: 'asc' },
        }),
      ]);

    // Format products into serialized ProductDTO
    const serializedProducts: ProductDTO[] = rawProducts.map((p) => {
      const primaryImage =
        p.images.find((img) => img.isPrimary)?.url ||
        p.images[0]?.url ||
        '';

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        brand: {
          id: p.brand.id,
          name: p.brand.name,
          slug: p.brand.slug,
        },
        category: {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
        },
        series: p.series,
        modelNumber: p.modelNumber ?? undefined,
        releaseDate: p.releaseDate.toISOString(),
        basePrice: Number(p.basePrice),
        isPublished: p.isPublished,
        featured: p.featured,
        primaryImageUrl: primaryImage,
        specs: p.specs
          ? {
              processor: p.specs.processor ?? undefined,
              processorCores: p.specs.processorCores ?? undefined,
              processorThreads: p.specs.processorThreads ?? undefined,
              baseClockGhz: p.specs.baseClockGhz ? Number(p.specs.baseClockGhz) : undefined,
              boostClockGhz: p.specs.boostClockGhz ? Number(p.specs.boostClockGhz) : undefined,
              ramGb: p.specs.ramGb ?? undefined,
              ramType: p.specs.ramType ?? undefined,
              storageGb: p.specs.storageGb ?? undefined,
              storageType: p.specs.storageType ?? undefined,
              gpuModel: p.specs.gpuModel ?? undefined,
              vramGb: p.specs.vramGb ?? undefined,
              displaySizeInches: p.specs.displaySizeInches ? Number(p.specs.displaySizeInches) : undefined,
              displayResolution: p.specs.displayResolution ?? undefined,
              panelType: p.specs.panelType ?? undefined,
              refreshRateHz: p.specs.refreshRateHz ?? undefined,
              batteryCapacityWh: p.specs.batteryCapacityWh ? Number(p.specs.batteryCapacityWh) : undefined,
              powerSupplyWattage: p.specs.powerSupplyWattage ?? undefined,
              weightKg: p.specs.weightKg ? Number(p.specs.weightKg) : undefined,
              dimensionsMm: p.specs.dimensionsMm ?? undefined,
              operatingSystem: p.specs.operatingSystem ?? undefined,
              wirelessStandard: p.specs.wirelessStandard ?? undefined,
              ioPorts: p.specs.ioPorts ?? undefined,
              rawJsonSpecs: (p.specs.rawJsonSpecs as Record<string, string | number | boolean>) ?? undefined,
            }
          : undefined,
        variants: p.variants.map((v) => ({
          id: v.id,
          productId: p.id,
          sku: v.sku,
          edition: v.edition,
          color: v.color ?? undefined,
          colorHex: v.colorHex ?? undefined,
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
          stockQuantity: v.stockQuantity,
          lowStockThreshold: v.lowStockThreshold,
          isAvailable: v.isAvailable,
        })),
      };
    });

    // Assemble facet options
    const facets: SpecFacetOptions = {
      brands: brandsWithCount.map((b) => ({
        name: b.name,
        count: b._count.products,
      })),
      series: seriesAgg.map((s) => ({
        name: s.series,
        count: s._count._all,
      })),
      ramOptions: ramAgg
        .filter((r): r is typeof r & { ramGb: number } => r.ramGb !== null)
        .map((r) => ({
          value: r.ramGb,
          label: `${r.ramGb} GB`,
          count: r._count._all,
        })),
      storageOptions: storageAgg
        .filter((s): s is typeof s & { storageGb: number } => s.storageGb !== null)
        .map((s) => ({
          value: s.storageGb,
          label: s.storageGb >= 1000 ? `${s.storageGb / 1000} TB` : `${s.storageGb} GB`,
          count: s._count._all,
        })),
      processors: procAgg
        .filter((pr): pr is typeof pr & { processor: string } => Boolean(pr.processor))
        .map((pr) => ({
          name: pr.processor,
          count: pr._count._all,
        })),
      gpus: gpuAgg
        .filter((g): g is typeof g & { gpuModel: string } => Boolean(g.gpuModel))
        .map((g) => ({
          name: g.gpuModel,
          count: g._count._all,
        })),
      priceRange: {
        min: priceAgg._min.basePrice ? Number(priceAgg._min.basePrice) : 0,
        max: priceAgg._max.basePrice ? Number(priceAgg._max.basePrice) : 10000,
      },
    };

    return NextResponse.json(
      {
        products: serializedProducts,
        total,
        facets,
        page,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/products/filter:', error);
    return NextResponse.json(
      { error: 'Internal server error while filtering products' },
      { status: 500 }
    );
  }
}
