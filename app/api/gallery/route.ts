import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/prisma/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const where: any = {};
    if (category && category !== "All") where.category = category;

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(images);
  } catch {
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const image = await prisma.galleryImage.create({ data: body });
    return NextResponse.json(image, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}
