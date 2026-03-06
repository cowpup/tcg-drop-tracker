import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  Game,
  Retailer,
  DropType,
  DropStatus,
} from "@prisma/client/index.js";

// GET /api/drops - List drops with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get("game") as Game | null;
    const retailer = searchParams.get("retailer") as Retailer | null;
    const dropType = searchParams.get("dropType") as DropType | null;
    const status = searchParams.get("status") as DropStatus | null;
    const productId = searchParams.get("productId");
    const upcoming = searchParams.get("upcoming") === "true";
    const past = searchParams.get("past") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
      ...(retailer && { retailer }),
      ...(dropType && { dropType }),
      ...(status && { status }),
      ...(productId && { productId }),
      ...(game && { product: { game } }),
      ...(upcoming && {
        scheduledAt: { gte: new Date() },
        status: { in: [DropStatus.UPCOMING, DropStatus.LIVE, DropStatus.QUEUE_ACTIVE] },
      }),
      ...(past && {
        OR: [
          { scheduledAt: { lt: new Date() } },
          { status: { in: [DropStatus.SOLD_OUT, DropStatus.CANCELLED] } },
        ],
      }),
    };

    const [drops, total] = await Promise.all([
      prisma.drop.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: "asc" },
        include: {
          product: true,
          signals: {
            where: { notified: false },
            orderBy: { detectedAt: "desc" },
            take: 5,
          },
        },
      }),
      prisma.drop.count({ where }),
    ]);

    return NextResponse.json({
      data: drops,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching drops:", error);
    return NextResponse.json(
      { error: "Failed to fetch drops" },
      { status: 500 }
    );
  }
}

// POST /api/drops - Create a new drop
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      retailer,
      dropType,
      scheduledAt,
      confirmedAt,
      status,
      price,
      url,
      notes,
    } = body;

    if (!productId || !retailer || !dropType) {
      return NextResponse.json(
        { error: "Missing required fields: productId, retailer, dropType" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Validate enums
    if (!Object.values(Retailer).includes(retailer)) {
      return NextResponse.json(
        { error: `Invalid retailer. Must be one of: ${Object.values(Retailer).join(", ")}` },
        { status: 400 }
      );
    }

    if (!Object.values(DropType).includes(dropType)) {
      return NextResponse.json(
        { error: `Invalid dropType. Must be one of: ${Object.values(DropType).join(", ")}` },
        { status: 400 }
      );
    }

    const drop = await prisma.drop.create({
      data: {
        productId,
        retailer,
        dropType,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        confirmedAt: confirmedAt ? new Date(confirmedAt) : null,
        status: status || DropStatus.UPCOMING,
        price: price ? parseFloat(price) : null,
        url,
        notes,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ data: drop }, { status: 201 });
  } catch (error) {
    console.error("Error creating drop:", error);
    return NextResponse.json(
      { error: "Failed to create drop" },
      { status: 500 }
    );
  }
}
