const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const poolMax = Number(process.env.PG_POOL_MAX || 5);

if (!Number.isSafeInteger(poolMax) || poolMax < 1) {
  throw new Error("PG_POOL_MAX must be a positive integer");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: poolMax
});

const prisma = new PrismaClient({
  adapter
});

module.exports = prisma;