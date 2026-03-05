import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/prisma/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const tables = await prisma.table.findMany({
      where,
      orderBy: { number: "asc" },
      include: {
        reservations: {
          where: {
            status: { in: ["PENDING", "CONFIRMED"] },
            date: { gte: new Date() },
          },
          orderBy: { date: "asc" },
          take: 1,
          select: { id: true, date: true, guests: true, name: true, status: true },
        },
        orders: {
          where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] } },
          take: 1,
          select: { id: true, orderNo: true, status: true, customerName: true },
        },
      },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error("GET /api/tables error:", error);
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { number, capacity, location } = body;

    if (!number || !capacity) {
      return NextResponse.json({ error: "Table number and capacity required" }, { status: 400 });
    }

    const table = await prisma.table.create({
      data: {
        number: parseInt(number),
        capacity: parseInt(capacity),
        location: location || "Indoor",
        status: "AVAILABLE",
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Table number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}
