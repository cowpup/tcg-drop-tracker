import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Retailer, SignalType } from "@prisma/client/index.js";

// GET /api/signals - List signals with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const retailer = searchParams.get("retailer") as Retailer | null;
    const type = searchParams.get("type") as SignalType | null;
    const dropId = searchParams.get("dropId");
    const notified = searchParams.get("notified");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where = {
      ...(retailer && { retailer }),
      ...(type && { type }),
      ...(dropId && { dropId }),
      ...(notified !== null && { notified: notified === "true" }),
    };

    const [signals, total] = await Promise.all([
      prisma.signal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { detectedAt: "desc" },
        include: {
          drop: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.signal.count({ where }),
    ]);

    return NextResponse.json({
      data: signals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching signals:", error);
    return NextResponse.json(
      { error: "Failed to fetch signals" },
      { status: 500 }
    );
  }
}

// POST /api/signals - Create a new signal (typically called by scrapers)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dropId, retailer, type, url, metadata } = body;

    if (!retailer || !type || !url) {
      return NextResponse.json(
        { error: "Missing required fields: retailer, type, url" },
        { status: 400 }
      );
    }

    // Validate enums
    if (!Object.values(Retailer).includes(retailer)) {
      return NextResponse.json(
        { error: `Invalid retailer. Must be one of: ${Object.values(Retailer).join(", ")}` },
        { status: 400 }
      );
    }

    if (!Object.values(SignalType).includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${Object.values(SignalType).join(", ")}` },
        { status: 400 }
      );
    }

    const signal = await prisma.signal.create({
      data: {
        dropId,
        retailer,
        type,
        url,
        metadata: metadata || {},
      },
      include: {
        drop: {
          include: {
            product: true,
          },
        },
      },
    });

    // If this is a queue detection, update the associated drop status
    if (type === SignalType.QUEUE_DETECTED && dropId) {
      await prisma.drop.update({
        where: { id: dropId },
        data: { status: "QUEUE_ACTIVE" },
      });
    }

    return NextResponse.json({ data: signal }, { status: 201 });
  } catch (error) {
    console.error("Error creating signal:", error);
    return NextResponse.json(
      { error: "Failed to create signal" },
      { status: 500 }
    );
  }
}

// PATCH /api/signals - Mark signals as notified (batch update)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, notified } = body;

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: "Missing required field: ids (array)" },
        { status: 400 }
      );
    }

    const result = await prisma.signal.updateMany({
      where: { id: { in: ids } },
      data: { notified: notified ?? true },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error("Error updating signals:", error);
    return NextResponse.json(
      { error: "Failed to update signals" },
      { status: 500 }
    );
  }
}
