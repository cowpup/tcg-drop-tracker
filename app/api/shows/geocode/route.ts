import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geocodeAddress } from "@/lib/geocoding";

// POST /api/shows/geocode - Geocode shows without coordinates
export async function POST(request: NextRequest) {
  try {
    // Optional: Add admin auth check here
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Find shows without lat/lng
    const showsToGeocode = await prisma.tradeShow.findMany({
      where: {
        OR: [{ lat: null }, { lng: null }],
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    if (showsToGeocode.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All shows already geocoded",
        processed: 0,
      });
    }

    let geocoded = 0;
    let failed = 0;

    for (const show of showsToGeocode) {
      const result = await geocodeAddress(
        show.address,
        show.city,
        show.state,
        show.zip || undefined,
        show.country
      );

      if (result) {
        await prisma.tradeShow.update({
          where: { id: show.id },
          data: {
            lat: result.lat,
            lng: result.lng,
          },
        });
        geocoded++;
      } else {
        failed++;
      }

      // Rate limiting
      await new Promise((r) => setTimeout(r, 100));
    }

    return NextResponse.json({
      success: true,
      processed: showsToGeocode.length,
      geocoded,
      failed,
    });
  } catch (error) {
    console.error("Geocoding batch failed:", error);
    return NextResponse.json(
      { error: "Geocoding failed", details: String(error) },
      { status: 500 }
    );
  }
}
