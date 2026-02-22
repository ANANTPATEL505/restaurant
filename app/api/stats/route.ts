import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));

    // Today's stats
    const todayOrders = await prisma.order.count({
      where: { createdAt: { gte: today } },
    });

    const todayReservations = await prisma.reservation.count({
      where: { createdAt: { gte: today } },
    });

    const pendingReservations = await prisma.reservation.count({
      where: { status: "PENDING" },
    });

    // Monthly revenue
    const monthlyOrders = await prisma.order.findMany({
      where: { createdAt: { gte: monthStart } },
      select: { total: true },
    });
    const monthRevenue = monthlyOrders.reduce((sum, o) => sum + o.total, 0);

    // Total orders (all time)
    const totalOrders = await prisma.order.count();

    // Menu items
    const totalMenuItems = await prisma.menuItem.count();

    // Reviews pending approval
    const pendingReviews = await prisma.review.count({ where: { approved: false } });

    // Total revenue
    const allOrders = await prisma.order.findMany({
      select: { total: true },
    });
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);

    // Order status breakdown
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    // Recent reservations
    const recentReservations = await prisma.reservation.findMany({
      take: 10,
      orderBy: { date: "desc" },
    });

    // Daily revenue (last 7 days)
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = await prisma.order.findMany({
        where: {
          createdAt: { gte: date, lt: nextDate },
        },
        select: { total: true },
      });

      const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
      const count = dayOrders.length;

      dailyRevenue.push({
        date: date.toLocaleDateString("en", { weekday: "short" }),
        revenue,
        orders: count,
      });
    }

    // Category breakdown (top menu items by orders)
    const categoryBreakdown = await prisma.orderItem.groupBy({
      by: ["menuItemId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const categoryData = await Promise.all(
      categoryBreakdown.map(async (cb) => {
        const item = await prisma.menuItem.findUnique({
          where: { id: cb.menuItemId },
          select: { name: true, category: true },
        });
        return {
          name: item?.name || "Unknown",
          value: cb._count.id,
          category: item?.category,
        };
      })
    );

    // Monthly revenue trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const monthOrders = await prisma.order.findMany({
        where: {
          createdAt: { gte: date, lt: nextMonth },
        },
        select: { total: true },
      });

      const revenue = monthOrders.reduce((sum, o) => sum + o.total, 0);

      monthlyTrend.push({
        month: date.toLocaleDateString("en", { month: "short" }),
        revenue,
      });
    }

    // Order type breakdown
    const orderTypeBreakdown = await prisma.order.groupBy({
      by: ["type"],
      _count: { type: true },
    });

    return NextResponse.json({
      stats: {
        todayOrders,
        todayReservations,
        pendingReservations,
        monthRevenue,
        totalOrders,
        totalMenuItems,
        pendingReviews,
        totalRevenue,
      },
      charts: {
        dailyRevenue,
        monthlyRevenue: monthlyTrend,
        ordersByStatus,
        ordersByType: orderTypeBreakdown,
        categoryBreakdown: categoryData,
      },
      recent: {
        orders: recentOrders,
        reservations: recentReservations,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
