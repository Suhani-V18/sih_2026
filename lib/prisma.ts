import { PrismaClient } from "@prisma/client";

// Global type declaration for hot-reloading in Next.js development mode
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Instantiate PrismaClient or reuse existing global instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// =========================================================================
// HELPER: Convert BigInt IDs to Strings for JSON Serialization
// =========================================================================
// Your schema uses BigInt for IDs. Standard `JSON.stringify` used by
// `NextResponse.json()` throws a TypeError on BigInt without this patch.
// =========================================================================
if (typeof BigInt !== "undefined") {
  (BigInt.prototype as unknown as { toJSON: () => string }).toJSON =
    function () {
      return this.toString();
    };
}