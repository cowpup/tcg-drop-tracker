import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
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

      // Fetch user details from Clerk
      let email: string | null = null;
      let displayName: string | null = null;

      try {
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(userId);
        email = clerkUser.emailAddresses?.[0]?.emailAddress || null;
        displayName = clerkUser.firstName
          ? `${clerkUser.firstName}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ''}`
          : clerkUser.username || null;
      } catch (e) {
        console.error("Failed to fetch Clerk user details:", e);
      }

      user = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email,
          displayName,
          role,
          subscriptionTier: "FREE",
        },
      });
    } else if (!user.email || !user.displayName) {
      // Update existing user if missing email/name
      try {
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(userId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || null;
        const displayName = clerkUser.firstName
          ? `${clerkUser.firstName}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ''}`
          : clerkUser.username || null;

        if (email || displayName) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              ...(email && !user.email ? { email } : {}),
              ...(displayName && !user.displayName ? { displayName } : {}),
            },
          });
        }
      } catch (e) {
        console.error("Failed to update user from Clerk:", e);
      }
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
