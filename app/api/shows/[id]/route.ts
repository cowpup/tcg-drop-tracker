import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

// GET /api/shows/[id] - Get a single show
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const show = await prisma.tradeShow.findUnique({
      where: { id },
    });

    if (!show) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }

    return NextResponse.json({ data: show });
  } catch (error) {
    console.error("Error fetching show:", error);
    return NextResponse.json(
      { error: "Failed to fetch show" },
      { status: 500 }
    );
  }
}

// PATCH /api/shows/[id] - Update a show (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if show exists
    const existing = await prisma.tradeShow.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.organizer !== undefined) updateData.organizer = body.organizer || null;
    if (body.showType !== undefined) updateData.showType = body.showType;
    if (body.tier !== undefined) updateData.tier = body.tier;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
    if (body.venueName !== undefined) updateData.venueName = body.venueName;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.zip !== undefined) updateData.zip = body.zip || null;
    if (body.website !== undefined) updateData.website = body.website || null;
    if (body.ticketUrl !== undefined) updateData.ticketUrl = body.ticketUrl || null;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.verified !== undefined) updateData.verified = body.verified;
    if (body.lat !== undefined) updateData.lat = body.lat;
    if (body.lng !== undefined) updateData.lng = body.lng;

    // If address changed, clear geocode so it can be re-geocoded
    if (body.address !== undefined || body.city !== undefined || body.state !== undefined) {
      updateData.lat = null;
      updateData.lng = null;
    }

    const show = await prisma.tradeShow.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: show });
  } catch (error) {
    console.error("Error updating show:", error);
    return NextResponse.json(
      { error: "Failed to update show" },
      { status: 500 }
    );
  }
}

// DELETE /api/shows/[id] - Delete a show (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    // Check if show exists
    const existing = await prisma.tradeShow.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }

    await prisma.tradeShow.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting show:", error);
    return NextResponse.json(
      { error: "Failed to delete show" },
      { status: 500 }
    );
  }
}
