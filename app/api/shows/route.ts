import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ShowType, ShowTier } from "@prisma/client/index.js";

// GET /api/shows - List trade shows with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const showType = searchParams.get("showType") as ShowType | null;
    const tier = searchParams.get("tier") as ShowTier | null;
    const featured = searchParams.get("featured");
    const upcoming = searchParams.get("upcoming") === "true";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where = {
      ...(state && { state }),
      ...(showType && { showType }),
      ...(tier && { tier }),
      ...(featured !== null && { featured: featured === "true" }),
      ...(upcoming && { startDate: { gte: new Date() } }),
      ...(startDate && { startDate: { gte: new Date(startDate) } }),
      ...(endDate && { endDate: { lte: new Date(endDate) } }),
    };

    const [shows, total] = await Promise.all([
      prisma.tradeShow.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: "asc" },
      }),
      prisma.tradeShow.count({ where }),
    ]);

    return NextResponse.json({
      data: shows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching trade shows:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade shows" },
      { status: 500 }
    );
  }
}

// POST /api/shows - Create a new trade show
export async function POST(request: NextRequest) {
  try {
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

    if (
      !name ||
      !showType ||
      !tier ||
      !startDate ||
      !endDate ||
      !venueName ||
      !address ||
      !city ||
      !state
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, showType, tier, startDate, endDate, venueName, address, city, state",
        },
        { status: 400 }
      );
    }

    // Validate enums
    if (!Object.values(ShowType).includes(showType)) {
      return NextResponse.json(
        { error: `Invalid showType. Must be one of: ${Object.values(ShowType).join(", ")}` },
        { status: 400 }
      );
    }

    if (!Object.values(ShowTier).includes(tier)) {
      return NextResponse.json(
        { error: `Invalid tier. Must be one of: ${Object.values(ShowTier).join(", ")}` },
        { status: 400 }
      );
    }

    const show = await prisma.tradeShow.create({
      data: {
        name,
        organizer,
        showType,
        tier,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        venueName,
        address,
        city,
        state,
        zip,
        country: country || "US",
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        website,
        ticketUrl,
        description,
        featured: featured ?? false,
      },
    });

    return NextResponse.json({ data: show }, { status: 201 });
  } catch (error) {
    console.error("Error creating trade show:", error);
    return NextResponse.json(
      { error: "Failed to create trade show" },
      { status: 500 }
    );
  }
}
