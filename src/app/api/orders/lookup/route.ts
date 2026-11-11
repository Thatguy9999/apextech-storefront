import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const lookupSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body", orders: [] },
        { status: 400 }
      );
    }

    const parseResult = lookupSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Invalid email", orders: [] },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;
    const normalizedEmail = email.toLowerCase();

    // Query orders linked to registered user email or guest checkout email
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { user: { email: { equals: normalizedEmail, mode: "insensitive" } } },
          { guestEmail: { equals: normalizedEmail, mode: "insensitive" } },
        ],
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
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            status: true,
            paymentMethodType: true,
            lastFour: true,
            amount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Serialize orders (converting Decimals and Dates to JSON primitives)
    const serializedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        edition: item.edition,
        variantSku: item.variantSku,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
        imageUrl: item.variant?.product?.images?.[0]?.url ?? null,
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        status: payment.status,
        paymentMethodType: payment.paymentMethodType,
        lastFour: payment.lastFour,
        amount: Number(payment.amount),
        createdAt: payment.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ orders: serializedOrders }, { status: 200 });
  } catch (error) {
    console.error("[Orders Lookup Error]:", error);
    // Never leak internal server or database errors; return empty list
    return NextResponse.json({ orders: [] }, { status: 200 });
  }
}
