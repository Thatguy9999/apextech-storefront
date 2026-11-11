import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Package,
  Truck,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

// ---- Helpers & Status Definitions --------------------------------------------

interface Step {
  id: string;
  label: string;
  icon: typeof CheckCircle2;
  stepIndex: number;
}

const STEP_DEFINITIONS: Step[] = [
  { id: "PLACED", label: "Placed", icon: Clock, stepIndex: 0 },
  { id: "PAID", label: "Paid", icon: CreditCard, stepIndex: 1 },
  { id: "PREPARING", label: "Preparing", icon: Package, stepIndex: 2 },
  { id: "SHIPPED", label: "Shipped", icon: Truck, stepIndex: 3 },
  { id: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck, stepIndex: 4 },
  { id: "DELIVERED", label: "Delivered", icon: CheckCircle2, stepIndex: 5 },
];

function getActiveStepIndex(status: OrderStatus): number {
  switch (status) {
    case OrderStatus.PENDING:
    case OrderStatus.PAYMENT_PROCESSING:
      return 0;
    case OrderStatus.PAID:
      return 1;
    case OrderStatus.PREPARING_SHIPMENT:
      return 2;
    case OrderStatus.SHIPPED:
      return 3;
    case OrderStatus.OUT_FOR_DELIVERY:
      return 4;
    case OrderStatus.DELIVERED:
      return 5;
    case OrderStatus.CANCELLED:
    case OrderStatus.REFUNDED:
    default:
      return -1;
  }
}

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case OrderStatus.PAID:
      return {
        label: "Paid",
        classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500",
      };
    case OrderStatus.PREPARING_SHIPMENT:
      return {
        label: "Preparing Shipment",
        classes: "bg-blue-50 text-blue-700 border-blue-200",
        dotColor: "bg-blue-500",
      };
    case OrderStatus.SHIPPED:
      return {
        label: "Shipped",
        classes: "bg-blue-50 text-blue-700 border-blue-200",
        dotColor: "bg-blue-600",
      };
    case OrderStatus.OUT_FOR_DELIVERY:
      return {
        label: "Out for Delivery",
        classes: "bg-indigo-50 text-indigo-700 border-indigo-200",
        dotColor: "bg-indigo-600",
      };
    case OrderStatus.DELIVERED:
      return {
        label: "Delivered",
        classes: "bg-emerald-100 text-emerald-800 border-emerald-300",
        dotColor: "bg-emerald-600",
      };
    case OrderStatus.PENDING:
    case OrderStatus.PAYMENT_PROCESSING:
      return {
        label: "Pending Payment",
        classes: "bg-amber-50 text-amber-700 border-amber-200",
        dotColor: "bg-amber-500",
      };
    case OrderStatus.CANCELLED:
      return {
        label: "Cancelled",
        classes: "bg-rose-50 text-rose-700 border-rose-200",
        dotColor: "bg-rose-500",
      };
    case OrderStatus.REFUNDED:
      return {
        label: "Refunded",
        classes: "bg-slate-100 text-slate-700 border-slate-300",
        dotColor: "bg-slate-500",
      };
  }
}

function formatCurrency(amount: number | string, currency = "USD"): string {
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(numeric || 0);
}

function parseAddress(
  shippingAddress: unknown,
  shippingSnapshot: unknown
): {
  recipientName: string;
  streetAddress1: string;
  streetAddress2?: string | null;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
  phone?: string | null;
} | null {
  if (shippingAddress && typeof shippingAddress === "object") {
    const a = shippingAddress as Record<string, unknown>;
    return {
      recipientName: (a.recipientName as string) || "Recipient",
      streetAddress1: (a.streetAddress1 as string) || "",
      streetAddress2: (a.streetAddress2 as string) || null,
      city: (a.city as string) || "",
      stateOrProvince: (a.stateOrProvince as string) || "",
      postalCode: (a.postalCode as string) || "",
      country: (a.country as string) || "US",
      phone: (a.phone as string) || null,
    };
  }

  if (shippingSnapshot && typeof shippingSnapshot === "object") {
    const s = shippingSnapshot as Record<string, unknown>;
    const addr = (s.address as Record<string, unknown>) || {};
    return {
      recipientName: (s.name as string) || "Recipient",
      streetAddress1: (addr.line1 as string) || (s.streetAddress1 as string) || "",
      streetAddress2: (addr.line2 as string) || (s.streetAddress2 as string) || null,
      city: (addr.city as string) || (s.city as string) || "",
      stateOrProvince: (addr.state as string) || (s.stateOrProvince as string) || "",
      postalCode: (addr.postal_code as string) || (s.postalCode as string) || "",
      country: (addr.country as string) || (s.country as string) || "US",
      phone: (s.phone as string) || null,
    };
  }

  return null;
}

