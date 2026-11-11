// src/app/(storefront)/page.tsx
// ApexTech Storefront Homepage — server component

import Link from "next/link";
import {
  Laptop,
  Cpu,
  Layers,
  Headphones,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import ProductCard from "@/components/catalog/ProductCard";
import type { ProductDTO } from "@/types/storefront";

/* ── Realistic Featured Demo Products ─────────────────────── */
const FEATURED_PRODUCTS: ProductDTO[] = [
  {
    id: "prod-apple-mbp-16-m3max",
    name: "MacBook Pro 16\" (M3 Max, 64GB, 2TB)",
    slug: "apple-macbook-pro-16-m3-max",
    description:
      "The pinnacle of mobile workstation performance. Equipped with the Apple M3 Max 16-core CPU, 40-core GPU, and Liquid Retina XDR display.",
    brand: {
      id: "brand-apple",
      name: "Apple",
      slug: "apple",
    },
    category: {
      id: "cat-laptops",
      name: "Laptops",
      slug: "laptops",
    },
    series: "MacBook Pro",
    modelNumber: "MUW63LL/A",
    releaseDate: "2023-11-07",
    basePrice: 3499.0,
    isPublished: true,
    featured: true,
    primaryImageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    specs: {
      processor: "Apple M3 Max (16-core)",
      ramGb: 64,
      storageGb: 2048,
      gpuModel: "40-core GPU",
      displaySizeInches: 16.2,
      displayResolution: "3456 x 2234",
      refreshRateHz: 120,
    },
    variants: [
      {
        id: "var-apple-mbp-16-sb",
        productId: "prod-apple-mbp-16-m3max",
        sku: "APL-MBP16-M3M-64-2TB-SB",
        edition: "Pro Workstation",
        color: "Space Black",
        colorHex: "#1E1E24",
        price: 3499.0,
        compareAtPrice: 3799.0,
        stockQuantity: 12,
        lowStockThreshold: 3,
        isAvailable: true,
      },
    ],
  },
  {
    id: "prod-asus-rog-zephyrus-g16",
    name: "ASUS ROG Zephyrus G16 OLED (2024)",
    slug: "asus-rog-zephyrus-g16-oled",
    description:
      "Ultra-slim precision gaming laptop featuring a 2.5K 240Hz OLED ROG Nebula display, Intel Core Ultra 9, and NVIDIA GeForce RTX 4080.",
    brand: {
      id: "brand-asus-rog",
      name: "ASUS ROG",
      slug: "asus-rog",
    },
    category: {
      id: "cat-laptops",
      name: "Laptops",
      slug: "laptops",
    },
    series: "ROG Zephyrus",
    modelNumber: "GU605MZ-XS96",
    releaseDate: "2024-02-15",
    basePrice: 2699.99,
    isPublished: true,
    featured: true,
    primaryImageUrl:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
    specs: {
      processor: "Intel Core Ultra 9 185H",
      ramGb: 32,
      storageGb: 1024,
      gpuModel: "NVIDIA GeForce RTX 4080 (12GB GDDR6)",
      displaySizeInches: 16.0,
      displayResolution: "2560 x 1600",
      refreshRateHz: 240,
    },
    variants: [
      {
        id: "var-rog-g16-eg",
        productId: "prod-asus-rog-zephyrus-g16",
        sku: "ROG-G16-U9-4080-32-1TB",
        edition: "Founder's Edition",
        color: "Eclipse Gray",
        colorHex: "#2E3033",
        price: 2699.99,
        compareAtPrice: 2899.99,
        stockQuantity: 7,
        lowStockThreshold: 2,
        isAvailable: true,
      },
    ],
  },
  {
    id: "prod-nvidia-rtx-4090-fe",
    name: "NVIDIA GeForce RTX 4090 Founders Edition",
    slug: "nvidia-geforce-rtx-4090-founders-edition",
    description:
      "The ultimate GeForce GPU delivering massive generational leaps in rendering performance, neural ray tracing, and AI acceleration with 24GB GDDR6X.",
    brand: {
      id: "brand-nvidia",
      name: "NVIDIA",
      slug: "nvidia",
    },
    category: {
      id: "cat-gpus",
      name: "GPUs",
      slug: "gpus",
    },
    series: "RTX 40 Series",
    modelNumber: "900-1G136-2530-000",
    releaseDate: "2022-10-12",
    basePrice: 1599.0,
    isPublished: true,
    featured: true,
    primaryImageUrl:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
    specs: {
      gpuModel: "AD102 (16384 CUDA cores)",
      vramGb: 24,
      powerSupplyWattage: 850,
      boostClockGhz: 2.52,
    },
    variants: [
      {
        id: "var-rtx-4090-fe",
        productId: "prod-nvidia-rtx-4090-fe",
        sku: "NVD-RTX4090-24GB-FE",
        edition: "Founder's Edition",
        color: "Titanium Matte",
        colorHex: "#3A3D40",
        price: 1599.0,
        compareAtPrice: 1699.0,
        stockQuantity: 4,
        lowStockThreshold: 2,
        isAvailable: true,
      },
    ],
  },
];

/* ── Category Quick Links ─────────────────────────────────── */
const CATEGORIES = [
  {
    title: "Laptops",
    description: "MacBook Pro, ROG Zephyrus & mobile powerhouses",
    href: "/products?category=laptops",
    icon: Laptop,
    badge: "Most Popular",
  },
  {
    title: "Workstations",
    description: "Multi-core server architectures & studio rigs",
    href: "/products?category=workstations",
    icon: Cpu,
    badge: "Enterprise",
  },
  {
    title: "GPUs",
    description: "NVIDIA GeForce RTX 40-Series & Ada Lovelace",
    href: "/products?category=gpus",
    icon: Layers,
    badge: "High Demand",
  },
  {
    title: "Accessories",
    description: "High-spec docks, mechanical gear & displays",
    href: "/products?category=accessories",
    icon: Headphones,
    badge: "Pro Grade",
  },
];

/* ── Value Propositions ───────────────────────────────────── */
const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: "Certified Authentic",
    description: "Factory-direct authorized dealer with full manufacturer warranty.",
  },
  {
    icon: Truck,
    title: "Expedited Express",
    description: "Insured priority delivery with real-time hardware telemetry.",
  },
  {
    icon: RotateCcw,
    title: "30-Day Hassle-Free",
    description: "Transparent zero-restocking fee return window for peace of mind.",
  },
  {
    icon: Sparkles,
    title: "Apex Warranty Options",
    description: "Optional 2-year and 3-year comprehensive hardware protection.",
  },
];

