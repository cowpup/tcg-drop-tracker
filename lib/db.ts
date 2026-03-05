import { PrismaClient } from "@prisma/client/index.js";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  // Use Neon adapter only for actual Neon URLs (contain "neon" in hostname)
  const isNeonUrl = connectionString?.includes(".neon.tech") ||
                    connectionString?.includes("neon.tech");

  if (isNeonUrl && connectionString) {
    // Dynamic import for Neon - use require for sync loading
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaNeon } = require("@prisma/adapter-neon");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neonConfig } = require("@neondatabase/serverless");

    neonConfig.useSecureWebSocket = true;
    neonConfig.pipelineTLS = false;
    neonConfig.pipelineConnect = false;

    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }

  // For local Postgres or other databases - standard connection
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
