import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/prisma/lib/auth";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        reservations: {
          where: { status: { in: ["PENDING", "CONFIRMED"] } },
          orderBy: { date: "asc" },
        },
        orders: {
          where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] } },
        },
      },
    });
    if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });
    return NextResponse.json(table);
  } catch {
    return NextResponse.json({ error: "Failed to fetch table" }, { status: 500 });
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
    if (body.capacity !== undefined) data.capacity = parseInt(body.capacity);
    if (body.location !== undefined) data.location = body.location;
    if (body.number !== undefined) data.number = parseInt(body.number);

    const table = await prisma.table.update({ where: { id }, data });
    return NextResponse.json(table);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Table number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, context: Context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    await prisma.table.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 });
  }
}
