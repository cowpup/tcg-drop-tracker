import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Retailer } from "@prisma/client/index.js";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

// GET /api/monitors - List all retailer monitors
export async function GET() {
  try {
    const monitors = await prisma.retailerMonitor.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(monitors);
  } catch (error) {
    console.error("Error fetching monitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch monitors" },
      { status: 500 }
    );
  }
}

// POST /api/monitors - Create a new retailer monitor
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, retailer, productId } = body;

    if (!url || !retailer) {
      return NextResponse.json(
        { error: "URL and retailer are required" },
        { status: 400 }
      );
    }

    // Validate retailer enum
    if (!Object.values(Retailer).includes(retailer)) {
      return NextResponse.json(
        { error: "Invalid retailer" },
        { status: 400 }
      );
    }

    const monitor = await prisma.retailerMonitor.create({
      data: {
        url,
        retailer,
        productId: productId || null,
      },
      include: { product: true },
    });

    return NextResponse.json(monitor, { status: 201 });
  } catch (error) {
    console.error("Error creating monitor:", error);
    return NextResponse.json(
      { error: "Failed to create monitor" },
      { status: 500 }
    );
  }
}
