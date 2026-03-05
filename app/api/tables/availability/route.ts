import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const guests = parseInt(searchParams.get("guests") || "1");

    if (!dateParam) {
      return NextResponse.json({ error: "date param required" }, { status: 400 });
    }

    const targetDate = new Date(dateParam);

    // Check ±2 hour window for conflicts
    const windowStart = new Date(targetDate.getTime() - 2 * 60 * 60 * 1000);
    const windowEnd = new Date(targetDate.getTime() + 2 * 60 * 60 * 1000);

    // Get all active reservations in that window
    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        date: { gte: windowStart, lte: windowEnd },
        tableId: { not: null },
      },
      select: { tableId: true },
    });

    // Get all active orders assigned to a table
    const activeOrders = await prisma.order.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] },
        tableId: { not: null },
      },
      select: { tableId: true },
    });

    const reservedTableIds = new Set([
      ...conflictingReservations.map((r) => r.tableId),
      ...activeOrders.map((o) => o.tableId),
    ]);

    // Fetch all non-maintenance tables with sufficient capacity
    const allTables = await prisma.table.findMany({
      where: {
        status: { not: "MAINTENANCE" },
        capacity: { gte: guests },
      },
      orderBy: [{ location: "asc" }, { number: "asc" }],
    });

    // Annotate availability
    const tables = allTables.map((table) => ({
      ...table,
      isAvailable: !reservedTableIds.has(table.id),
    }));

    const available = tables.filter((t) => t.isAvailable).length;
    const total = tables.length;

    return NextResponse.json({ tables, available, total, date: targetDate });
  } catch (error) {
    console.error("availability error:", error);
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 });
  }
}
