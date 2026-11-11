import { describe, it, expect, beforeEach } from 'vitest';
import { useCompareStore } from '@/store/useCompareStore';
import { ProductDTO } from '@/types/storefront';

describe('useCompareStore - Side-by-Side Comparison Engine', () => {
  beforeEach(() => {
    useCompareStore.getState().clearAll();
  });

  const createMockProduct = (id: string, name: string): ProductDTO => ({
    id,
    name,
    slug: `slug-${id}`,
    description: 'Hardware test description',
    brand: { id: 'b1', name: 'Brand', slug: 'brand' },
    category: { id: 'c1', name: 'Laptops', slug: 'laptops' },
    series: 'Series 1',
    releaseDate: '2026-01-01',
    basePrice: 1999,
    isPublished: true,
    featured: true,
    primaryImageUrl: '/img.png',
    variants: [],
  });

  it('initializes with an empty comparison list', () => {
    expect(useCompareStore.getState().items).toHaveLength(0);
  });

  it('adds products and tracks membership', () => {
    const p1 = createMockProduct('p1', 'MacBook Pro');
    const added = useCompareStore.getState().addItem(p1);

    expect(added).toBe(true);
    expect(useCompareStore.getState().items).toHaveLength(1);
    expect(useCompareStore.getState().isInComparison('p1')).toBe(true);
  });

  it('prevents adding duplicate products', () => {
    const p1 = createMockProduct('p1', 'MacBook Pro');
    useCompareStore.getState().addItem(p1);
    const addedAgain = useCompareStore.getState().addItem(p1);

    expect(addedAgain).toBe(false);
    expect(useCompareStore.getState().items).toHaveLength(1);
  });

  it('enforces strict ceiling of maximum 4 comparison products', () => {
    const p1 = createMockProduct('p1', 'Laptop 1');
    const p2 = createMockProduct('p2', 'Laptop 2');
    const p3 = createMockProduct('p3', 'Laptop 3');
    const p4 = createMockProduct('p4', 'Laptop 4');
    const p5 = createMockProduct('p5', 'Laptop 5');

    expect(useCompareStore.getState().addItem(p1)).toBe(true);
    expect(useCompareStore.getState().addItem(p2)).toBe(true);
    expect(useCompareStore.getState().addItem(p3)).toBe(true);
    expect(useCompareStore.getState().addItem(p4)).toBe(true);
    // 5th item must be rejected
    expect(useCompareStore.getState().addItem(p5)).toBe(false);

    expect(useCompareStore.getState().items).toHaveLength(4);
  });

  it('toggles products in and out of comparison', () => {
    const p1 = createMockProduct('p1', 'Laptop 1');

    // First toggle: added
    const res1 = useCompareStore.getState().toggleItem(p1);
    expect(res1).toBe(true);
    expect(useCompareStore.getState().isInComparison('p1')).toBe(true);

    // Second toggle: removed
    const res2 = useCompareStore.getState().toggleItem(p1);
    expect(res2).toBe(false);
    expect(useCompareStore.getState().isInComparison('p1')).toBe(false);
  });

  it('clears all items cleanly', () => {
    useCompareStore.getState().addItem(createMockProduct('p1', 'L1'));
    useCompareStore.getState().addItem(createMockProduct('p2', 'L2'));
    useCompareStore.getState().clearAll();

    expect(useCompareStore.getState().items).toHaveLength(0);
  });
});
