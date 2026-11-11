/**
 * prisma/seed.ts
 *
 * Seeds the ApexTech database with realistic electronics data.
 * Run with:  npx tsx prisma/seed.ts
 *            (or)  npm run db:seed
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Starting seed…");

  // ------------------------------------------------------------------ //
  //  BRANDS                                                              //
  // ------------------------------------------------------------------ //
  const apple = await prisma.brand.upsert({
    where: { slug: "apple" },
    update: {},
    create: {
      name: "Apple",
      slug: "apple",
      logoUrl:
        "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&q=80",
      description:
        "Apple Inc. designs and markets consumer electronics, software, and services.",
      website: "https://www.apple.com",
    },
  });

  const asusRog = await prisma.brand.upsert({
    where: { slug: "asus-rog" },
    update: {},
    create: {
      name: "ASUS ROG",
      slug: "asus-rog",
      logoUrl:
        "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=200&q=80",
      description:
        "Republic of Gamers — ASUS's premium gaming hardware division.",
      website: "https://rog.asus.com",
    },
  });

  const nvidia = await prisma.brand.upsert({
    where: { slug: "nvidia" },
    update: {},
    create: {
      name: "NVIDIA",
      slug: "nvidia",
      logoUrl:
        "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=200&q=80",
      description:
        "NVIDIA Corporation designs graphics processing units and system-on-chip units.",
      website: "https://www.nvidia.com",
    },
  });

  console.log("✅  Brands seeded");

  // ------------------------------------------------------------------ //
  //  CATEGORIES                                                          //
  // ------------------------------------------------------------------ //
  const laptopsCat = await prisma.category.upsert({
    where: { slug: "laptops" },
    update: {},
    create: {
      name: "Laptops",
      slug: "laptops",
      description: "High-performance portable computers for work and play.",
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
      parentId: null,
    },
  });

  const gpusCat = await prisma.category.upsert({
    where: { slug: "gpus" },
    update: {},
    create: {
      name: "GPUs",
      slug: "gpus",
      description: "Discrete graphics cards for gaming, design, and AI.",
      imageUrl:
        "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
      parentId: null,
    },
  });

  console.log("✅  Categories seeded");

  // ------------------------------------------------------------------ //
  //  PRODUCTS                                                            //
  // ------------------------------------------------------------------ //

  // ---- 1. Apple MacBook Pro 16-inch (M3 Pro) ---- //
  const macbookPro = await prisma.product.upsert({
    where: { slug: "apple-macbook-pro-16-m3-pro" },
    update: {},
    create: {
      name: "MacBook Pro 16-inch (M3 Pro)",
      slug: "apple-macbook-pro-16-m3-pro",
      description:
        "The most powerful MacBook Pro ever, featuring the Apple M3 Pro chip for exceptional performance, up to 22 hours of battery life, and a stunning Liquid Retina XDR display.",
      shortDescription:
        "Apple M3 Pro · 16-inch Liquid Retina XDR · Up to 22-hr battery",
      basePrice: 2499.0,
      sku: "MBP-16-M3P",
      brandId: apple.id,
      categoryId: laptopsCat.id,
      isFeatured: true,
      isActive: true,
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&q=80",
      ],
      tags: ["apple", "macbook", "laptop", "m3", "pro", "featured"],
      technicalSpecs: {
        create: {
          processor: "Apple M3 Pro (12-core CPU, 18-core GPU)",
          memoryGb: 18,
          storageGb: 512,
          displayInch: 16.2,
          displayResolution: "3456 × 2234 (254 ppi)",
          displayType: "Liquid Retina XDR",
          batteryWh: 100,
          batteryLife: "Up to 22 hours",
          weight: 2.14,
          os: "macOS Sonoma",
          connectivity: "Wi-Fi 6E, Bluetooth 5.3, HDMI 2.1, SD card, 3× USB-C (Thunderbolt 4)",
          ports: "3× Thunderbolt 4, HDMI 2.1, SD card, MagSafe 3",
          webcam: "1080p FaceTime HD",
          audio: "Six-speaker sound system with force-cancelling woofers",
          color: "Space Black",
          dimensions: "35.57 × 24.81 × 1.68 cm",
        },
      },
      variants: {
        create: [
          {
            name: "18GB / 512GB — Space Black",
            sku: "MBP-16-M3P-18-512-SB",
            price: 2499.0,
            stock: 42,
            attributes: { ram: "18GB", storage: "512GB", color: "Space Black" },
            images: [
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80",
            ],
          },
          {
            name: "36GB / 1TB — Space Black",
            sku: "MBP-16-M3P-36-1TB-SB",
            price: 3099.0,
            stock: 20,
            attributes: { ram: "36GB", storage: "1TB", color: "Space Black" },
            images: [
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80",
            ],
          },
          {
            name: "36GB / 1TB — Silver",
            sku: "MBP-16-M3P-36-1TB-SL",
            price: 3099.0,
            stock: 15,
            attributes: { ram: "36GB", storage: "1TB", color: "Silver" },
            images: [
              "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&q=80",
            ],
          },
        ],
      },
    },
  });

  // ---- 2. ASUS ROG Zephyrus G16 ---- //
  const rogZephyrus = await prisma.product.upsert({
    where: { slug: "asus-rog-zephyrus-g16-2024" },
    update: {},
    create: {
      name: "ROG Zephyrus G16 (2024)",
      slug: "asus-rog-zephyrus-g16-2024",
      description:
        "Ultra-slim gaming powerhouse with Intel Core Ultra 9 processor, NVIDIA RTX 4090 GPU, and a blazing 240Hz QHD+ OLED display — engineered for elite competition.",
      shortDescription:
        "Intel Core Ultra 9 · RTX 4090 · 16-inch 240Hz QHD+ OLED",
      basePrice: 2999.0,
      sku: "ROG-ZEPH-G16-2024",
      brandId: asusRog.id,
      categoryId: laptopsCat.id,
      isFeatured: true,
      isActive: true,
      images: [
        "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=1200&q=80",
        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=80",
      ],
      tags: ["asus", "rog", "gaming", "laptop", "rtx", "oled"],
      technicalSpecs: {
        create: {
          processor: "Intel Core Ultra 9 185H (16-core)",
          memoryGb: 32,
          storageGb: 1024,
          displayInch: 16.0,
          displayResolution: "2560 × 1600 (QHD+)",
          displayType: "OLED 240Hz",
          batteryWh: 90,
          batteryLife: "Up to 10 hours",
          weight: 1.95,
          os: "Windows 11 Home",
          connectivity: "Wi-Fi 6E, Bluetooth 5.3",
          ports: "1× USB-C (Thunderbolt 4), 1× USB-C (USB 3.2), 2× USB-A 3.2, HDMI 2.1, SD Express 7.0, 3.5mm",
          webcam: "1080p IR camera with Windows Hello",
          audio: "Dolby Atmos quad-speaker system",
          color: "Eclipse Gray",
          dimensions: "35.4 × 24.3 × 1.49 cm",
        },
      },
      variants: {
        create: [
          {
            name: "32GB / 1TB — RTX 4080",
            sku: "ROG-G16-32-1TB-4080",
            price: 2999.0,
            stock: 18,
            attributes: { ram: "32GB", storage: "1TB", gpu: "RTX 4080", color: "Eclipse Gray" },
            images: [
              "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=1200&q=80",
            ],
          },
          {
            name: "32GB / 2TB — RTX 4090",
            sku: "ROG-G16-32-2TB-4090",
            price: 3499.0,
            stock: 10,
            attributes: { ram: "32GB", storage: "2TB", gpu: "RTX 4090", color: "Eclipse Gray" },
            images: [
              "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=80",
            ],
          },
        ],
      },
    },
  });

  // ---- 3. NVIDIA GeForce RTX 4090 Founders Edition ---- //
  const rtx4090 = await prisma.product.upsert({
    where: { slug: "nvidia-rtx-4090-founders-edition" },
    update: {},
    create: {
      name: "GeForce RTX 4090 Founders Edition",
      slug: "nvidia-rtx-4090-founders-edition",
      description:
        "NVIDIA's flagship Ada Lovelace GPU. 16,384 CUDA cores, 24GB GDDR6X memory, and second-generation RT cores deliver uncompromising 4K gaming and professional rendering performance.",
      shortDescription:
        "16K CUDA cores · 24GB GDDR6X · 4K gaming & AI powerhouse",
      basePrice: 1599.0,
      sku: "NV-RTX4090-FE",
      brandId: nvidia.id,
      categoryId: gpusCat.id,
      isFeatured: true,
      isActive: true,
      images: [
        "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&q=80",
        "https://via.placeholder.com/1200x800?text=RTX+4090+Side+View",
      ],
      tags: ["nvidia", "gpu", "rtx", "4090", "4k", "gaming", "ada-lovelace"],
      technicalSpecs: {
        create: {
          processor: "NVIDIA Ada Lovelace AD102",
          memoryGb: 24,
          storageGb: 0,
          displayInch: 0,
          displayResolution: "N/A",
          displayType: "N/A",
          batteryWh: 0,
          batteryLife: "N/A",
          weight: 2.13,
          os: "N/A",
          connectivity: "PCIe 4.0 ×16",
          ports: "3× DisplayPort 1.4a, 1× HDMI 2.1",
          webcam: "N/A",
          audio: "N/A",
          color: "Black / Platinum",
          dimensions: "33.6 × 14.0 × 6.1 cm (3-slot)",
        },
      },
      variants: {
        create: [
          {
            name: "RTX 4090 FE — Standard",
            sku: "NV-RTX4090-FE-STD",
            price: 1599.0,
            stock: 35,
            attributes: { edition: "Founders Edition", vram: "24GB GDDR6X" },
            images: [
              "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&q=80",
            ],
          },
          {
            name: "RTX 4090 FE — Bundle (PCIe 5.0 adapter)",
            sku: "NV-RTX4090-FE-BDL",
            price: 1649.0,
            stock: 12,
            attributes: { edition: "Founders Edition", vram: "24GB GDDR6X", bundle: "PCIe 5.0 power adapter" },
            images: [
              "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&q=80",
            ],
          },
        ],
      },
    },
  });

  // ---- 4. NVIDIA GeForce RTX 4070 Ti SUPER ---- //
  const rtx4070tiSuper = await prisma.product.upsert({
    where: { slug: "nvidia-rtx-4070-ti-super" },
    update: {},
    create: {
      name: "GeForce RTX 4070 Ti SUPER",
      slug: "nvidia-rtx-4070-ti-super",
      description:
        "The sweet spot for 4K gaming. 8,448 CUDA cores and 16GB of ultra-fast GDDR6X memory deliver incredible performance at a more accessible price point.",
      shortDescription:
        "8,448 CUDA cores · 16GB GDDR6X · Best-in-class 1440p & 4K",
      basePrice: 799.0,
      sku: "NV-RTX4070TIS",
      brandId: nvidia.id,
      categoryId: gpusCat.id,
      isFeatured: false,
      isActive: true,
      images: [
        "https://via.placeholder.com/1200x800?text=RTX+4070+Ti+SUPER",
        "https://via.placeholder.com/1200x800?text=RTX+4070+Ti+SUPER+Rear",
      ],
      tags: ["nvidia", "gpu", "rtx", "4070", "1440p", "4k", "gaming"],
      technicalSpecs: {
        create: {
          processor: "NVIDIA Ada Lovelace AD103",
          memoryGb: 16,
          storageGb: 0,
          displayInch: 0,
          displayResolution: "N/A",
          displayType: "N/A",
          batteryWh: 0,
          batteryLife: "N/A",
          weight: 1.78,
          os: "N/A",
          connectivity: "PCIe 4.0 ×16",
          ports: "3× DisplayPort 1.4a, 1× HDMI 2.1",
          webcam: "N/A",
          audio: "N/A",
          color: "Black",
          dimensions: "30.4 × 13.5 × 5.8 cm (2.5-slot)",
        },
      },
      variants: {
        create: [
          {
            name: "RTX 4070 Ti SUPER — 16GB",
            sku: "NV-RTX4070TIS-16GB",
            price: 799.0,
            stock: 55,
            attributes: { vram: "16GB GDDR6X" },
            images: [
              "https://via.placeholder.com/1200x800?text=RTX+4070+Ti+SUPER",
            ],
          },
          {
            name: "RTX 4070 Ti SUPER — 16GB (OC Edition)",
            sku: "NV-RTX4070TIS-16GB-OC",
            price: 849.0,
            stock: 28,
            attributes: { vram: "16GB GDDR6X", edition: "OC" },
            images: [
              "https://via.placeholder.com/1200x800?text=RTX+4070+Ti+SUPER+OC",
            ],
          },
          {
            name: "RTX 4070 Ti SUPER — 16GB (White Edition)",
            sku: "NV-RTX4070TIS-16GB-WH",
            price: 839.0,
            stock: 15,
            attributes: { vram: "16GB GDDR6X", color: "White" },
            images: [
              "https://via.placeholder.com/1200x800?text=RTX+4070+Ti+SUPER+White",
            ],
          },
        ],
      },
    },
  });

  console.log("✅  Products seeded");

  // ------------------------------------------------------------------ //
  //  PRODUCT COMPATIBILITY                                               //
  //  Maps accessories / warranties to products                          //
  // ------------------------------------------------------------------ //

  // MacBook Pro accessories
  await prisma.productCompatibility.createMany({
    skipDuplicates: true,
    data: [
      {
        productId: macbookPro.id,
        compatibleProductId: rtx4090.id,
        note: "eGPU enclosure compatible via Thunderbolt 4",
        relationType: "accessory",
      },
      {
        productId: macbookPro.id,
        compatibleProductId: rogZephyrus.id,
        note: "Comparable performance tier — often purchased together for multi-machine setups",
        relationType: "similar",
      },
    ],
  });

  // ROG Zephyrus accessories
  await prisma.productCompatibility.createMany({
    skipDuplicates: true,
    data: [
      {
        productId: rogZephyrus.id,
        compatibleProductId: macbookPro.id,
        note: "Comparable premium laptop — frequently compared",
        relationType: "similar",
      },
    ],
  });

  // RTX 4090 — compatible with RTX 4070 Ti SUPER for SLI / NVLink (reference)
  await prisma.productCompatibility.createMany({
    skipDuplicates: true,
    data: [
      {
        productId: rtx4090.id,
        compatibleProductId: rtx4070tiSuper.id,
        note: "RTX 4070 Ti SUPER is a recommended upgrade path from mid-range",
        relationType: "upsell",
      },
      {
        productId: rtx4090.id,
        compatibleProductId: rogZephyrus.id,
        note: "RTX 4090 mobile variant powers this laptop",
        relationType: "component",
      },
    ],
  });

  // RTX 4070 Ti SUPER — upgrade path to RTX 4090
  await prisma.productCompatibility.createMany({
    skipDuplicates: true,
    data: [
      {
        productId: rtx4070tiSuper.id,
        compatibleProductId: rtx4090.id,
        note: "Upgrade to RTX 4090 for maximum 4K performance",
        relationType: "upsell",
      },
    ],
  });

  console.log("✅  Product compatibility records seeded");

  console.log("\n🎉  Seed complete!");
  console.log(`    Brands  : 3  (Apple, ASUS ROG, NVIDIA)`);
  console.log(`    Categories: 2  (Laptops, GPUs)`);
  console.log(`    Products: 4`);
  console.log(`    Variants: 10`);
  console.log(`    Compatibility records: 5`);
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
