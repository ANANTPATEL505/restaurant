import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/prisma/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const available = searchParams.get("available");
    const featured = searchParams.get("featured");

    const where: any = {};
    if (category && category !== "All") where.category = category;
    if (available === "true") where.available = true;
    if (featured === "true") where.featured = true;

    const items = await prisma.menuItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.menuItem.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    return NextResponse.json({
      items,
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, description, price, category, image, available, featured, spicy, veg } = body;

    if (!name || !description || !price || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await prisma.menuItem.create({
      data: { name, description, price: parseFloat(price), category, image, available, featured, spicy, veg },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
