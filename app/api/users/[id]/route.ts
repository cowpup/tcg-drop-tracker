import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { UserRole, SubscriptionTier } from "@prisma/client/index.js";

// Super admin user ID - the only one who can manage admins
const SUPER_ADMIN_ID = "user_3AXkPvNHZ8Jc09Csj9IWHKipRF9";

// Helper to check if user is admin or super admin
async function getAdminStatus(clerkUserId: string) {
  if (clerkUserId === SUPER_ADMIN_ID) {
    return { isAdmin: true, isSuperAdmin: true };
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) {
    return { isAdmin: false, isSuperAdmin: false };
  }

  return {
    isAdmin: user.role === "ADMIN" || user.role === "SUPER_ADMIN",
    isSuperAdmin: user.role === "SUPER_ADMIN",
  };
}

// GET /api/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isAdmin } = await getAdminStatus(userId);

    // Users can view their own profile, admins can view any
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { webhooks: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Non-admins can only view their own profile
    if (!isAdmin && user.clerkUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update a user (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isAdmin, isSuperAdmin } = await getAdminStatus(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { role, subscriptionTier, subscriptionExpiresAt, displayName, email } = body;

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only super admin can change roles to/from ADMIN or SUPER_ADMIN
    if (role) {
      const isPromotingToAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
      const isDemotingFromAdmin = targetUser.role === "ADMIN" || targetUser.role === "SUPER_ADMIN";

      if ((isPromotingToAdmin || isDemotingFromAdmin) && !isSuperAdmin) {
        return NextResponse.json(
          { error: "Only super admins can manage admin roles" },
          { status: 403 }
        );
      }

      // Can't demote the original super admin
      if (targetUser.clerkUserId === SUPER_ADMIN_ID && role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Cannot change the original super admin's role" },
          { status: 403 }
        );
      }

      // Validate role enum
      if (!Object.values(UserRole).includes(role)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${Object.values(UserRole).join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Validate subscription tier enum
    if (subscriptionTier && !Object.values(SubscriptionTier).includes(subscriptionTier)) {
      return NextResponse.json(
        { error: `Invalid subscription tier. Must be one of: ${Object.values(SubscriptionTier).join(", ")}` },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(subscriptionTier && { subscriptionTier }),
        ...(subscriptionExpiresAt !== undefined && {
          subscriptionExpiresAt: subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null,
        }),
        ...(displayName !== undefined && { displayName }),
        ...(email !== undefined && { email }),
      },
      include: {
        _count: {
          select: { webhooks: true },
        },
      },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user (super admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isSuperAdmin } = await getAdminStatus(userId);

    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Super admin access required" }, { status: 403 });
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Can't delete the original super admin
    if (targetUser.clerkUserId === SUPER_ADMIN_ID) {
      return NextResponse.json(
        { error: "Cannot delete the original super admin" },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
