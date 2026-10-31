
const { PrismaClient } = require("@prisma/client");
const fs = require("node:fs");

const prisma = new PrismaClient();

async function main() {
  const branches = await prisma.branch.findMany();
  const rooms = await prisma.room.findMany();

  const data = { branches, rooms };

  fs.writeFileSync(
    "hotels-backup.json",
    JSON.stringify(data, null, 2)
  );

  console.log(`Exported ${branches.length} branches`);
  console.log(`Exported ${rooms.length} rooms`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
