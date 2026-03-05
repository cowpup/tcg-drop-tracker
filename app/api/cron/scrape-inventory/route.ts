import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendSignalAlert } from "@/lib/discord";

const BATCH_SIZE = 10;

// POST /api/cron/scrape-inventory - Inventory scraping cron job
export async function POST(request: NextRequest) {
  try {
    // Validate cron request - check Vercel cron header or Bearer token
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    const vercelCronHeader = request.headers.get("x-vercel-cron");

    // Allow if: Vercel cron header matches, OR Bearer token matches
    const isVercelCron = vercelCronHeader === cronSecret;
    const isBearerAuth = authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !isBearerAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    const results = {
      monitorsChecked: 0,
      restockSignals: 0,
      priceChangeSignals: 0,
      notificationsSent: 0,
      errors: [] as string[],
    };

    // Fetch monitors that need inventory checking
    // For now, this is a placeholder - actual inventory scraping
    // requires retailer-specific implementations
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const monitors = await prisma.retailerMonitor.findMany({
      where: {
        OR: [
          { lastCheckedAt: null },
          { lastCheckedAt: { lt: fiveMinutesAgo } },
        ],
      },
      take: BATCH_SIZE,
      orderBy: { lastCheckedAt: "asc" },
      include: { product: true },
    });

    results.monitorsChecked = monitors.length;

    // Fetch webhooks for notifications
    const webhooks = await prisma.discordWebhook.findMany({
      where: { active: true },
    });

    // Process each monitor
    for (const monitor of monitors) {
      try {
        // Update last checked timestamp
        await prisma.retailerMonitor.update({
          where: { id: monitor.id },
          data: { lastCheckedAt: new Date() },
        });

        // TODO: Implement retailer-specific inventory scraping
        // - Pokemon Center: Check product availability endpoint
        // - Target: Use internal API
        // - Shopify stores: Check /products.json
        // - etc.

        // Placeholder: In production, each retailer type would have its own scraper
        // that checks inventory status and creates RESTOCK or PRICE_CHANGE signals

      } catch (error) {
        const errorMsg = `Error processing ${monitor.url}: ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    const duration = Date.now() - startTime;

    // Log job result to database
    await prisma.jobLog.create({
      data: {
        jobType: "scrape-inventory",
        status: results.errors.length > 0 ? "partial" : "success",
        duration,
        itemsChecked: results.monitorsChecked,
        itemsFound: results.restockSignals + results.priceChangeSignals,
        errors: results.errors,
        metadata: {
          restockSignals: results.restockSignals,
          priceChangeSignals: results.priceChangeSignals,
          notificationsSent: results.notificationsSent,
        },
      },
    });

    console.log("Inventory scrape completed", {
      duration: `${duration}ms`,
      ...results,
    });

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      ...results,
    });
  } catch (error) {
    console.error("Inventory scrape failed:", error);
    return NextResponse.json(
      { error: "Scrape failed", details: String(error) },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel Cron
export async function GET(request: NextRequest) {
  return POST(request);
}
