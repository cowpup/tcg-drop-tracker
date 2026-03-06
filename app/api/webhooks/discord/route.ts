import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Game, Retailer, SignalType } from "@prisma/client/index.js";

// Validate Discord webhook URL format
function isValidDiscordWebhook(url: string): boolean {
  const discordWebhookRegex =
    /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+$/;
  return discordWebhookRegex.test(url);
}

// GET /api/webhooks/discord - List user's webhooks
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const webhooks = await prisma.discordWebhook.findMany({
      where: { clerkUserId: userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: webhooks });
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}

// POST /api/webhooks/discord - Register a new webhook (subscribers only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has subscriber access
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    // Super admin bypass
    const SUPER_ADMIN_ID = "user_3AXkPvNHZ8Jc09Csj9IWHKipRF9";
    const isSuperAdmin = userId === SUPER_ADMIN_ID;

    if (!isSuperAdmin) {
      if (!user) {
        return NextResponse.json(
          { error: "User profile not found. Please refresh the page." },
          { status: 403 }
        );
      }

      // Check subscription status
      const hasAccess =
        user.subscriptionTier !== "FREE" ||
        user.role === "ADMIN" ||
        user.role === "SUPER_ADMIN";

      if (!hasAccess) {
        return NextResponse.json(
          { error: "Webhook access requires a subscription. Upgrade to create webhooks." },
          { status: 403 }
        );
      }

      // Check subscription expiry
      if (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()) {
        return NextResponse.json(
          { error: "Your subscription has expired. Please renew to create webhooks." },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { webhookUrl, label, games, retailers, signalTypes, active } = body;

    if (!webhookUrl || !label) {
      return NextResponse.json(
        { error: "Missing required fields: webhookUrl, label" },
        { status: 400 }
      );
    }

    if (!isValidDiscordWebhook(webhookUrl)) {
      return NextResponse.json(
        { error: "Invalid Discord webhook URL format" },
        { status: 400 }
      );
    }

    // Validate enum arrays if provided
    if (games && games.length > 0) {
      const invalidGames = games.filter(
        (g: string) => !Object.values(Game).includes(g as Game)
      );
      if (invalidGames.length > 0) {
        return NextResponse.json(
          { error: `Invalid games: ${invalidGames.join(", ")}` },
          { status: 400 }
        );
      }
    }

    if (retailers && retailers.length > 0) {
      const invalidRetailers = retailers.filter(
        (r: string) => !Object.values(Retailer).includes(r as Retailer)
      );
      if (invalidRetailers.length > 0) {
        return NextResponse.json(
          { error: `Invalid retailers: ${invalidRetailers.join(", ")}` },
          { status: 400 }
        );
      }
    }

    if (signalTypes && signalTypes.length > 0) {
      const invalidTypes = signalTypes.filter(
        (t: string) => !Object.values(SignalType).includes(t as SignalType)
      );
      if (invalidTypes.length > 0) {
        return NextResponse.json(
          { error: `Invalid signal types: ${invalidTypes.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const webhook = await prisma.discordWebhook.create({
      data: {
        clerkUserId: userId,
        userId: user?.id, // Link to user if exists
        webhookUrl,
        label,
        games: games || [],
        retailers: retailers || [],
        signalTypes: signalTypes || [],
        active: active ?? true,
      },
    });

    return NextResponse.json({ data: webhook }, { status: 201 });
  } catch (error) {
    console.error("Error creating webhook:", error);
    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500 }
    );
  }
}
