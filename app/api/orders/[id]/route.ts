import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/prisma/lib/auth";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { menuItem: true } }, table: true },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: Context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const body = await req.json();

    const data: any = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.tableId !== undefined) {
      data.tableId = body.tableId || null;
      if (body.tableId) {
        const t = await prisma.table.findUnique({ where: { id: body.tableId }, select: { number: true } });
        data.tableNo = t?.number ?? null;
      } else {
        data.tableNo = null;
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data,
      include: { items: true, table: true },
    });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
