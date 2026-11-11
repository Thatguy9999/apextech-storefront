// src/lib/utils.ts
// Shared utility functions — formatting, classNames, and type helpers

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely, resolving conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as USD currency (or any locale/currency) */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format storage in GB to the most readable unit (GB or TB) */
export function formatStorage(gb: number): string {
  if (gb >= 1000) {
    const tb = gb / 1000;
    return Number.isInteger(tb) ? `${tb}TB` : `${tb.toFixed(1)}TB`;
  }
  return `${gb}GB`;
}

/** Format RAM with type information */
export function formatRam(gb: number, type?: string): string {
  return type ? `${gb}GB ${type}` : `${gb}GB RAM`;
}

/** Format display resolution from "3456 x 2234" */
export function formatResolution(resolution: string): string {
  return resolution.replace(/\s*x\s*/i, ' × ');
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Get the stock availability label and urgency */
export function getStockStatus(
  quantity: number,
  threshold: number
): { label: string; urgent: boolean; available: boolean } {
  if (quantity === 0) return { label: 'Out of Stock', urgent: false, available: false };
  if (quantity <= threshold) return { label: `Only ${quantity} left`, urgent: true, available: true };
  return { label: 'In Stock', urgent: false, available: true };
}

/** Create a unique slugified identifier from a product name */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Truncate a string to a max length with an ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength).trimEnd()}…`;
}

/** Calculate discount percentage */
export function getDiscountPercent(original: number, sale: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

/** Convert Prisma Decimal or unknown numeric to number or undefined */
export function toNum(val: unknown): number | undefined {
  if (val == null) return undefined;
  const n = parseFloat(String(val));
  return isNaN(n) ? undefined : n;
}

