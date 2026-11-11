import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCompatibilityRecommendations } from "@/lib/compatibility";
import { ProductDTO, ProductVariantDTO, TechnicalSpecDTO, CompatibilityRecommendation } from "@/types/storefront";
import { toNum } from "@/lib/utils";
import PDPClient from "./PDPClient";

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchProductBySlug(slug: string): Promise<ProductDTO | null> {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { isPrimary: "desc" } },
      specs: true,
      variants: {
        orderBy: { price: "asc" },
      },
    },
  });

  if (!p) return null;

  const specs: TechnicalSpecDTO | undefined = p.specs
    ? {
        processor: p.specs.processor ?? undefined,
        processorCores: p.specs.processorCores ?? undefined,
        processorThreads: p.specs.processorThreads ?? undefined,
        baseClockGhz: toNum(p.specs.baseClockGhz),
        boostClockGhz: toNum(p.specs.boostClockGhz),
        ramGb: p.specs.ramGb ?? undefined,
        ramType: p.specs.ramType ?? undefined,
        storageGb: p.specs.storageGb ?? undefined,
        storageType: p.specs.storageType ?? undefined,
        gpuModel: p.specs.gpuModel ?? undefined,
        vramGb: p.specs.vramGb ?? undefined,
        displaySizeInches: toNum(p.specs.displaySizeInches),
        displayResolution: p.specs.displayResolution ?? undefined,
        panelType: p.specs.panelType ?? undefined,
        refreshRateHz: p.specs.refreshRateHz ?? undefined,
        batteryCapacityWh: toNum(p.specs.batteryCapacityWh),
        powerSupplyWattage: p.specs.powerSupplyWattage ?? undefined,
        weightKg: toNum(p.specs.weightKg),
        dimensionsMm: p.specs.dimensionsMm ?? undefined,
        operatingSystem: p.specs.operatingSystem ?? undefined,
        wirelessStandard: p.specs.wirelessStandard ?? undefined,
        ioPorts: p.specs.ioPorts ?? undefined,
      }
    : undefined;

  const variants: ProductVariantDTO[] = p.variants.map((v) => ({
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
  }));

  return {
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
    primaryImageUrl: p.images.find((img) => img.isPrimary)?.url ?? p.images[0]?.url ?? "",
    specs,
    variants,
    // Attach all image URLs for gallery (not in ProductDTO, passed separately)
    // @ts-expect-error extended field for PDP only
    allImages: p.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary, altText: img.altText })),
  };
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Product Not Found | ApexTech" };

  return {
    title: `${product.name} | ${product.brand.name} | ApexTech`,
    description: product.description,
    openGraph: {
      title: `${product.name} | ${product.brand.name}`,
      description: product.description,
      images: product.primaryImageUrl ? [{ url: product.primaryImageUrl }] : [],
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PDPProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PDPProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product || !product.isPublished) notFound();

  let compatibilities: CompatibilityRecommendation[] = [];
  try {
    compatibilities = await getCompatibilityRecommendations(product.id);
  } catch {
    // Gracefully handle if DB not seeded yet
  }

  const allImages: { url: string; isPrimary: boolean; altText?: string }[] =
    ((product as unknown as Record<string, unknown>).allImages as { url: string; isPrimary: boolean; altText?: string }[]) ?? [
      { url: product.primaryImageUrl, isPrimary: true },
    ];

  return (
    <PDPClient
      product={product}
      allImages={allImages}
      compatibilities={compatibilities}
    />
  );
}
