import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/prisma/lib/auth";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"] as const;
const ORDER_TYPES = ["DINE_IN", "TAKEAWAY", "DELIVERY"] as const;
const PAYMENT_METHODS = ["CARD", "UPI", "CASH"] as const;

type DeliveryAddressInput = {
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status")?.toUpperCase();
    const type = searchParams.get("type")?.toUpperCase();

    const where: any = {};

    if (status) {
      if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
        return NextResponse.json({ error: `Invalid status filter: ${status}` }, { status: 400 });
      }
      where.status = status;
    }

    if (type) {
      if (!ORDER_TYPES.includes(type as (typeof ORDER_TYPES)[number])) {
        return NextResponse.json({ error: `Invalid type filter: ${type}` }, { status: 400 });
      }
      where.type = type;
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : null;
    const notes = typeof body.notes === "string" ? body.notes.trim() : null;
    const type = typeof body.type === "string" ? body.type.toUpperCase() : "DINE_IN";
    const paymentMethod = typeof body.payment?.method === "string"
      ? body.payment.method.toUpperCase()
      : typeof body.paymentMethod === "string"
        ? body.paymentMethod.toUpperCase()
        : "CARD";

    const items = Array.isArray(body.items) ? body.items : [];

    if (!customerName || !phone || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!ORDER_TYPES.includes(type as (typeof ORDER_TYPES)[number])) {
      return NextResponse.json({ error: `Invalid order type: ${type}` }, { status: 400 });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod as (typeof PAYMENT_METHODS)[number])) {
      return NextResponse.json({ error: `Invalid payment method: ${paymentMethod}` }, { status: 400 });
    }
    const normalizedType = type as (typeof ORDER_TYPES)[number];
    const normalizedPaymentMethod = paymentMethod as (typeof PAYMENT_METHODS)[number];

    let deliveryAddress: DeliveryAddressInput | null = null;
    if (normalizedType === "DELIVERY") {
      const addressPayload = body.deliveryAddress;
      if (!addressPayload || typeof addressPayload !== "object") {
        return NextResponse.json({ error: "Delivery address is required for delivery orders" }, { status: 400 });
      }

      const line1 = typeof addressPayload.line1 === "string" ? addressPayload.line1.trim() : "";
      const line2 = typeof addressPayload.line2 === "string" ? addressPayload.line2.trim() : "";
      const landmark = typeof addressPayload.landmark === "string" ? addressPayload.landmark.trim() : "";
      const city = typeof addressPayload.city === "string" ? addressPayload.city.trim() : "";
      const state = typeof addressPayload.state === "string" ? addressPayload.state.trim() : "";
      const pincode = typeof addressPayload.pincode === "string" ? addressPayload.pincode.trim() : "";

      if (!line1 || !city || !state || !pincode) {
        return NextResponse.json(
          { error: "Address line 1, city, state and pincode are required for delivery orders" },
          { status: 400 }
        );
      }

      deliveryAddress = {
        line1,
        line2: line2 || null,
        landmark: landmark || null,
        city,
        state,
        pincode,
      };
    }

    const cleanItems = items
      .map((item: { menuItemId?: unknown; qty?: unknown }) => ({
        menuItemId: typeof item.menuItemId === "string" ? item.menuItemId : "",
        qty: typeof item.qty === "number" ? item.qty : Number.parseInt(String(item.qty), 10),
      }))
      .filter((item: { menuItemId: string; qty: number }) => item.menuItemId && Number.isInteger(item.qty) && item.qty > 0);

    if (cleanItems.length !== items.length) {
      return NextResponse.json({ error: "Invalid order items payload" }, { status: 400 });
    }

    const tableNoRaw = body.tableNo;
    let parsedTableNo: number | null = null;
    if (tableNoRaw !== null && tableNoRaw !== undefined && String(tableNoRaw).trim() !== "") {
      const parsed = typeof tableNoRaw === "number" ? tableNoRaw : Number.parseInt(String(tableNoRaw), 10);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return NextResponse.json({ error: "Invalid table number" }, { status: 400 });
      }
      parsedTableNo = parsed;
    }

    let paymentRef: string | null = null;
    if (paymentMethod === "UPI") {
      const upiId = typeof body.payment?.upiId === "string"
        ? body.payment.upiId.trim()
        : typeof body.paymentRef === "string"
          ? body.paymentRef.trim()
          : "";

      if (!upiId || !upiId.includes("@")) {
        return NextResponse.json({ error: "Valid UPI ID is required for UPI payments" }, { status: 400 });
      }
      paymentRef = upiId;
    }

    // Fetch current prices
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: cleanItems.map((item: { menuItemId: string }) => item.menuItemId) } },
    });

    if (menuItems.length !== cleanItems.length) {
      return NextResponse.json({ error: "One or more selected menu items are invalid" }, { status: 400 });
    }

    const subtotal = cleanItems.reduce((sum: number, item: { menuItemId: string; qty: number }) => {
      const mi = menuItems.find((m) => m.id === item.menuItemId);
      return sum + (mi?.price ?? 0) * item.qty;
    }, 0);

    const tax = subtotal * 0.05; // 5% GST
    const total = subtotal + tax;

    const order = await prisma.order.create({
      data: {
        customerName,
        phone,
        email,
        type: normalizedType,
        paymentMethod: normalizedPaymentMethod,
        paymentRef,
        notes,
        tableNo: normalizedType === "DINE_IN" ? parsedTableNo : null,
        deliveryAddress: deliveryAddress ?? undefined,
        subtotal,
        tax,
        total,
        status: "PENDING",
        items: {
          create: cleanItems.map((item: { menuItemId: string; qty: number }) => {
            const mi = menuItems.find((m) => m.id === item.menuItemId)!;
            return {
              menuItemId: item.menuItemId,
              qty: item.qty,
              price: mi.price,
              name: mi.name,
            };
          }),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
