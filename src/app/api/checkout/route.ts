// src/app/api/checkout/route.ts
// Stripe Checkout Session creation — secured server-side Route Handler

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { CartLineItem } from '@/types/storefront';
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CheckoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload', details: parsed.error }, { status: 400 });
    }

    const { items, successUrl, cancelUrl } = parsed.data;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Fetch authoritative variant data to prevent price manipulation
    const variantIds = items.map((i) => i.productVariantId);
    const dbVariants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds }, isAvailable: true },
      include: { product: { include: { brand: true } } },
    });

    // Guard: Validate all variants exist and have sufficient stock
    for (const item of items) {
      const variant = dbVariants.find((v) => v.id === item.productVariantId);
      if (!variant) {
        return NextResponse.json(
          { error: `Product variant not found or unavailable: ${item.productVariantId}` },
          { status: 404 }
        );
      }
      if (variant.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${variant.product.name} - ${variant.edition}". Only ${variant.stockQuantity} remaining.`,
          },
          { status: 409 }
        );
      }
    }

    // Build Stripe line items using authoritative DB prices
    const stripeLineItems: Parameters<typeof stripe.checkout.sessions.create>[0]['line_items'] = [];

    for (const item of items) {
      const dbVariant = dbVariants.find((v) => v.id === item.productVariantId)!;

      stripeLineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(Number(dbVariant.price) * 100), // Stripe expects cents
          product_data: {
            name: `${dbVariant.product.brand.name} ${dbVariant.product.name} — ${dbVariant.edition}`,
            description: `SKU: ${dbVariant.sku}${dbVariant.color ? ` | ${dbVariant.color}` : ''}`,
            metadata: {
              variantId: dbVariant.id,
              sku: dbVariant.sku,
              productId: dbVariant.productId,
            },
          },
        },
      });

      // Attach warranty as a separate line item if present
      if (item.attachedWarranty) {
        stripeLineItems.push({
          quantity: item.quantity,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(item.attachedWarranty.price * 100),
            product_data: {
              name: `${item.attachedWarranty.name} (${item.attachedWarranty.durationYears}-Year Coverage)`,
              description: `Extended Warranty for SKU: ${dbVariant.sku}`,
              metadata: {
                type: 'WARRANTY',
                warrantyId: item.attachedWarranty.warrantyId,
                coveredVariantId: dbVariant.id,
              },
            },
          },
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: stripeLineItems,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE'] },
      automatic_tax: { enabled: true },
      metadata: {
        // Pass item manifests for webhook fulfillment
        itemManifest: JSON.stringify(
          items.map((i) => ({
            variantId: i.productVariantId,
            qty: i.quantity,
          }))
        ),
      },
      success_url: successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/cart`,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('[/api/checkout]', error);
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
  }
}

