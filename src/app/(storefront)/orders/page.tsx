"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Package,
  Calendar,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  XCircle,
  HelpCircle,
  ShoppingBag,
} from "lucide-react";

interface SerializedOrderItem {
  id: string;
  productName: string;
  edition: string;
  variantSku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl: string | null;
}

interface SerializedOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  itemCount: number;
  items: SerializedOrderItem[];
  payments: Array<{
    id: string;
    status: string;
    paymentMethodType: string | null;
    lastFour: string | null;
    amount: number;
    createdAt: string;
  }>;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PAID":
      return {
        label: "Paid",
        classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500",
      };
    case "PREPARING_SHIPMENT":
      return {
        label: "Preparing",
        classes: "bg-blue-50 text-blue-700 border-blue-200",
        dotColor: "bg-blue-500",
      };
    case "SHIPPED":
      return {
        label: "Shipped",
        classes: "bg-blue-50 text-blue-700 border-blue-200",
        dotColor: "bg-blue-600",
      };
    case "OUT_FOR_DELIVERY":
      return {
        label: "Out for Delivery",
        classes: "bg-indigo-50 text-indigo-700 border-indigo-200",
        dotColor: "bg-indigo-600",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        classes: "bg-emerald-100 text-emerald-800 border-emerald-300",
        dotColor: "bg-emerald-600",
      };
    case "PENDING":
    case "PAYMENT_PROCESSING":
      return {
        label: "Pending",
        classes: "bg-amber-50 text-amber-700 border-amber-200",
        dotColor: "bg-amber-500",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        classes: "bg-rose-50 text-rose-700 border-rose-200",
        dotColor: "bg-rose-500",
      };
    case "REFUNDED":
      return {
        label: "Refunded",
        classes: "bg-slate-100 text-slate-700 border-slate-300",
        dotColor: "bg-slate-500",
      };
    default:
      return {
        label: status,
        classes: "bg-slate-100 text-slate-700 border-slate-200",
        dotColor: "bg-slate-400",
      };
  }
}

function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount || 0);
}

export default function OrdersPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<SerializedOrder[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedEmail, setSearchedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to search for orders.");
        setOrders([]);
      } else {
        setOrders(data.orders || []);
        setSearchedEmail(cleanEmail);
        setHasSearched(true);
      }
    } catch (err) {
      console.error("Order lookup error:", err);
      setErrorMessage("Network error occurred while fetching orders.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-geist">
            Track & Manage Orders
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Enter the email address used during checkout to view real-time shipping
            status, line items, and invoice history.
          </p>
        </div>

        {/* Email Lookup Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-800"
            >
              Order Confirmation Email
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex-shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Finding Orders...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Find Orders
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 font-medium">
                {errorMessage}
              </p>
            )}

            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              ApexTech protects your privacy. Order links are secure and limited to confirmed buyer credentials.
            </p>
          </form>
        </div>

        {/* Results Area */}
        {hasSearched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Orders for <span className="text-slate-800">{searchedEmail}</span> ({orders.length})
              </h2>
            </div>

            {orders.length === 0 ? (
              /* Friendly Empty State */
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Package className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    No orders found
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    We couldn&apos;t find any orders associated with{" "}
                    <span className="font-medium text-slate-800">{searchedEmail}</span>.
                    Please double-check the spelling or try another email address.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Explore Catalog
                  </Link>
                </div>
              </div>
            ) : (
              /* Orders List */
              <div className="space-y-4">
                {orders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const orderDate = new Date(order.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  );

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-slate-300 transition-all duration-200 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-base font-bold text-slate-900 font-geist">
                              #{order.orderNumber}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.classes}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`}
                              />
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Placed on {orderDate}
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-baseline sm:items-end justify-between">
                          <span className="text-xs text-slate-500">Order Total</span>
                          <span className="text-lg font-extrabold text-slate-900 font-geist">
                            {formatCurrency(order.totalAmount, order.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Items ({order.itemCount})
                        </p>
                        <div className="space-y-1.5">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-xs text-slate-700 py-1"
                            >
                              <div className="flex items-center gap-2 truncate pr-4">
                                <span className="font-semibold text-slate-900">
                                  {item.quantity}×
                                </span>
                                <span className="truncate">{item.productName}</span>
                                {item.edition && (
                                  <span className="text-slate-400">
                                    ({item.edition})
                                  </span>
                                )}
                              </div>
                              <span className="font-medium flex-shrink-0 text-slate-900">
                                {formatCurrency(item.subtotal, order.currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer CTA */}
                      <div className="border-t border-slate-100 pt-4 flex justify-end">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          View Order Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