// ---- Order Detail Server Component ------------------------------------------

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Resilient lookup: check both id and orderNumber
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { sortOrder: "asc" },
                  },
                },
              },
            },
          },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      shippingAddress: true,
    },
  });

  if (!order) {
    notFound();
  }

  const badge = getStatusBadge(order.status);
  const activeStep = getActiveStepIndex(order.status);
  const isTerminalNegative =
    order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED;

  const address = parseAddress(order.shippingAddress, order.shippingSnapshot);
  const latestPayment = order.payments[0];

  // Calculate pricing breakdown
  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0
  );
  const shippingCost = Number(order.shippingCost);
  const taxAmount = Number(order.taxAmount);
  const totalAmount = Number(order.totalAmount);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb / Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <div className="text-xs text-slate-500 font-mono">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Order Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Order Confirmation
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-geist">
                Order #{order.orderNumber}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.classes}`}
              >
                <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                {badge.label}
              </span>
            </div>
          </div>

          {/* Stepper / Tracking Progress */}
          <div className="pt-8 pb-4">
            {isTerminalNegative ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                {order.status === OrderStatus.CANCELLED ? (
                  <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                ) : (
                  <RotateCcw className="w-5 h-5 text-slate-500 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Order {badge.label}
                  </p>
                  <p className="text-xs text-slate-600">
                    {order.status === OrderStatus.CANCELLED
                      ? "This order was cancelled and is no longer being processed."
                      : "The payment for this order has been refunded back to the original method."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="relative">
                  {/* Background Progress Bar */}
                  <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 hidden md:block" />
                  {/* Filled Progress Bar */}
                  <div
                    className="absolute top-5 left-0 h-1 bg-blue-600 transition-all duration-500 hidden md:block"
                    style={{
                      width: `${(Math.max(activeStep, 0) / (STEP_DEFINITIONS.length - 1)) * 100}%`,
                    }}
                  />

                  {/* Horizontal Steps Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 relative z-10">
                    {STEP_DEFINITIONS.map((step) => {
                      const StepIcon = step.icon;
                      const isCompleted = step.stepIndex < activeStep;
                      const isCurrent = step.stepIndex === activeStep;

                      return (
                        <div
                          key={step.id}
                          className="flex flex-col items-center text-center group"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                              isCurrent
                                ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-105"
                                : isCompleted
                                ? "bg-emerald-600 text-white"
                                : "bg-white border-2 border-slate-200 text-slate-400"
                            }`}
                          >
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <span
                            className={`mt-2 text-xs font-semibold ${
                              isCurrent
                                ? "text-blue-600 font-bold"
                                : isCompleted
                                ? "text-slate-900"
                                : "text-slate-400"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Columns: Order Items (Left 2 cols) & Order Summary / Shipping (Right 1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-500" />
                  Order Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)})
                </h2>
                <span className="text-xs text-slate-500">
                  Currency: {order.currency}
                </span>
              </div>

              {/* Items Table */}
              <div className="divide-y divide-slate-100">
                {order.items.map((item) => {
                  const primaryImage =
                    item.variant?.product?.images?.[0]?.url ||
                    "/placeholder-product.png";

                  return (
                    <div
                      key={item.id}
                      className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {primaryImage.startsWith("http") || primaryImage.startsWith("/") ? (
                            <Image
                              src={primaryImage}
                              alt={item.productName}
                              fill
                              className="object-cover object-center"
                              sizes="80px"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-slate-400" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                            {item.productName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            {item.edition && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                                {item.edition}
                              </span>
                            )}
                            <span>SKU: {item.variantSku}</span>
                          </div>
                          <p className="text-xs text-slate-500 sm:hidden">
                            Qty: {item.quantity} × {formatCurrency(item.unitPrice, order.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto text-right">
                        <span className="text-sm font-bold text-slate-900 font-geist">
                          {formatCurrency(item.subtotal, order.currency)}
                        </span>
                        <span className="hidden sm:inline-block text-xs text-slate-500">
                          Qty: {item.quantity} × {formatCurrency(item.unitPrice, order.currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking Info Card (if shipped) */}
            {order.trackingNumber && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Tracking Details
                    </h3>
                    <p className="text-xs text-slate-600">
                      Carrier:{" "}
                      <span className="font-semibold text-slate-800">
                        {order.shippingCarrier || "Standard Freight"}
                      </span>
                    </p>
                    <p className="text-xs font-mono bg-slate-100 px-2 py-1 rounded inline-block text-slate-800">
                      Tracking #: {order.trackingNumber}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary & Shipping Address */}
          <div className="space-y-6">
            {/* Cost Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(subtotal, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium text-slate-900">
                    {shippingCost === 0 ? "Free" : formatCurrency(shippingCost, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(taxAmount, order.currency)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900">Grand Total</span>
                  <span className="text-xl font-extrabold text-blue-600 font-geist">
                    {formatCurrency(totalAmount, order.currency)}
                  </span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Payment Method
                </p>
                {latestPayment ? (
                  <div className="flex items-center gap-2.5 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    <CreditCard className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="capitalize font-medium">
                      {latestPayment.paymentMethodType || "Card"}
                    </span>
                    {latestPayment.lastFour && (
                      <span className="font-mono text-xs text-slate-500 ml-auto">
                        •••• {latestPayment.lastFour}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Standard Card Processing</p>
                )}
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                Shipping Address
              </h2>

              {address ? (
                <div className="text-sm text-slate-600 leading-relaxed space-y-1">
                  <p className="font-semibold text-slate-900">{address.recipientName}</p>
                  <p>{address.streetAddress1}</p>
                  {address.streetAddress2 && <p>{address.streetAddress2}</p>}
                  <p>
                    {address.city}, {address.stateOrProvince} {address.postalCode}
                  </p>
                  <p className="text-xs text-slate-500 font-medium uppercase">
                    {address.country}
                  </p>
                  {address.phone && (
                    <p className="text-xs text-slate-500 pt-1">Tel: {address.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  Digital fulfillment or address snapshot recorded at checkout.
                </p>
              )}
            </div>

            {/* Trust Banner */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>
                ApexTech Guaranteed Delivery & 30-Day Complete Hardware Protection included.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
