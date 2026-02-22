import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Count orders in database
    const orderCount = await prisma.order.count();
    
    // Get a sample order
    const sampleOrder = await prisma.order.findFirst({
      include: { items: true },
    });
    
    // Get order status enum info
    const orderStatusInfo = {
      validStatuses: ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"],
      sample: {
        id: sampleOrder?.id,
        status: sampleOrder?.status,
        customerName: sampleOrder?.customerName,
      }
    };
    
    return NextResponse.json({
      success: true,
      database: {
        orderCount,
        hasOrders: orderCount > 0,
      },
      statusEnum: orderStatusInfo,
      prismaVersion: process.version,
    });
  } catch (error) {
    console.error("Diagnostics error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
