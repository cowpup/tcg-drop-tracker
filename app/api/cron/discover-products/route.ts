import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { discoverAllProducts } from "@/lib/scrapers/discovery";

// POST /api/cron/discover-products - Auto-discover new product URLs
export async function POST(request: NextRequest) {
  try {
    // Validate cron request
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    const vercelCronHeader = request.headers.get("x-vercel-cron");

    const isVercelCron = vercelCronHeader === cronSecret;
    const isBearerAuth = authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !isBearerAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    const results = {
      discovered: 0,
      newMonitors: 0,
      skipped: 0,
      errors: [] as string[],
      byRetailer: {} as Record<string, { discovered: number; added: number }>,
    };

    // Run product discovery
    console.log("Starting product discovery...");
    const discovery = await discoverAllProducts();

    results.discovered = discovery.products.length;
    results.errors.push(...discovery.errors);

    // Process discovered products
    for (const product of discovery.products) {
      try {
        // Check if URL already exists
        const existing = await prisma.retailerMonitor.findUnique({
          where: { url: product.url },
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        // Add new monitor
        await prisma.retailerMonitor.create({
          data: {
            url: product.url,
            retailer: product.retailer,
            name: product.name || null,
          },
        });

        results.newMonitors++;

        // Track by retailer
        if (!results.byRetailer[product.retailer]) {
          results.byRetailer[product.retailer] = { discovered: 0, added: 0 };
        }
        results.byRetailer[product.retailer].added++;
      } catch (error) {
        results.errors.push(`Failed to add ${product.url}: ${error}`);
      }
    }

    // Update discovered counts
    for (const [retailer, count] of Object.entries(discovery.byRetailer)) {
      if (!results.byRetailer[retailer]) {
        results.byRetailer[retailer] = { discovered: 0, added: 0 };
      }
      results.byRetailer[retailer].discovered = count;
    }

    const duration = Date.now() - startTime;

    // Log job result
    await prisma.jobLog.create({
      data: {
        jobType: "discover-products",
        status: results.errors.length > 0 ? "partial" : "success",
        duration,
        itemsChecked: results.discovered,
        itemsFound: results.newMonitors,
        errors: results.errors.slice(0, 20),
        metadata: {
          skipped: results.skipped,
          byRetailer: results.byRetailer,
        },
      },
    });

    console.log("Product discovery completed", {
      duration: `${duration}ms`,
      discovered: results.discovered,
      newMonitors: results.newMonitors,
      skipped: results.skipped,
    });

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      ...results,
    });
  } catch (error) {
    console.error("Product discovery failed:", error);
    return NextResponse.json(
      { error: "Discovery failed", details: String(error) },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel Cron
export async function GET(request: NextRequest) {
  return POST(request);
}
