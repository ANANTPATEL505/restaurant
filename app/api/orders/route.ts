import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/prisma/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { menuItem: true } },
        table: { select: { id: true, number: true, capacity: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, phone, email, type, items, notes, tableId } = body;

    if (!customerName || !phone || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch current prices
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i: any) => i.menuItemId) } },
    });

    const subtotal = items.reduce((sum: number, item: any) => {
      const mi = menuItems.find((m) => m.id === item.menuItemId);
      return sum + (mi?.price ?? 0) * item.qty;
    }, 0);

    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    // Resolve tableNo
    let tableNo: number | undefined;
    if (tableId) {
      const t = await prisma.table.findUnique({ where: { id: tableId }, select: { number: true } });
      tableNo = t?.number;
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        phone,
        email,
        type: type || "DINE_IN",
        notes,
        tableId: tableId || null,
        tableNo: tableNo ?? null,
        subtotal,
        tax,
        total,
        status: "PENDING",
        items: {
          create: items.map((item: any) => {
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
      include: { items: true, table: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