/* ── Homepage Component ───────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── 1. Hero Section ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32 lg:py-40">
        {/* Subtle radial backdrop gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.35),rgba(255,255,255,0))]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-8 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Next-Generation Silicon &amp; Computing
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Engineered for Those Who <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Demand More
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            ApexTech curates enterprise-grade laptops, extreme workstations, and
            top-tier GPUs. Verified hardware, zero compromises, engineered for
            architects, creators, and power users.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-95"
            >
              Explore Products
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-8 py-3.5 text-base font-medium text-slate-200 backdrop-blur-sm transition-all duration-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              Compare Specs
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Category Quick Links ─────────────────────────── */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-1">
                Browse Architecture
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Curated Hardware Categories
              </h2>
            </div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all hardware
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-500/50 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {cat.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-blue-600">
                    <span>Shop category</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. Featured Products ────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-1">
                Precision Tier
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Featured Flagships
              </h2>
              <p className="mt-2 text-slate-500 max-w-xl text-sm sm:text-base">
                Hand-selected systems configured for maximum compute density,
                low-latency workflow execution, and thermal endurance.
              </p>
            </div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Browse Catalog
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant={product.variants[0]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Value Propositions / Trust Signals ───────────── */}
      <section className="py-16 bg-slate-900 text-white border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUE_PROPS.map((prop) => {
              const Icon = prop.icon;
              return (
                <div key={prop.title} className="flex flex-col items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">
                    {prop.title}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {prop.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
