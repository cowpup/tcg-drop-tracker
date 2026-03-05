import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import ical, { ICalCalendarMethod } from "ical-generator";
import { Game, Retailer } from "@prisma/client/index.js";
import { RetailerLabels, GameLabels, DropTypeLabels } from "@/types";

// GET /api/calendar - Generate iCal feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get("game") as Game | null;
    const retailer = searchParams.get("retailer") as Retailer | null;
    const includeShows = searchParams.get("shows") !== "false";
    const includeDrops = searchParams.get("drops") !== "false";

    const calendar = ical({
      name: "TCG Drop Tracker",
      description:
        "Upcoming TCG product drops, restocks, and trade shows",
      timezone: "America/New_York",
      method: ICalCalendarMethod.PUBLISH,
      prodId: {
        company: "TCG Drop Tracker",
        product: "Calendar Feed",
      },
    });

    // Add drops to calendar
    if (includeDrops) {
      const dropWhere = {
        scheduledAt: { not: null },
        ...(game && { product: { game } }),
        ...(retailer && { retailer }),
      };

      const drops = await prisma.drop.findMany({
        where: dropWhere,
        include: { product: true },
        orderBy: { scheduledAt: "asc" },
        take: 100,
      });

      for (const drop of drops) {
        if (!drop.scheduledAt) continue;

        const gameName = GameLabels[drop.product.game] || drop.product.game;
        const retailerName = RetailerLabels[drop.retailer] || drop.retailer;
        const dropTypeName = DropTypeLabels[drop.dropType] || drop.dropType;

        calendar.createEvent({
          start: drop.scheduledAt,
          end: new Date(drop.scheduledAt.getTime() + 60 * 60 * 1000), // 1 hour duration
          summary: `[${gameName}] ${drop.product.name} - ${retailerName}`,
          description: [
            `Product: ${drop.product.name}`,
            `Game: ${gameName}`,
            `Retailer: ${retailerName}`,
            `Type: ${dropTypeName}`,
            drop.price ? `Price: $${drop.price.toFixed(2)}` : null,
            drop.url ? `Link: ${drop.url}` : null,
            drop.notes ? `Notes: ${drop.notes}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          url: drop.url || undefined,
          categories: [
            { name: gameName },
            { name: retailerName },
            { name: "Drop" },
          ],
        });
      }
    }

    // Add trade shows to calendar
    if (includeShows) {
      const shows = await prisma.tradeShow.findMany({
        where: {
          startDate: { gte: new Date() },
        },
        orderBy: { startDate: "asc" },
        take: 100,
      });

      for (const show of shows) {
        calendar.createEvent({
          start: show.startDate,
          end: show.endDate,
          allDay: true,
          summary: `[Trade Show] ${show.name}`,
          description: [
            `Event: ${show.name}`,
            show.organizer ? `Organizer: ${show.organizer}` : null,
            `Venue: ${show.venueName}`,
            `Address: ${show.address}, ${show.city}, ${show.state} ${show.zip || ""}`,
            show.description ? `\n${show.description}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          location: `${show.venueName}, ${show.address}, ${show.city}, ${show.state} ${show.zip || ""}`,
          url: show.website || undefined,
          categories: [{ name: "Trade Show" }, { name: show.showType }],
        });
      }
    }

    // Return iCal file
    const icsContent = calendar.toString();

    return new NextResponse(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="tcg-drops.ics"',
        "Cache-Control": "public, max-age=300", // 5 minute cache
      },
    });
  } catch (error) {
    console.error("Error generating calendar:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar" },
      { status: 500 }
    );
  }
}
