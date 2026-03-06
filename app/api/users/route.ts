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

// GET /api/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isAdmin } = await getAdminStatus(userId);
    if (!isAdmin && userId !== SUPER_ADMIN_ID) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") as UserRole | null;
    const subscription = searchParams.get("subscription") as SubscriptionTier | null;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where = {
      ...(role && { role }),
      ...(subscription && { subscriptionTier: subscription }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { displayName: { contains: search, mode: "insensitive" as const } },
          { clerkUserId: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { webhooks: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create or get user profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, displayName } = body;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { clerkUserId: userId },
        data: {
          ...(email && { email }),
          ...(displayName && { displayName }),
        },
      });
    } else {
      // Create new user - super admin gets SUPER_ADMIN role
      const role = userId === SUPER_ADMIN_ID ? "SUPER_ADMIN" : "USER";

      user = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email,
          displayName,
          role,
          subscriptionTier: "FREE",
        },
      });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json(
      { error: "Failed to create/update user" },
      { status: 500 }
    );
  }
}
