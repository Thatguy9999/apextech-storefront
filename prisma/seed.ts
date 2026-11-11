// prisma/seed.ts
// Seeding script for ApexTech Headless E-Commerce Storefront
// Populates flagship hardware, technical specs, variants, and compatibility records

import { PrismaClient, CompatibilityType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting ApexTech database seed...");

  // Clean existing catalog data
  await prisma.productCompatibility.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.technicalSpec.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  // 1. Brands
  const apple = await prisma.brand.create({
    data: {
      name: "Apple",
      slug: "apple",
      description: "Pioneering premium consumer computing hardware and Apple Silicon.",
      website: "https://apple.com",
    },
  });

  const asus = await prisma.brand.create({
    data: {
      name: "ASUS ROG",
      slug: "asus-rog",
      description: "Republic of Gamers — high-performance gaming laptops and components.",
      website: "https://rog.asus.com",
    },
  });

  const nvidia = await prisma.brand.create({
    data: {
      name: "NVIDIA",
      slug: "nvidia",
      description: "World leader in graphics processing units and accelerated AI computing.",
      website: "https://nvidia.com",
    },
  });

  // 2. Categories
  const laptops = await prisma.category.create({
    data: {
      name: "Laptops & Workstations",
      slug: "laptops",
      description: "Ultra-portable and extreme performance computing notebooks.",
    },
  });

  const gpus = await prisma.category.create({
    data: {
      name: "Graphics Cards",
      slug: "gpus",
      description: "High-end desktop GPUs and accelerator cards.",
    },
  });

  const accessories = await prisma.category.create({
    data: {
      name: "Accessories & Power",
      slug: "accessories",
      description: "Precision power delivery, sleeves, and hardware add-ons.",
    },
  });

  // 3. Products
  // 3A. MacBook Pro 16"
  const mbp = await prisma.product.create({
    data: {
      name: 'MacBook Pro 16" (M3 Max)',
      slug: "apple-macbook-pro-16-m3-max",
      description: "The most advanced Mac laptop ever engineered. Powered by M3 Max with up to 16-core CPU and 40-core GPU.",
      brandId: apple.id,
      categoryId: laptops.id,
      series: "MacBook Pro",
      modelNumber: "MUW63LL/A",
      releaseDate: new Date("2024-11-01"),
      basePrice: 3499.0,
      featured: true,
      specs: {
        create: {
          processor: "Apple M3 Max (16-core CPU, 40-core GPU)",
          processorCores: 16,
          processorThreads: 16,
          ramGb: 64,
          ramType: "Unified Memory (400GB/s bandwidth)",
          storageGb: 2000,
          storageType: "PCIe 4.0 NVMe SSD",
          gpuModel: "Apple 40-Core Integrated GPU",
          vramGb: 64,
          displaySizeInches: 16.2,
          displayResolution: "3456 × 2234",
          panelType: "Liquid Retina XDR Mini-LED",
          refreshRateHz: 120,
          batteryCapacityWh: 99.6,
          powerSupplyWattage: 140,
          weightKg: 2.14,
          dimensionsMm: "355.7 × 248.1 × 16.8",
          operatingSystem: "macOS Sonoma",
          wirelessStandard: "Wi-Fi 6E (802.11ax), Bluetooth 5.3",
          ioPorts: "3× Thunderbolt 4 (USB-C), 1× HDMI 2.1, 1× SDXC, 1× MagSafe 3, 3.5mm headphone",
        },
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
            altText: "MacBook Pro 16 Space Black open view",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "MBP16-M3MAX-BLK-STD",
            edition: "Standard",
            color: "Space Black",
            colorHex: "#1C1D1F",
            price: 3499.0,
            stockQuantity: 18,
            lowStockThreshold: 5,
            isAvailable: true,
          },
          {
            sku: "MBP16-M3MAX-SLV-STD",
            edition: "Standard",
            color: "Silver",
            colorHex: "#E3E4E5",
            price: 3499.0,
            stockQuantity: 12,
            lowStockThreshold: 5,
            isAvailable: true,
          },
          {
            sku: "MBP16-M3MAX-BLK-PRO",
            edition: "Max Edition (128GB)",
            color: "Space Black",
            colorHex: "#1C1D1F",
            price: 4699.0,
            stockQuantity: 4,
            lowStockThreshold: 3,
            isAvailable: true,
          },
        ],
      },
    },
  });

  // 3B. ROG Zephyrus G16
  const zephyrus = await prisma.product.create({
    data: {
      name: "ROG Zephyrus G16 (2024 OLED)",
      slug: "asus-rog-zephyrus-g16-oled",
      description: "Precision CNC aluminum gaming powerhouse featuring a 2.5K 240Hz OLED ROG Nebula display and RTX 4090.",
      brandId: asus.id,
      categoryId: laptops.id,
      series: "ROG Zephyrus",
      modelNumber: "GU605MY-XS96",
      releaseDate: new Date("2024-03-15"),
      basePrice: 2899.0,
      featured: true,
      specs: {
        create: {
          processor: "Intel Core Ultra 9 185H",
          processorCores: 16,
          processorThreads: 22,
          baseClockGhz: 2.3,
          boostClockGhz: 5.1,
          ramGb: 32,
          ramType: "LPDDR5X-7467",
          storageGb: 2000,
          storageType: "PCIe 4.0 NVMe M.2 SSD",
          gpuModel: "NVIDIA GeForce RTX 4090 Laptop GPU (115W TGP)",
          vramGb: 16,
          displaySizeInches: 16.0,
          displayResolution: "2560 × 1600",
          panelType: "ROG Nebula OLED",
          refreshRateHz: 240,
          batteryCapacityWh: 90.0,
          powerSupplyWattage: 240,
          weightKg: 1.85,
          dimensionsMm: "354.0 × 246.0 × 14.9",
          operatingSystem: "Windows 11 Pro",
          wirelessStandard: "Wi-Fi 6E (802.11ax), Bluetooth 5.3",
          ioPorts: "1× Thunderbolt 4, 1× USB 3.2 Gen 2 Type-C, 2× USB 3.2 Gen 2 Type-A, 1× HDMI 2.1, SD card",
        },
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
            altText: "ROG Zephyrus G16 Platinum White lid view",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "ROG-G16-RTX4080-GRY",
            edition: "Standard",
            color: "Eclipse Gray",
            colorHex: "#2C2D30",
            price: 2899.0,
            stockQuantity: 24,
            lowStockThreshold: 5,
            isAvailable: true,
          },
          {
            sku: "ROG-G16-RTX4090-WHT",
            edition: "Collector's Edition",
            color: "Platinum White",
            colorHex: "#F2F4F7",
            price: 3299.0,
            stockQuantity: 3,
            lowStockThreshold: 2,
            isAvailable: true,
          },
        ],
      },
    },
  });

  // 3C. GeForce RTX 4090
  const rtx4090 = await prisma.product.create({
    data: {
      name: "GeForce RTX 4090 Founders Edition",
      slug: "nvidia-geforce-rtx-4090-founders-edition",
      description: "The ultimate GeForce GPU delivering colossal leaps in performance, efficiency, and AI-powered DLSS 3.",
      brandId: nvidia.id,
      categoryId: gpus.id,
      series: "GeForce RTX 4000",
      modelNumber: "900-1G136-2530-000",
      releaseDate: new Date("2023-10-12"),
      basePrice: 1599.0,
      featured: true,
      specs: {
        create: {
          processor: "NVIDIA AD102 (16,384 CUDA Cores)",
          processorCores: 16384,
          baseClockGhz: 2.23,
          boostClockGhz: 2.52,
          ramGb: 24,
          ramType: "GDDR6X (384-bit, 1,008 GB/s)",
          gpuModel: "NVIDIA AD102-300",
          vramGb: 24,
          powerSupplyWattage: 850,
          weightKg: 2.18,
          dimensionsMm: "304.0 × 137.0 × 61.0",
          ioPorts: "3× DisplayPort 1.4a, 1× HDMI 2.1a",
        },
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
            altText: "GeForce RTX 4090 Founders Edition front perspective",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "NV-RTX4090-FE-24G",
            edition: "Founder's Edition",
            color: "Titanium / Matte Black",
            colorHex: "#37383B",
            price: 1599.0,
            stockQuantity: 5,
            lowStockThreshold: 2,
            isAvailable: true,
          },
        ],
      },
    },
  });

  // 3D. 140W GaN USB-C Power Adapter (Accessory)
  const charger = await prisma.product.create({
    data: {
      name: "140W USB-C GaN Power Delivery Adapter",
      slug: "apple-140w-usb-c-power-adapter",
      description: "Fast, efficient charging at home, in the office, or on the go. Compatible with MagSafe 3 cable.",
      brandId: apple.id,
      categoryId: accessories.id,
      series: "MacBook Pro",
      releaseDate: new Date("2023-01-01"),
      basePrice: 99.0,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
            altText: "140W GaN Power Adapter",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "CHG-140W-GAN-MBP",
            edition: "Standard",
            color: "White",
            price: 99.0,
            stockQuantity: 50,
            isAvailable: true,
          },
        ],
      },
    },
  });

  // 4. Compatibility Cross-Sell Rules
  await prisma.productCompatibility.create({
    data: {
      primaryProductId: mbp.id,
      compatibleProductId: charger.id,
      compatibilityType: CompatibilityType.CHARGER,
      isRecommended: true,
      discountPercentage: 15.0,
      notes: "Provides fast-charge support (0 to 50% in 30 minutes) via MagSafe 3",
    },
  });

  console.log("✅ Database successfully seeded with flagship hardware catalog!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
