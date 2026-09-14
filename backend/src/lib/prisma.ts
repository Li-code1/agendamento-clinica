import { PrismaClient } from "@prisma/client";

// Instância única do Prisma Client, reaproveitada em toda a aplicação
// para evitar excesso de conexões com o banco.
export const prisma = new PrismaClient();
