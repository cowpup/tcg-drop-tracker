import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const SUPER_ADMIN_ID = "user_3AXkPvNHZ8Jc09Csj9IWHKipRF9";

// GET /api/users/me - Get current user's profile
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    // Auto-create user profile if it doesn't exist
    if (!user) {
      const role = userId === SUPER_ADMIN_ID ? "SUPER_ADMIN" : "USER";

      user = await prisma.user.create({
        data: {
          clerkUserId: userId,
          role,
          subscriptionTier: "FREE",
        },
      });
    }

    // Check if subscription is expired
    const isSubscriptionActive =
      user.subscriptionTier !== "FREE" &&
      (!user.subscriptionExpiresAt || new Date(user.subscriptionExpiresAt) > new Date());

    return NextResponse.json({
      data: {
        ...user,
        isSubscriptionActive,
        canCreateWebhooks:
          isSubscriptionActive ||
          user.role === "ADMIN" ||
          user.role === "SUPER_ADMIN",
        isAdmin: user.role === "ADMIN" || user.role === "SUPER_ADMIN",
        isSuperAdmin: user.role === "SUPER_ADMIN",
      },
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
