// src/types/storefront.ts
// Strict static TypeScript definitions for ApexTech Headless Storefront

export type ProductEdition = 'Standard' | "Founder's Edition" | "Collector's Edition" | 'Pro' | 'Max';

export type CompatibilityCategory = 'ACCESSORY' | 'CHARGER' | 'WARRANTY' | 'SPARE_PART' | 'SOFTWARE_BUNDLE';

export interface TechnicalSpecDTO {
  processor?: string;
  processorCores?: number;
  processorThreads?: number;
  baseClockGhz?: number;
  boostClockGhz?: number;
  ramGb?: number;
  ramType?: string;
  storageGb?: number;
  storageType?: string;
  gpuModel?: string;
  vramGb?: number;
  displaySizeInches?: number;
  displayResolution?: string;
  panelType?: string;
  refreshRateHz?: number;
  batteryCapacityWh?: number;
  powerSupplyWattage?: number;
  weightKg?: number;
  dimensionsMm?: string;
  operatingSystem?: string;
  wirelessStandard?: string;
  ioPorts?: string;
  rawJsonSpecs?: Record<string, string | number | boolean>;
}

export interface ProductVariantDTO {
  id: string;
  productId: string;
  sku: string;
  edition: string;
  color?: string;
  colorHex?: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isAvailable: boolean;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  series: string;
  modelNumber?: string;
  releaseDate: string;
  basePrice: number;
  isPublished: boolean;
  featured: boolean;
  primaryImageUrl: string;
  specs?: TechnicalSpecDTO;
  variants: ProductVariantDTO[];
}

export interface CartLineItem {
  id: string; // Cart item unique key (variantId + optional warrantyId)
  productVariantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  brandName: string;
  series: string;
  edition: string;
  color?: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  stockAvailable: number;
  attachedWarranty?: {
    warrantyId: string;
    name: string;
    price: number;
    durationYears: number;
  };
}

export interface FilterParams {
  brand?: string[];
  series?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRamGb?: number;
  minStorageGb?: number;
  gpuModel?: string[];
  minRefreshRateHz?: number;
  processor?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'release_date' | 'featured';
  page?: number;
  limit?: number;
}

export interface SpecFacetOptions {
  brands: { name: string; count: number }[];
  series: { name: string; count: number }[];
  ramOptions: { value: number; label: string; count: number }[];
  storageOptions: { value: number; label: string; count: number }[];
  processors: { name: string; count: number }[];
  gpus: { name: string; count: number }[];
  priceRange: { min: number; max: number };
}

export interface ProductComparisonItem {
  product: ProductDTO;
  selectedVariant: ProductVariantDTO;
}

export interface CompatibilityRecommendation {
  compatibleProduct: ProductDTO;
  compatibilityType: CompatibilityCategory;
  isRecommended: boolean;
  discountPercentage?: number;
  notes?: string;
}

