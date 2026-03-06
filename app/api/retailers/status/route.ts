import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Retailer, SignalType } from "@prisma/client/index.js";

// Retailer URLs for display
const RETAILER_URLS: Record<Retailer, string> = {
  POKEMON_CENTER: "https://www.pokemoncenter.com",
  TARGET: "https://www.target.com",
  WALMART: "https://www.walmart.com",
  AMAZON: "https://www.amazon.com",
  GAMESTOP: "https://www.gamestop.com",
  BEST_BUY: "https://www.bestbuy.com",
  TCG_PLAYER: "https://www.tcgplayer.com",
  SHOPIFY: "https://shopify.com",
  OTHER: "",
};

interface RetailerStatus {
  id: Retailer;
  status: "normal" | "elevated" | "queue";
  lastChecked: string | null;
  queueActive: boolean;
  securityLevel: "standard" | "elevated";
  url: string;
  activeSignals: number;
}

// GET /api/retailers/status - Get current status of all retailers
export async function GET() {
  try {
    // Get the most recent signal for each retailer (within last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get active queue and security signals
    const activeSignals = await prisma.signal.findMany({
      where: {
        detectedAt: { gte: oneDayAgo },
        type: {
          in: [SignalType.QUEUE_DETECTED, SignalType.SECURITY_ESCALATED],
        },
      },
      orderBy: { detectedAt: "desc" },
    });

    // Get most recent check time from monitors for each retailer
    const monitors = await prisma.retailerMonitor.findMany({
      select: {
        retailer: true,
        lastCheckedAt: true,
      },
      orderBy: { lastCheckedAt: "desc" },
    });

    // Build retailer status map
    const retailerLastChecked: Record<string, Date> = {};
    monitors.forEach((m) => {
      if (m.lastCheckedAt && !retailerLastChecked[m.retailer]) {
        retailerLastChecked[m.retailer] = m.lastCheckedAt;
      }
    });

    // Group signals by retailer
    const signalsByRetailer: Record<string, { queue: boolean; elevated: boolean; count: number }> = {};
    activeSignals.forEach((signal) => {
      if (!signalsByRetailer[signal.retailer]) {
        signalsByRetailer[signal.retailer] = { queue: false, elevated: false, count: 0 };
      }
      signalsByRetailer[signal.retailer].count++;
      if (signal.type === SignalType.QUEUE_DETECTED) {
        signalsByRetailer[signal.retailer].queue = true;
      }
      if (signal.type === SignalType.SECURITY_ESCALATED) {
        signalsByRetailer[signal.retailer].elevated = true;
      }
    });

    // Build status for each retailer
    const retailers: RetailerStatus[] = Object.values(Retailer)
      .filter((r) => r !== "OTHER" && r !== "SHOPIFY") // Exclude generic entries
      .map((retailer) => {
        const signals = signalsByRetailer[retailer] || { queue: false, elevated: false, count: 0 };
        const lastChecked = retailerLastChecked[retailer];

        let status: "normal" | "elevated" | "queue" = "normal";
        if (signals.queue) {
          status = "queue";
        } else if (signals.elevated) {
          status = "elevated";
        }

        return {
          id: retailer,
          status,
          lastChecked: lastChecked?.toISOString() || null,
          queueActive: signals.queue,
          securityLevel: signals.elevated ? "elevated" : "standard",
          url: RETAILER_URLS[retailer],
          activeSignals: signals.count,
        };
      });

    return NextResponse.json({ data: retailers });
  } catch (error) {
    console.error("Error fetching retailer status:", error);
    return NextResponse.json(
      { error: "Failed to fetch retailer status" },
      { status: 500 }
    );
  }
}
