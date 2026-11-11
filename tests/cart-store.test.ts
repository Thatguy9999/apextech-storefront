import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/store/useCartStore';

describe('useCartStore - State Management & Inventory Logic', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.getState().setDrawerOpen(false);
  });

  const mockItem = {
    productVariantId: 'var-101',
    productId: 'prod-001',
    productName: 'MacBook Pro 16"',
    productSlug: 'macbook-pro-16',
    brandName: 'Apple',
    series: 'MacBook Pro',
    edition: 'Pro Max',
    unitPrice: 2499.0,
    quantity: 1,
    imageUrl: '/images/mbp16.png',
    stockAvailable: 5,
  };

  it('initializes with an empty cart', () => {
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.getTotalItemsCount()).toBe(0);
    expect(state.getSubtotal()).toBe(0);
  });

  it('adds an item to the cart and opens the drawer', () => {
    useCartStore.getState().addItem(mockItem);
    const state = useCartStore.getState();

    expect(state.items).toHaveLength(1);
    expect(state.items[0].productName).toBe('MacBook Pro 16"');
    expect(state.items[0].quantity).toBe(1);
    expect(state.isOpen).toBe(true);
    expect(state.getSubtotal()).toBe(2499.0);
  });

  it('increments quantity when the identical variant is added', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().addItem({ ...mockItem, quantity: 2 });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
    expect(state.getSubtotal()).toBe(2499.0 * 3);
  });

  it('enforces maximum available stock limit upon repeated addition', () => {
    // stockAvailable is 5
    useCartStore.getState().addItem({ ...mockItem, quantity: 4 });
    useCartStore.getState().addItem({ ...mockItem, quantity: 3 });

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5); // Capped at stockAvailable
  });

  it('updates quantity within stock bounds and removes when quantity is zero', () => {
    useCartStore.getState().addItem(mockItem);
    const itemId = useCartStore.getState().items[0].id;

    // Update to 4
    useCartStore.getState().updateQuantity(itemId, 4);
    expect(useCartStore.getState().items[0].quantity).toBe(4);

    // Update to 0 removes the item
    useCartStore.getState().updateQuantity(itemId, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('attaches and removes extended warranty service to a line item', () => {
    useCartStore.getState().addItem(mockItem);
    const itemId = useCartStore.getState().items[0].id;

    const warranty = {
      warrantyId: 'war-3yr-applecare',
      name: '3-Year AppleCare+ with Accidental Protection',
      price: 399.0,
      durationYears: 3,
    };

    useCartStore.getState().attachWarranty(itemId, warranty);
    let state = useCartStore.getState();
    expect(state.items[0].attachedWarranty).toBeDefined();
    expect(state.items[0].attachedWarranty?.price).toBe(399.0);
    // Subtotal should include item price + warranty price
    expect(state.getSubtotal()).toBe(2499.0 + 399.0);

    // Remove warranty
    useCartStore.getState().removeWarranty(itemId);
    state = useCartStore.getState();
    expect(state.items[0].attachedWarranty).toBeUndefined();
    expect(state.getSubtotal()).toBe(2499.0);
  });

  it('clears all items on checkout completion', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().getSubtotal()).toBe(0);
  });
});

