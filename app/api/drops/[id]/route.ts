import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Retailer, DropType, DropStatus } from "@prisma/client/index.js";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/drops/[id] - Get a single drop
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const drop = await prisma.drop.findUnique({
      where: { id },
      include: {
        product: true,
        signals: {
          orderBy: { detectedAt: "desc" },
        },
      },
    });

    if (!drop) {
      return NextResponse.json({ error: "Drop not found" }, { status: 404 });
    }

    return NextResponse.json({ data: drop });
  } catch (error) {
    console.error("Error fetching drop:", error);
    return NextResponse.json(
      { error: "Failed to fetch drop" },
      { status: 500 }
    );
  }
}

// PATCH /api/drops/[id] - Update a drop
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      retailer,
      dropType,
      scheduledAt,
      confirmedAt,
      status,
      price,
      url,
      notes,
    } = body;

    // Validate enums if provided
    if (retailer && !Object.values(Retailer).includes(retailer)) {
      return NextResponse.json(
        { error: `Invalid retailer. Must be one of: ${Object.values(Retailer).join(", ")}` },
        { status: 400 }
      );
    }

    if (dropType && !Object.values(DropType).includes(dropType)) {
      return NextResponse.json(
        { error: `Invalid dropType. Must be one of: ${Object.values(DropType).join(", ")}` },
        { status: 400 }
      );
    }

    if (status && !Object.values(DropStatus).includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${Object.values(DropStatus).join(", ")}` },
        { status: 400 }
      );
    }

    const drop = await prisma.drop.update({
      where: { id },
      data: {
        ...(retailer && { retailer }),
        ...(dropType && { dropType }),
        ...(scheduledAt !== undefined && {
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        }),
        ...(confirmedAt !== undefined && {
          confirmedAt: confirmedAt ? new Date(confirmedAt) : null,
        }),
        ...(status && { status }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(url !== undefined && { url }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ data: drop });
  } catch (error) {
    console.error("Error updating drop:", error);
    return NextResponse.json(
      { error: "Failed to update drop" },
      { status: 500 }
    );
  }
}

// DELETE /api/drops/[id] - Delete a drop
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.drop.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting drop:", error);
    return NextResponse.json(
      { error: "Failed to delete drop" },
      { status: 500 }
    );
  }
}
