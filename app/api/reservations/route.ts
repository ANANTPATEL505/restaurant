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
    const date = searchParams.get("date");

    const where: any = {};
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      where.date = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { date: "asc" },
      include: { table: { select: { id: true, number: true, capacity: true, location: true } } },
    });

    return NextResponse.json(reservations);
  } catch {
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, date, guests, message, tableId } = body;

    if (!name || !phone || !date || !guests) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate table still available if one was chosen
    if (tableId) {
      const windowStart = new Date(new Date(date).getTime() - 2 * 60 * 60 * 1000);
      const windowEnd = new Date(new Date(date).getTime() + 2 * 60 * 60 * 1000);
      const conflict = await prisma.reservation.findFirst({
        where: {
          tableId,
          status: { in: ["PENDING", "CONFIRMED"] },
          date: { gte: windowStart, lte: windowEnd },
        },
      });
      if (conflict) {
        return NextResponse.json({ error: "This table was just taken. Please select another." }, { status: 409 });
      }
    }

    // Resolve tableNo from tableId
    let tableNo: number | undefined;
    if (tableId) {
      const t = await prisma.table.findUnique({ where: { id: tableId }, select: { number: true } });
      tableNo = t?.number;
    }

    const reservation = await prisma.reservation.create({
      data: {
        name,
        phone,
        email,
        date: new Date(date),
        guests: parseInt(guests),
        message,
        status: "PENDING",
        tableId: tableId || null,
        tableNo: tableNo ?? null,
      },
      include: { table: true },
    });

    // WhatsApp notification
    if (process.env.WHATSAPP_API_URL) {
      await fetch(process.env.WHATSAPP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: process.env.WHATSAPP_PHONE,
          message: `New Reservation!\nName: ${name}\nPhone: ${phone}\nDate: ${new Date(date).toLocaleString()}\nGuests: ${guests}\nTable: ${tableNo ? `#${tableNo}` : "Any"}\nNote: ${message || "None"}`,
        }),
      }).catch(console.error);
    }

    return NextResponse.json(reservation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}
