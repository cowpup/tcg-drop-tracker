import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { extractNameFromUrl } from "@/lib/scrapers/discovery";
import { Retailer } from "@prisma/client/index.js";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

// Known Amazon ASINs and their product names
const AMAZON_PRODUCT_NAMES: Record<string, string> = {
  "B0BSNXK3H7": "Pokemon TCG Scarlet & Violet Elite Trainer Box (Random Color)",
  "B0BTJ9VYC6": "Pokemon TCG Scarlet & Violet Elite Trainer Box - Miraidon Purple",
  "B0BTJ9SHRY": "Pokemon TCG Scarlet & Violet Elite Trainer Box - Koraidon Red",
  "B0BZQTDQ93": "Pokemon TCG Scarlet & Violet Elite Trainer Box - Miraidon",
  "B0C1LDKZS8": "Pokemon TCG Scarlet & Violet Pokemon Center Elite Trainer Box (Koraidon)",
  "B0DLPL7LC5": "Pokemon TCG Scarlet & Violet Prismatic Evolutions Elite Trainer Box",
  "B0DSLY7DZZ": "Pokemon TCG Scarlet & Violet Journey Together Elite Trainer Box",
  "B0F6Q92F5H": "Pokemon TCG Scarlet & Violet White Flare Elite Trainer Box",
  "B0F2BDXW4J": "Pokemon TCG Scarlet & Violet Destined Rivals Elite Trainer Box",
  "B0D4B4SL9X": "Pokemon TCG Scarlet & Violet Shrouded Fable Elite Trainer Box",
  // Add more as we discover them
};

/**
 * Get Amazon product name from ASIN
 */
function getAmazonProductName(url: string): string | null {
  const match = url.match(/\/dp\/([A-Z0-9]+)/);
  if (match) {
    const asin = match[1];
    return AMAZON_PRODUCT_NAMES[asin] || null;
  }
  return null;
}

// POST /api/monitors/refresh-names - Update all monitor names
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all monitors
    const monitors = await prisma.retailerMonitor.findMany();

    let updated = 0;
    let skipped = 0;

    for (const monitor of monitors) {
      let newName: string | null = null;

      // Special handling for Amazon - use our known names
      if (monitor.retailer === "AMAZON") {
        newName = getAmazonProductName(monitor.url);
      }

      // If no known name, extract from URL
      if (!newName) {
        newName = extractNameFromUrl(monitor.url, monitor.retailer as Retailer);
      }

      // Skip if name is the same or would be "Unknown Product"
      if (newName === monitor.name || newName === "Unknown Product") {
        skipped++;
        continue;
      }

      // Update the monitor
      await prisma.retailerMonitor.update({
        where: { id: monitor.id },
        data: { name: newName },
      });
      updated++;
    }

    return NextResponse.json({
      success: true,
      updated,
      skipped,
      total: monitors.length,
    });
  } catch (error) {
    console.error("Refresh names error:", error);
    return NextResponse.json(
      { error: "Failed to refresh names", details: String(error) },
      { status: 500 }
    );
  }
}
