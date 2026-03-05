import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/jobs - List recent job logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const jobType = searchParams.get("jobType");

    const logs = await prisma.jobLog.findMany({
      where: jobType ? { jobType } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching job logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch job logs" },
      { status: 500 }
    );
  }
}
