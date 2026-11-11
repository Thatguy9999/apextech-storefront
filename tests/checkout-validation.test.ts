import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const CheckoutRequestSchema = z.object({
  items: z.array(
    z.object({
      productVariantId: z.string().uuid(),
      quantity: z.number().int().positive(),
      attachedWarranty: z
        .object({
          warrantyId: z.string(),
          name: z.string(),
          price: z.number(),
          durationYears: z.number(),
        })
        .optional(),
    })
  ),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

describe('Checkout Request Payload Validation (Zod Schema)', () => {
  it('passes validation for valid checkout payload', () => {
    const payload = {
      items: [
        {
          productVariantId: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 2,
        },
      ],
      successUrl: 'http://localhost:3000/checkout/success',
    };

    const res = CheckoutRequestSchema.safeParse(payload);
    expect(res.success).toBe(true);
  });

  it('passes validation with attached warranty details', () => {
    const payload = {
      items: [
        {
          productVariantId: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 1,
          attachedWarranty: {
            warrantyId: 'war-01',
            name: '3-Year Complete Care',
            price: 299,
            durationYears: 3,
          },
        },
      ],
    };

    const res = CheckoutRequestSchema.safeParse(payload);
    expect(res.success).toBe(true);
  });

  it('rejects payload when productVariantId is not a valid UUID', () => {
    const payload = {
      items: [
        {
          productVariantId: 'invalid-id-not-uuid',
          quantity: 1,
        },
      ],
    };

    const res = CheckoutRequestSchema.safeParse(payload);
    expect(res.success).toBe(false);
  });

  it('rejects zero or negative quantities', () => {
    const payload = {
      items: [
        {
          productVariantId: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 0,
        },
      ],
    };

    const res = CheckoutRequestSchema.safeParse(payload);
    expect(res.success).toBe(false);
  });

  it('rejects invalid URLs in redirect parameters', () => {
    const payload = {
      items: [
        {
          productVariantId: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 1,
        },
      ],
      successUrl: 'not-a-valid-url',
    };

    const res = CheckoutRequestSchema.safeParse(payload);
    expect(res.success).toBe(false);
  });
});

