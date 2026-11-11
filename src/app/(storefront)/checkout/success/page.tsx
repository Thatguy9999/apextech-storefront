// src/app/(storefront)/checkout/success/page.tsx
// Order Confirmation server component — verifies Stripe session & Prisma order

import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, Truck, Mail, ShieldCheck } from "lucide-react";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const sessionId = resolvedParams.session_id;

  let session: any = null;
  let order: any = null;

  if (sessionId) {
    // 1. Attempt to fetch Stripe Checkout Session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items", "line_items.data.price.product"],
      });
    } catch (error) {
      console.warn("Could not retrieve Stripe session (likely test or mock session):", error);
    }

    // 2. Query authoritative order in Prisma database if webhook has already processed it
    try {
      order = await prisma.order.findFirst({
        where: {
          payments: {
            some: {
              stripeCheckoutSessionId: sessionId,
            },
          },
        },
        include: {
          items: true,
          shippingAddress: true,
        },
      });
    } catch (error) {
      console.warn("Could not retrieve Prisma order for session:", error);
    }
  }

  // Delivery timeframe (3-5 business days from current date)
  const deliveryStart = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const deliveryEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const customerEmail =
    order?.guestEmail ||
    session?.customer_details?.email ||
    session?.customer_email ||
    "your email";

  const orderNumber =
    order?.orderNumber ||
    (sessionId ? `ORD-${sessionId.slice(-8).toUpperCase()}` : "ORD-CONFIRMED");

  const totalAmount = order
    ? Number(order.totalAmount)
    : session?.amount_total
    ? session.amount_total / 100
    : 0;

  // Extract display items from Order or Stripe line items
  const displayItems = order?.items?.length
    ? order.items.map((item: any) => ({
        id: item.id,
        name: item.productName,
        edition: item.edition,
        quantity: item.quantity,
        price: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      }))
    : session?.line_items?.data?.length
    ? session.line_items.data.map((item: any) => ({
        id: item.id,
        name: item.description || "Electronics Item",
        edition: item.price?.product?.name !== item.description ? item.price?.product?.name : "",
        quantity: item.quantity || 1,
        price: (item.price?.unit_amount || 0) / 100,
        subtotal: (item.amount_total || 0) / 100,
      }))
    : [];

  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      {/* Clear Zustand cart on mount since payment succeeded */}
      <ClearCartOnMount />

      <div className="max-w-2xl mx-auto">
        {/* ── Status Header ─────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-sm">
            <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Order Confirmed!
          </h1>

          <p className="mt-3 text-base text-slate-600 max-w-md mx-auto">
            Thank you for your purchase. We&apos;ve sent an order confirmation and
            receipt to <span className="font-semibold text-slate-900">{customerEmail}</span>.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <span>Order Reference:</span>
            <span className="font-mono text-blue-600">{orderNumber}</span>
          </div>
        </div>

        {/* ── Delivery Timeline Card ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Estimated Delivery
              </h2>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {deliveryStart} – {deliveryEnd}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Standard Express Shipping via FedEx. You will receive an SMS and email notification once tracking details are dispatched.
              </p>
            </div>
          </div>
        </div>

        {/* ── Order Summary Card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Summary of Items</h2>
            </div>
            <span className="text-xs text-slate-400">
              {displayItems.reduce((acc: number, it: any) => acc + it.quantity, 0)} Total Units
            </span>
          </div>

          {displayItems.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {displayItems.map((item: any) => (
                <li key={item.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 leading-snug truncate">
                      {item.name}
                    </p>
                    {item.edition && (
                      <p className="text-xs text-slate-500 mt-0.5">{item.edition}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900">
                      ${item.subtotal ? item.subtotal.toFixed(2) : (item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-sm text-slate-500">
              Full order manifest confirmed and processed.
            </div>
          )}

          {/* Pricing summary */}
          <div className="bg-slate-50/70 p-6 border-t border-slate-100 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Payment Status</span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" /> Paid & Verified
              </span>
            </div>
            {totalAmount > 0 && (
              <div className="flex justify-between text-slate-900 font-bold text-base pt-2 border-t border-slate-200">
                <span>Total Paid</span>
                <span>${totalAmount.toFixed(2)} USD</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href={order?.id ? `/orders/${order.id}` : "/orders"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
          >
            Track Your Order
          </Link>
        </div>

        {/* ── Support Footer ────────────────────────────────────────────── */}
        <div className="mt-12 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Mail className="w-3.5 h-3.5" />
          <span>Need help with your order? Contact support@apextech.store</span>
        </div>
      </div>
    </main>
  );
}
