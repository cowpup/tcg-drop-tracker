import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Game, ProductType } from "@prisma/client/index.js";

// GET /api/products - List all products with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get("game") as Game | null;
    const type = searchParams.get("type") as ProductType | null;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
      ...(game && { game }),
      ...(type && { type }),
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { drops: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, game, type, imageUrl, msrp } = body;

    if (!name || !game || !type) {
      return NextResponse.json(
        { error: "Missing required fields: name, game, type" },
        { status: 400 }
      );
    }

    // Validate enums
    if (!Object.values(Game).includes(game)) {
      return NextResponse.json(
        { error: `Invalid game. Must be one of: ${Object.values(Game).join(", ")}` },
        { status: 400 }
      );
    }

    if (!Object.values(ProductType).includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${Object.values(ProductType).join(", ")}` },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        game,
        type,
        imageUrl,
        msrp: msrp ? parseFloat(msrp) : null,
      },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
