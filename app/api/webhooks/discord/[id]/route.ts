import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Game, Retailer, SignalType } from "@prisma/client/index.js";

type RouteParams = { params: Promise<{ id: string }> };

// Validate Discord webhook URL format
function isValidDiscordWebhook(url: string): boolean {
  const discordWebhookRegex =
    /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+$/;
  return discordWebhookRegex.test(url);
}

// GET /api/webhooks/discord/[id] - Get a single webhook
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const webhook = await prisma.discordWebhook.findFirst({
      where: { id, clerkUserId: userId },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: webhook });
  } catch (error) {
    console.error("Error fetching webhook:", error);
    return NextResponse.json(
      { error: "Failed to fetch webhook" },
      { status: 500 }
    );
  }
}

// PATCH /api/webhooks/discord/[id] - Update a webhook
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.discordWebhook.findFirst({
      where: { id, clerkUserId: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { webhookUrl, label, games, retailers, signalTypes, active } = body;

    // Validate webhook URL if provided
    if (webhookUrl && !isValidDiscordWebhook(webhookUrl)) {
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

    const webhook = await prisma.discordWebhook.update({
      where: { id },
      data: {
        ...(webhookUrl && { webhookUrl }),
        ...(label && { label }),
        ...(games !== undefined && { games }),
        ...(retailers !== undefined && { retailers }),
        ...(signalTypes !== undefined && { signalTypes }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({ data: webhook });
  } catch (error) {
    console.error("Error updating webhook:", error);
    return NextResponse.json(
      { error: "Failed to update webhook" },
      { status: 500 }
    );
  }
}

// DELETE /api/webhooks/discord/[id] - Delete a webhook
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.discordWebhook.findFirst({
      where: { id, clerkUserId: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      );
    }

    await prisma.discordWebhook.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return NextResponse.json(
      { error: "Failed to delete webhook" },
      { status: 500 }
    );
  }
}
