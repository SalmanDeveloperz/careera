import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL ?? "file:./dev.db";
  if (!fromEnv.startsWith("file:")) return fromEnv;

  const relative = fromEnv.replace(/^file:\/?/, "").replace(/^\.\//, "");
  const absolute = path.isAbsolute(relative)
    ? relative
    : path.join(process.cwd(), relative);

  return `file:${absolute.replace(/\\/g, "/")}`;
}

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: resolveDatabaseUrl() });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
