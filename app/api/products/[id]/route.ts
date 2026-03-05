import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Game, ProductType } from "@prisma/client/index.js";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/products/[id] - Get a single product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        drops: {
          orderBy: { scheduledAt: "desc" },
          take: 10,
        },
        monitors: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] - Update a product
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, game, type, imageUrl, msrp } = body;

    // Validate enums if provided
    if (game && !Object.values(Game).includes(game)) {
      return NextResponse.json(
        { error: `Invalid game. Must be one of: ${Object.values(Game).join(", ")}` },
        { status: 400 }
      );
    }

    if (type && !Object.values(ProductType).includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${Object.values(ProductType).join(", ")}` },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(game && { game }),
        ...(type && { type }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(msrp !== undefined && { msrp: msrp ? parseFloat(msrp) : null }),
      },
    });

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
