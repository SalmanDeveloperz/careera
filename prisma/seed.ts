import { syncAllOpportunities } from "../src/lib/opportunities/ingest";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding Careera database...");
  const result = await syncAllOpportunities();
  console.log("Sync complete:", result);

  const count = await prisma.opportunity.count();
  console.log(`Total opportunities in DB: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
