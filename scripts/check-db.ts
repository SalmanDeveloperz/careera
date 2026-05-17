import { prisma } from "../src/lib/prisma";

async function main() {
  const count = await prisma.opportunity.count();
  console.log(`Database OK — ${count} opportunities loaded.`);
}

main()
  .catch((e) => {
    console.error("Database error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
