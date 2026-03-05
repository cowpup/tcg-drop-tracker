import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ShowType, ShowTier } from "@prisma/client/index.js";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/shows/[id] - Get a single trade show
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const show = await prisma.tradeShow.findUnique({
      where: { id },
    });

    if (!show) {
      return NextResponse.json(
        { error: "Trade show not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: show });
  } catch (error) {
    console.error("Error fetching trade show:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade show" },
      { status: 500 }
    );
  }
}

// PATCH /api/shows/[id] - Update a trade show
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      organizer,
      showType,
      tier,
      startDate,
      endDate,
      venueName,
      address,
      city,
      state,
      zip,
      country,
      lat,
      lng,
      website,
      ticketUrl,
      description,
      featured,
    } = body;

    // Validate enums if provided
    if (showType && !Object.values(ShowType).includes(showType)) {
      return NextResponse.json(
        { error: `Invalid showType. Must be one of: ${Object.values(ShowType).join(", ")}` },
        { status: 400 }
      );
    }

    if (tier && !Object.values(ShowTier).includes(tier)) {
      return NextResponse.json(
        { error: `Invalid tier. Must be one of: ${Object.values(ShowTier).join(", ")}` },
        { status: 400 }
      );
    }

    const show = await prisma.tradeShow.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(organizer !== undefined && { organizer }),
        ...(showType && { showType }),
        ...(tier && { tier }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(venueName && { venueName }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zip !== undefined && { zip }),
        ...(country && { country }),
        ...(lat !== undefined && { lat: lat ? parseFloat(lat) : null }),
        ...(lng !== undefined && { lng: lng ? parseFloat(lng) : null }),
        ...(website !== undefined && { website }),
        ...(ticketUrl !== undefined && { ticketUrl }),
        ...(description !== undefined && { description }),
        ...(featured !== undefined && { featured }),
      },
    });

    return NextResponse.json({ data: show });
  } catch (error) {
    console.error("Error updating trade show:", error);
    return NextResponse.json(
      { error: "Failed to update trade show" },
      { status: 500 }
    );
  }
}

// DELETE /api/shows/[id] - Delete a trade show
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.tradeShow.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trade show:", error);
    return NextResponse.json(
      { error: "Failed to delete trade show" },
      { status: 500 }
    );
  }
}
