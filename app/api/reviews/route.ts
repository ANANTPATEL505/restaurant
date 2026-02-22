import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/prisma/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all"); // admin only
    const session = await getServerSession(authOptions);

    const where: any = {};
    if (!all || !session) where.approved = true;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, rating, comment } = body;
    if (!name || !rating || !comment) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const review = await prisma.review.create({
      data: { name, rating: parseInt(rating), comment, approved: false },
    });
    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
