import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/prisma/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const upcoming = searchParams.get("upcoming");
    const where: any = { active: true };
    if (upcoming === "true") where.date = { gte: new Date() };

    const events = await prisma.event.findMany({ where, orderBy: { date: "asc" } });
    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const event = await prisma.event.create({
      data: {
        ...body,
        date: new Date(body.date),
        price: body.price ? parseFloat(body.price) : null,
        maxSeats: body.maxSeats ? parseInt(body.maxSeats) : null,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
