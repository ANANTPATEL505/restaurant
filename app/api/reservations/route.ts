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
    });

    return NextResponse.json(reservations);
  } catch {
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, date, guests, message } = body;

    if (!name || !phone || !date || !guests) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
      },
    });

    // WhatsApp notification
    if (process.env.WHATSAPP_API_URL) {
      await fetch(process.env.WHATSAPP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: process.env.WHATSAPP_PHONE,
          message: `New Reservation!\nName: ${name}\nPhone: ${phone}\nDate: ${new Date(date).toLocaleString()}\nGuests: ${guests}\nNote: ${message || "None"}`,
        }),
      }).catch(console.error);
    }

    return NextResponse.json(reservation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}
