import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";

import { stripe } from "@/lib/stripe";

// Disable Next.js body parsing — we need the raw body for signature verification
export const dynamic = "force-dynamic";

// ---- Helpers ----------------------------------------------------------------

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random
  return `ORD-${year}-${random}`;
}

/** Convert Stripe amount_total (cents) to Decimal-safe string in dollars */
function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

// ---- Event Handlers ---------------------------------------------------------

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log("[Stripe Webhook] checkout.session.completed", session.id);

  const itemManifest: Array<{ variantId: string; qty: number }> = JSON.parse(
    session.metadata?.itemManifest ?? "[]"
  );

  if (itemManifest.length === 0) {
    console.warn("[Stripe Webhook] itemManifest is empty for session", session.id);
    return;
  }

  const totalAmount = centsToDollars(session.amount_total ?? 0);
  const currency = (session.currency ?? "usd").toUpperCase();

  await prisma.$transaction(async (tx) => {
    // 1 & 2: Check stock and decrement for each variant atomically
    for (const { variantId, qty } of itemManifest) {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        select: { id: true, stockQuantity: true },
      });

      if (!variant) {
        throw new Error(`Variant ${variantId} not found`);
      }
      if (variant.stockQuantity < qty) {
        throw new Error(
          `Insufficient stock for variant ${variantId}: need ${qty}, have ${variant.stockQuantity}`
        );
      }

      await tx.productVariant.update({
        where: { id: variantId },
        data: { stockQuantity: { decrement: qty } },
      });
    }

    // 3: Create Order
    const orderNumber = generateOrderNumber();
    const order = await tx.order.create({
      data: {
        orderNumber,
        status: OrderStatus.PAID,
        totalAmount,
        currency,
        shippingSnapshot: session.shipping_details
          ? JSON.parse(JSON.stringify(session.shipping_details))
          : {},
        billingSnapshot: session.customer_details
          ? JSON.parse(JSON.stringify(session.customer_details))
          : {},
        guestEmail: session.customer_details?.email ?? undefined,
      },
    });

    // 4: Create OrderItems — fetch each variant with product + specs for snapshot
    for (const { variantId, qty } of itemManifest) {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        include: {
          product: {
            include: { specs: true },
          },
        },
      });

      if (!variant) continue;

      const unitPrice = variant.price.toString();
      const subtotal = (Number(variant.price) * qty).toFixed(2);

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productVariantId: variantId,
          productName: variant.product.name,
          variantSku: variant.sku,
          edition: variant.edition,
          unitPrice,
          quantity: qty,
          subtotal,
          specSnapshot: variant.product.specs
            ? JSON.parse(JSON.stringify(variant.product.specs))
            : undefined,
        },
      });
    }

    // 5: Create Payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
        status: PaymentStatus.SUCCEEDED,
        amount: totalAmount,
        currency,
        paymentMethodType: session.payment_method_types?.[0] ?? "card",
      },
    });

    console.log(
      `[Stripe Webhook] Order ${order.orderNumber} created successfully`
    );
  });
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  console.log("[Stripe Webhook] payment_intent.payment_failed", paymentIntent.id);

  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: { status: PaymentStatus.FAILED },
  });
}

async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  console.log("[Stripe Webhook] charge.refunded", charge.id);

  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : (charge.payment_intent?.id ?? null);

  if (!paymentIntentId) {
    console.warn("[Stripe Webhook] No payment_intent on charge", charge.id);
    return;
  }

  // Find the payment record
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    select: { id: true, orderId: true },
  });

  if (!payment) {
    console.warn(
      "[Stripe Webhook] Payment not found for intent",
      paymentIntentId
    );
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.REFUNDED },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: OrderStatus.REFUNDED },
    }),
  ]);

  console.log(
    `[Stripe Webhook] Payment ${payment.id} and Order ${payment.orderId} marked REFUNDED`
  );
}

// ---- Route Handler ----------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Read raw body for Stripe signature verification
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe Webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        // Log and acknowledge unhandled events — never return 4xx
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, message);
    // Return 500 so Stripe retries
    return NextResponse.json(
      { error: `Webhook handler error: ${message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
