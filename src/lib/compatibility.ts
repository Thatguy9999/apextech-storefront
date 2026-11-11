// src/lib/compatibility.ts
// Hardware Compatibility Engine: Derives compatible accessories/warranties for cart items

import { prisma } from '@/lib/prisma';
import { CompatibilityRecommendation } from '@/types/storefront';

/**
 * Returns verified hardware-compatible products for a given primary product ID.
 * Used in CartDrawer and Product Detail Page to surface relevant cross-sells
 * and prevent incompatible purchase combinations.
 */
export async function getCompatibilityRecommendations(
  primaryProductId: string,
  filters?: { type?: ('ACCESSORY' | 'CHARGER' | 'WARRANTY' | 'SPARE_PART' | 'SOFTWARE_BUNDLE')[] }
): Promise<CompatibilityRecommendation[]> {
  const compatibilities = await prisma.productCompatibility.findMany({
    where: {
      primaryProductId,
      ...(filters?.type && { compatibilityType: { in: filters.type } }),
    },
    include: {
      compatibleProduct: {
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
          specs: true,
          variants: {
            where: { isAvailable: true },
            orderBy: { price: 'asc' },
            take: 1,
          },
        },
      },
    },
    orderBy: [{ isRecommended: 'desc' }, { compatibilityType: 'asc' }],
  });

  return compatibilities.map((compat) => {
    const { compatibleProduct } = compat;
    const primaryImage = compatibleProduct.images[0]?.url || '';
    const baseVariant = compatibleProduct.variants[0];

    return {
      compatibleProduct: {
        id: compatibleProduct.id,
        name: compatibleProduct.name,
        slug: compatibleProduct.slug,
        description: compatibleProduct.description,
        brand: compatibleProduct.brand,
        category: compatibleProduct.category,
        series: compatibleProduct.series,
        modelNumber: compatibleProduct.modelNumber ?? undefined,
        releaseDate: compatibleProduct.releaseDate.toISOString(),
        basePrice: parseFloat(compatibleProduct.basePrice.toString()),
        isPublished: compatibleProduct.isPublished,
        featured: compatibleProduct.featured,
        primaryImageUrl: primaryImage,
        specs: compatibleProduct.specs
          ? {
              processor: compatibleProduct.specs.processor ?? undefined,
              ramGb: compatibleProduct.specs.ramGb ?? undefined,
              storageGb: compatibleProduct.specs.storageGb ?? undefined,
              gpuModel: compatibleProduct.specs.gpuModel ?? undefined,
            }
          : undefined,
        variants: baseVariant
          ? [
              {
                id: baseVariant.id,
                productId: compatibleProduct.id,
                sku: baseVariant.sku,
                edition: baseVariant.edition,
                color: baseVariant.color ?? undefined,
                colorHex: baseVariant.colorHex ?? undefined,
                price: parseFloat(baseVariant.price.toString()),
                compareAtPrice: baseVariant.compareAtPrice
                  ? parseFloat(baseVariant.compareAtPrice.toString())
                  : undefined,
                stockQuantity: baseVariant.stockQuantity,
                lowStockThreshold: baseVariant.lowStockThreshold,
                isAvailable: baseVariant.isAvailable,
              },
            ]
          : [],
      },
      compatibilityType: compat.compatibilityType as CompatibilityRecommendation['compatibilityType'],
      isRecommended: compat.isRecommended,
      discountPercentage: compat.discountPercentage
        ? parseFloat(compat.discountPercentage.toString())
        : undefined,
      notes: compat.notes ?? undefined,
    };
  });
}

/**
 * Validates whether a given accessory SKU is hardware-compatible with a host product.
 * Used during checkout to surface warnings before confirming an order.
 */
export async function checkCompatibility(
  primaryProductId: string,
  accessoryProductId: string
): Promise<{ isCompatible: boolean; notes?: string }> {
  const rule = await prisma.productCompatibility.findUnique({
    where: {
      primaryProductId_compatibleProductId: {
        primaryProductId,
        compatibleProductId: accessoryProductId,
      },
    },
  });

  return {
    isCompatible: !!rule,
    notes: rule?.notes ?? undefined,
  };
}

