import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { securityMonitor, queueDetector } from "@/lib/scrapers/signals";
import { sendSignalAlert } from "@/lib/discord";
import { DropStatus } from "@prisma/client/index.js";
import type { Prisma } from "@prisma/client/index.js";

const BATCH_SIZE = 10; // Process monitors in batches to stay within timeout

// POST /api/cron/scrape-security - Security monitoring cron job
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
      securitySignals: 0,
      queueSignals: 0,
      notificationsSent: 0,
      errors: [] as string[],
    };

    // Fetch monitors that haven't been checked in the last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const monitors = await prisma.retailerMonitor.findMany({
      where: {
        OR: [
          { lastCheckedAt: null },
          { lastCheckedAt: { lt: twoMinutesAgo } },
        ],
      },
      take: BATCH_SIZE,
      orderBy: { lastCheckedAt: "asc" },
      include: { product: true },
    });

    // Fetch all active webhooks for notifications
    const webhooks = await prisma.discordWebhook.findMany({
      where: { active: true },
    });

    // Process each monitor
    for (const monitor of monitors) {
      try {
        results.monitorsChecked++;

        // Check for security changes
        const securityResult = await securityMonitor.checkSecurity(
          monitor.url,
          monitor
        );

        // Check for queue activation
        const queueResult = await queueDetector.scrape(monitor.url);

        // Update monitor state
        await prisma.retailerMonitor.update({
          where: { id: monitor.id },
          data: {
            lastStatus: securityResult.metadata.statusCode ?? null,
            lastBodySize: securityResult.metadata.bodySize ?? null,
            lastHeaders: securityResult.metadata.headers ?? undefined,
            lastRedirectChain: securityResult.metadata.redirectChain ?? undefined,
            lastCheckedAt: new Date(),
          },
        });

        // Create security signal if detected
        if (securityResult.detected) {
          const signal = await prisma.signal.create({
            data: {
              retailer: monitor.retailer,
              type: "SECURITY_ESCALATED",
              url: monitor.url,
              metadata: securityResult.metadata as Prisma.InputJsonValue,
              dropId: await findAssociatedDropId(monitor.productId),
            },
            include: {
              drop: { include: { product: true } },
            },
          });

          results.securitySignals++;

          // Send Discord notifications
          const notifyResult = await sendSignalAlert(signal, webhooks);
          results.notificationsSent += notifyResult.sent;

          // Mark signal as notified
          await prisma.signal.update({
            where: { id: signal.id },
            data: { notified: true },
          });
        }

        // Create queue signal if detected
        if (queueResult.detected) {
          const signal = await prisma.signal.create({
            data: {
              retailer: monitor.retailer,
              type: "QUEUE_DETECTED",
              url: monitor.url,
              metadata: {
                ...queueResult.metadata,
                queueProvider: queueResult.queueProvider,
              } as Prisma.InputJsonValue,
              dropId: await findAssociatedDropId(monitor.productId),
            },
            include: {
              drop: { include: { product: true } },
            },
          });

          results.queueSignals++;

          // Update associated drop status to QUEUE_ACTIVE
          if (signal.dropId) {
            await prisma.drop.update({
              where: { id: signal.dropId },
              data: { status: DropStatus.QUEUE_ACTIVE },
            });
          }

          // Send Discord notifications
          const notifyResult = await sendSignalAlert(signal, webhooks);
          results.notificationsSent += notifyResult.sent;

          // Mark signal as notified
          await prisma.signal.update({
            where: { id: signal.id },
            data: { notified: true },
          });
        }
      } catch (error) {
        const errorMsg = `Error processing ${monitor.url}: ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    const duration = Date.now() - startTime;

    console.log("Security scrape completed", {
      duration: `${duration}ms`,
      ...results,
    });

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      ...results,
    });
  } catch (error) {
    console.error("Security scrape failed:", error);
    return NextResponse.json(
      { error: "Scrape failed", details: String(error) },
      { status: 500 }
    );
  }
}

// Helper to find the most relevant drop for a product
async function findAssociatedDropId(productId: string | null): Promise<string | null> {
  if (!productId) return null;

  const drop = await prisma.drop.findFirst({
    where: {
      productId,
      status: { in: [DropStatus.UPCOMING, DropStatus.LIVE] },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return drop?.id || null;
}

// Also support GET for Vercel Cron
export async function GET(request: NextRequest) {
  return POST(request);
}
