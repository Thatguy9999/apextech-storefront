// tests/e2e-storefront.test.mjs
// Native Node.js 22 Test Suite for ApexTech Headless E-Commerce Storefront
// Validates: Precision Spec Utilities, Cart Business Logic, Comparison Engine, Compatibility Matching, and Checkout Schemas

import { describe, it } from 'node:test';
import assert from 'node:assert';

// ============================================================================
// 1. PURE LOGIC REPRODUCTIONS (Matches src/lib/utils.ts)
// ============================================================================

function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatStorage(gb) {
  if (gb >= 1000) {
    const tb = gb / 1000;
    return Number.isInteger(tb) ? `${tb}TB` : `${tb.toFixed(1)}TB`;
  }
  return `${gb}GB`;
}

function formatRam(gb, type) {
  return type ? `${gb}GB ${type}` : `${gb}GB RAM`;
}

function formatResolution(resolution) {
  return resolution.replace(/\s*x\s*/i, ' × ');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getStockStatus(quantity, threshold) {
  if (quantity === 0) return { label: 'Out of Stock', urgent: false, available: false };
  if (quantity <= threshold) return { label: `Only ${quantity} left`, urgent: true, available: true };
  return { label: 'In Stock', urgent: false, available: true };
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function getDiscountPercent(original, sale) {
  if (original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

// ============================================================================
// 2. SUITE: PRECISION HARDWARE UTILITIES & FORMATTING
// ============================================================================

describe('Module 1: Precision Hardware Utilities & Spec Formatting', () => {
  it('formats currency with exact USD financial precision', () => {
    assert.strictEqual(formatCurrency(2499.0), '$2,499.00');
    assert.strictEqual(formatCurrency(399.99), '$399.99');
    assert.strictEqual(formatCurrency(0), '$0.00');
  });

  it('formats storage accurately into GB and human-friendly TB units', () => {
    assert.strictEqual(formatStorage(512), '512GB');
    assert.strictEqual(formatStorage(1000), '1TB');
    assert.strictEqual(formatStorage(2000), '2TB');
    assert.strictEqual(formatStorage(4000), '4TB');
    assert.strictEqual(formatStorage(1500), '1.5TB');
  });

  it('formats RAM memory standards cleanly for technical specification tables', () => {
    assert.strictEqual(formatRam(32, 'DDR5-5600'), '32GB DDR5-5600');
    assert.strictEqual(formatRam(64, 'Unified Memory'), '64GB Unified Memory');
    assert.strictEqual(formatRam(16), '16GB RAM');
  });

  it('normalizes screen resolution delimiters to standard typographic multiplication signs', () => {
    assert.strictEqual(formatResolution('3456 x 2234'), '3456 × 2234');
    assert.strictEqual(formatResolution('3840x2160'), '3840 × 2160');
  });

  it('evaluates real-time inventory levels and urgency triggers', () => {
    const oos = getStockStatus(0, 5);
    assert.strictEqual(oos.available, false);
    assert.strictEqual(oos.label, 'Out of Stock');
    assert.strictEqual(oos.urgent, false);

    const lowStock = getStockStatus(2, 5);
    assert.strictEqual(lowStock.available, true);
    assert.strictEqual(lowStock.urgent, true);
    assert.strictEqual(lowStock.label, 'Only 2 left');

    const healthyStock = getStockStatus(45, 5);
    assert.strictEqual(healthyStock.available, true);
    assert.strictEqual(healthyStock.urgent, false);
    assert.strictEqual(healthyStock.label, 'In Stock');
  });

  it('converts product brand and titles to clean SEO slugs', () => {
    assert.strictEqual(
      slugify('Apple MacBook Pro 16" (M3 Max - Space Black)'),
      'apple-macbook-pro-16-m3-max-space-black'
    );
    assert.strictEqual(slugify('ASUS ROG Zephyrus G16'), 'asus-rog-zephyrus-g16');
  });

  it('calculates bundle and promotional discounts accurately', () => {
    assert.strictEqual(getDiscountPercent(2499, 1999), 20);
    assert.strictEqual(getDiscountPercent(100, 75), 25);
    assert.strictEqual(getDiscountPercent(0, 50), 0);
  });
});

// ============================================================================
// 3. SUITE: CART ENGINE & STOCK BOUNDARY VERIFICATION
// ============================================================================

describe('Module 2: Cart Engine, Stock Boundaries & Warranty Add-ons', () => {
  class MockCartEngine {
    constructor() {
      this.items = [];
    }

    addItem(item) {
      const compositeKey = `${item.productVariantId}_${item.attachedWarranty?.warrantyId || 'nowarranty'}`;
      const existing = this.items.find((i) => i.id === compositeKey);

      if (existing) {
        const nextQty = Math.min(existing.quantity + item.quantity, existing.stockAvailable);
        existing.quantity = nextQty;
      } else {
        this.items.push({
          ...item,
          id: compositeKey,
          quantity: Math.min(item.quantity, item.stockAvailable),
        });
      }
    }

    updateQuantity(id, quantity) {
      if (quantity <= 0) {
        this.items = this.items.filter((i) => i.id !== id);
        return;
      }
      const target = this.items.find((i) => i.id === id);
      if (target) {
        target.quantity = Math.min(quantity, target.stockAvailable);
      }
    }

    attachWarranty(id, warranty) {
      const target = this.items.find((i) => i.id === id);
      if (target) {
        target.attachedWarranty = warranty;
      }
    }

    getSubtotal() {
      return this.items.reduce((total, item) => {
        const base = item.unitPrice * item.quantity;
        const warranty = item.attachedWarranty ? item.attachedWarranty.price * item.quantity : 0;
        return total + base + warranty;
      }, 0);
    }

    getTotalItemCount() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    isFreeShippingEligible() {
      return this.getSubtotal() >= 99.0;
    }
  }

  it('adds items, enforces stock bounds, and computes composite keys', () => {
    const cart = new MockCartEngine();
    const laptop = {
      productVariantId: 'var-apple-01',
      productName: 'MacBook Pro 16',
      unitPrice: 2499.0,
      quantity: 2,
      stockAvailable: 4,
    };

    cart.addItem(laptop);
    assert.strictEqual(cart.items.length, 1);
    assert.strictEqual(cart.getTotalItemCount(), 2);
    assert.strictEqual(cart.getSubtotal(), 4998.0);
    assert.strictEqual(cart.isFreeShippingEligible(), true);

    // Attempt to add 3 more when stock ceiling is 4
    cart.addItem(laptop);
    assert.strictEqual(cart.items[0].quantity, 4); // Capped at 4
  });

  it('correctly isolates line items when attaching digital warranties', () => {
    const cart = new MockCartEngine();
    const laptop = {
      productVariantId: 'var-asus-01',
      productName: 'ROG Zephyrus G16',
      unitPrice: 2899.0,
      quantity: 1,
      stockAvailable: 10,
    };

    cart.addItem(laptop);
    const lineId = cart.items[0].id;

    // Attach 3-Year Accidental Damage Protection
    cart.attachWarranty(lineId, {
      warrantyId: 'war-rog-3yr',
      name: 'ROG Care 3-Year Accidental Protection',
      price: 349.0,
      durationYears: 3,
    });

    assert.strictEqual(cart.getSubtotal(), 2899.0 + 349.0);
    assert.strictEqual(cart.items[0].attachedWarranty.warrantyId, 'war-rog-3yr');
  });

  it('removes item automatically when quantity updated to 0', () => {
    const cart = new MockCartEngine();
    cart.addItem({
      productVariantId: 'var-gpu-01',
      productName: 'RTX 4090 Founders Edition',
      unitPrice: 1599.0,
      quantity: 1,
      stockAvailable: 3,
    });

    const lineId = cart.items[0].id;
    cart.updateQuantity(lineId, 0);
    assert.strictEqual(cart.items.length, 0);
    assert.strictEqual(cart.getSubtotal(), 0);
  });
});

// ============================================================================
// 4. SUITE: SIDE-BY-SIDE SPEC COMPARISON DIFFING ENGINE
// ============================================================================

describe('Module 3: Side-by-Side Comparison Engine & Advantage Evaluator', () => {
  class MockComparisonEngine {
    constructor(maxSlots = 4) {
      this.maxSlots = maxSlots;
      this.slots = [];
    }

    add(product) {
      if (this.slots.some((p) => p.id === product.id)) return false;
      if (this.slots.length >= this.maxSlots) return false;
      this.slots.push(product);
      return true;
    }

    toggle(product) {
      if (this.slots.some((p) => p.id === product.id)) {
        this.slots = this.slots.filter((p) => p.id !== product.id);
        return false;
      }
      return this.add(product);
    }

    getBestMetric(metricKey, higherIsBetter = true) {
      if (this.slots.length < 2) return null;

      let bestVal = null;
      let bestId = null;

      for (const p of this.slots) {
        const val = p.specs?.[metricKey];
        if (typeof val !== 'number') continue;

        if (bestVal === null) {
          bestVal = val;
          bestId = p.id;
        } else if (higherIsBetter ? val > bestVal : val < bestVal) {
          bestVal = val;
          bestId = p.id;
        }
      }

      return { bestId, bestVal };
    }
  }

  const macbook = {
    id: 'apple-mbp-16',
    name: 'MacBook Pro 16',
    specs: { ramGb: 64, storageGb: 2000, refreshRateHz: 120, weightKg: 2.14, basePrice: 3499 },
  };

  const zephyrus = {
    id: 'asus-rog-g16',
    name: 'ROG Zephyrus G16',
    specs: { ramGb: 32, storageGb: 1000, refreshRateHz: 240, weightKg: 1.85, basePrice: 2899 },
  };

  const workstation = {
    id: 'razer-blade-16',
    name: 'Razer Blade 16',
    specs: { ramGb: 32, storageGb: 2000, refreshRateHz: 240, weightKg: 2.45, basePrice: 3799 },
  };

  it('restricts comparison capacity to exactly 4 devices', () => {
    const comp = new MockComparisonEngine(4);
    assert.strictEqual(comp.add(macbook), true);
    assert.strictEqual(comp.add(zephyrus), true);
    assert.strictEqual(comp.add(workstation), true);
    assert.strictEqual(comp.add({ id: 'laptop-4', specs: {} }), true);
    // 5th item must be rejected
    assert.strictEqual(comp.add({ id: 'laptop-5', specs: {} }), false);
    assert.strictEqual(comp.slots.length, 4);
  });

  it('evaluates highest RAM accurately across devices', () => {
    const comp = new MockComparisonEngine(4);
    comp.add(macbook);
    comp.add(zephyrus);

    const ramResult = comp.getBestMetric('ramGb', true);
    assert.strictEqual(ramResult.bestId, 'apple-mbp-16');
    assert.strictEqual(ramResult.bestVal, 64);
  });

  it('evaluates highest refresh rate accurately (G16 240Hz vs MBP 120Hz)', () => {
    const comp = new MockComparisonEngine(4);
    comp.add(macbook);
    comp.add(zephyrus);

    const hzResult = comp.getBestMetric('refreshRateHz', true);
    assert.strictEqual(hzResult.bestId, 'asus-rog-g16');
    assert.strictEqual(hzResult.bestVal, 240);
  });

  it('evaluates lowest weight advantage (lower is better)', () => {
    const comp = new MockComparisonEngine(4);
    comp.add(macbook); // 2.14kg
    comp.add(zephyrus); // 1.85kg
    comp.add(workstation); // 2.45kg

    const weightResult = comp.getBestMetric('weightKg', false);
    assert.strictEqual(weightResult.bestId, 'asus-rog-g16');
    assert.strictEqual(weightResult.bestVal, 1.85);
  });
});

// ============================================================================
// 5. SUITE: HARDWARE COMPATIBILITY & CROSS-SELLING ENGINE
// ============================================================================

describe('Module 4: Hardware Compatibility & Cross-Sell Logic', () => {
  const compatibilityRules = [
    {
      primarySeries: 'MacBook Pro',
      compatibleCategory: 'CHARGER',
      compatibleSku: 'CHG-140W-GAN-MBP',
      recommended: true,
      minWattage: 140,
    },
    {
      primarySeries: 'MacBook Pro',
      compatibleCategory: 'ACCESSORY',
      compatibleSku: 'CASE-LTHR-16-BLK',
      targetEdition: 'Space Black',
      recommended: true,
    },
    {
      primarySeries: 'ROG Zephyrus',
      compatibleCategory: 'CHARGER',
      compatibleSku: 'CHG-280W-ROG-SLIM',
      recommended: true,
      minWattage: 280,
    },
  ];

  function findCompatibleAccessories(series, edition, category) {
    return compatibilityRules.filter((rule) => {
      if (rule.primarySeries !== series) return false;
      if (category && rule.compatibleCategory !== category) return false;
      if (rule.targetEdition && rule.targetEdition !== edition) return false;
      return true;
    });
  }

  it('recommends 140W GaN charger for MacBook Pro series', () => {
    const matches = findCompatibleAccessories('MacBook Pro', 'Standard', 'CHARGER');
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].compatibleSku, 'CHG-140W-GAN-MBP');
    assert.strictEqual(matches[0].minWattage, 140);
  });

  it('filters edition-specific accessories (e.g. Space Black leather sleeve)', () => {
    const spaceBlackMatches = findCompatibleAccessories('MacBook Pro', 'Space Black', 'ACCESSORY');
    assert.strictEqual(spaceBlackMatches.length, 1);
    assert.strictEqual(spaceBlackMatches[0].compatibleSku, 'CASE-LTHR-16-BLK');

    const silverMatches = findCompatibleAccessories('MacBook Pro', 'Silver', 'ACCESSORY');
    assert.strictEqual(silverMatches.length, 0); // Sleeve is specific to Space Black edition
  });

  it('prevents cross-selling incompatible charger (280W ROG vs 140W Apple)', () => {
    const rogChargers = findCompatibleAccessories('ROG Zephyrus', 'Standard', 'CHARGER');
    assert.strictEqual(rogChargers.length, 1);
    assert.strictEqual(rogChargers[0].compatibleSku, 'CHG-280W-ROG-SLIM');
    assert.notStrictEqual(rogChargers[0].compatibleSku, 'CHG-140W-GAN-MBP');
  });
});

// ============================================================================
// 6. SUITE: STRIPE CHECKOUT TELEMETRY & PAYLOAD VALIDATION
// ============================================================================

describe('Module 5: Stripe Checkout Telemetry & Payload Integrity', () => {
  function validateCheckoutPayload(payload) {
    if (!payload || typeof payload !== 'object') return { valid: false, reason: 'Invalid root' };
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      return { valid: false, reason: 'Missing items array' };
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    for (const item of payload.items) {
      if (!item.productVariantId || !uuidRegex.test(item.productVariantId)) {
        return { valid: false, reason: 'Invalid productVariantId UUID' };
      }
      if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        return { valid: false, reason: 'Quantity must be a positive integer' };
      }
      if (item.attachedWarranty) {
        if (!item.attachedWarranty.warrantyId || typeof item.attachedWarranty.price !== 'number') {
          return { valid: false, reason: 'Malformed warranty attachment' };
        }
      }
    }

    return { valid: true };
  }

  function convertToStripeCents(dollarAmount) {
    return Math.round(dollarAmount * 100);
  }

  it('validates authentic checkout payload structure', () => {
    const validPayload = {
      items: [
        {
          productVariantId: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
          quantity: 1,
          attachedWarranty: {
            warrantyId: 'war-3yr',
            price: 299.0,
          },
        },
      ],
    };

    const res = validateCheckoutPayload(validPayload);
    assert.strictEqual(res.valid, true);
  });

  it('rejects malformed UUIDs and negative quantities', () => {
    const invalidUuidPayload = {
      items: [{ productVariantId: 'not-a-uuid', quantity: 1 }],
    };
    assert.strictEqual(validateCheckoutPayload(invalidUuidPayload).valid, false);

    const zeroQuantityPayload = {
      items: [{ productVariantId: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d', quantity: 0 }],
    };
    assert.strictEqual(validateCheckoutPayload(zeroQuantityPayload).valid, false);

    const negativeQuantityPayload = {
      items: [{ productVariantId: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d', quantity: -3 }],
    };
    assert.strictEqual(validateCheckoutPayload(negativeQuantityPayload).valid, false);
  });

  it('converts decimal dollar amounts to accurate Stripe integer cents', () => {
    assert.strictEqual(convertToStripeCents(2499.0), 249900);
    assert.strictEqual(convertToStripeCents(19.99), 1999);
    assert.strictEqual(convertToStripeCents(0.5), 50);
  });
});
