// src/lib/prisma.ts
// Instância global do PrismaClient para evitar múltiplas conexões em desenvolvimento.
// O Next.js reinicia módulos em hot reload, então sem isso cada salvamento criaria
// uma nova conexão com o banco — esse padrão evita o problema.

import { PrismaClient } from "@prisma/client/edge";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}