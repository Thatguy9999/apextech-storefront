// src/app/api/products/compare/route.ts
// GET handler for fetching side-by-side product comparison details

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductDTO } from '@/types/storefront';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam || !idsParam.trim()) {
      return NextResponse.json(
        { error: 'Missing "ids" query parameter. Provide comma-separated product IDs.' },
        { status: 400 }
      );
    }

    const ids = idsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one product ID must be provided.' },
        { status: 400 }
      );
    }

    if (ids.length > 4) {
      return NextResponse.json(
        { error: 'Cannot compare more than 4 products at once.' },
        { status: 400 }
      );
    }

    // Fetch matching products with full relations
    const rawProducts = await prisma.product.findMany({
      where: {
        id: { in: ids },
        isPublished: true,
      },
      include: {
        brand: {
          select: { id: true, name: true, slug: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        specs: true,
        variants: {
          where: { isAvailable: true },
          orderBy: { price: 'asc' },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (rawProducts.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Preserve the order of the requested IDs
    const productMap = new Map(rawProducts.map((p) => [p.id, p]));
    const orderedProducts = ids
      .map((id) => productMap.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    const serialized: ProductDTO[] = orderedProducts.map((p) => {
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

    return NextResponse.json(serialized, { status: 200 });
  } catch (error) {
    console.error('Error in /api/products/compare:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching compared products' },
      { status: 500 }
    );
  }
}
