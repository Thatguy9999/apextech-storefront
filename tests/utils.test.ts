import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatStorage,
  formatRam,
  formatResolution,
  clamp,
  getStockStatus,
  slugify,
  truncate,
  getDiscountPercent,
  cn,
} from '@/lib/utils';

describe('Utility Functions - Precision Electronics Helpers', () => {
  describe('formatCurrency', () => {
    it('formats USD values with standard decimal formatting', () => {
      expect(formatCurrency(1999.99)).toBe('$1,999.99');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(3499)).toBe('$3,499.00');
    });
  });

  describe('formatStorage', () => {
    it('formats gigabytes under 1000 as GB', () => {
      expect(formatStorage(512)).toBe('512GB');
      expect(formatStorage(256)).toBe('256GB');
    });

    it('converts 1000GB+ to clean TB units', () => {
      expect(formatStorage(1000)).toBe('1TB');
      expect(formatStorage(2000)).toBe('2TB');
      expect(formatStorage(4000)).toBe('4TB');
      expect(formatStorage(1500)).toBe('1.5TB');
    });
  });

  describe('formatRam', () => {
    it('formats RAM with memory technology type', () => {
      expect(formatRam(32, 'DDR5-5600')).toBe('32GB DDR5-5600');
      expect(formatRam(64, 'Unified Memory')).toBe('64GB Unified Memory');
    });

    it('defaults to standard RAM label when type is omitted', () => {
      expect(formatRam(16)).toBe('16GB RAM');
    });
  });

  describe('formatResolution', () => {
    it('replaces lowercase x with standard typographic multiplication symbol', () => {
      expect(formatResolution('3456 x 2234')).toBe('3456 × 2234');
      expect(formatResolution('3840x2160')).toBe('3840 × 2160');
    });
  });

  describe('clamp', () => {
    it('restricts values within min and max boundaries', () => {
      expect(clamp(15, 1, 10)).toBe(10);
      expect(clamp(-5, 0, 100)).toBe(0);
      expect(clamp(42, 0, 100)).toBe(42);
    });
  });

  describe('getStockStatus', () => {
    it('returns out of stock status for zero inventory', () => {
      const status = getStockStatus(0, 5);
      expect(status.available).toBe(false);
      expect(status.label).toBe('Out of Stock');
      expect(status.urgent).toBe(false);
    });

    it('returns urgency warning when stock is below or equal to threshold', () => {
      const status = getStockStatus(3, 5);
      expect(status.available).toBe(true);
      expect(status.urgent).toBe(true);
      expect(status.label).toBe('Only 3 left');
    });

    it('returns standard In Stock when inventory is healthy', () => {
      const status = getStockStatus(25, 5);
      expect(status.available).toBe(true);
      expect(status.urgent).toBe(false);
      expect(status.label).toBe('In Stock');
    });
  });

  describe('slugify', () => {
    it('converts product and brand titles to URL-safe slugs', () => {
      expect(slugify('Apple MacBook Pro 16" (M3 Max)')).toBe('apple-macbook-pro-16-m3-max');
      expect(slugify('ROG Zephyrus G16 - OLED Edition')).toBe('rog-zephyrus-g16-oled-edition');
    });
  });

  describe('truncate', () => {
    it('truncates strings longer than maxLength and appends ellipsis', () => {
      expect(truncate('Flagship Gaming Laptop with Liquid Metal Cooling', 20)).toBe('Flagship Gaming…');
    });

    it('leaves strings shorter than or equal to maxLength untouched', () => {
      expect(truncate('RTX 4090', 20)).toBe('RTX 4090');
    });
  });

  describe('getDiscountPercent', () => {
    it('calculates savings percentage rounded to nearest integer', () => {
      expect(getDiscountPercent(2000, 1600)).toBe(20);
      expect(getDiscountPercent(1999, 1499)).toBe(25);
      expect(getDiscountPercent(0, 100)).toBe(0);
    });
  });

  describe('cn (Tailwind class merging)', () => {
    it('merges class names and resolves conflicting Tailwind utility classes', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
      expect(cn('text-red-500', false && 'hidden', 'font-bold')).toBe('text-red-500 font-bold');
    });
  });
});
