// src/lib/prisma.ts
// @ts-nocheck
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis as unknown as { prisma: any };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ 
    connectionString,
    ssl: false,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}