
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const branches = await prisma.branch.findMany();

  const defaultPolicies = [
    'Check-in: From 6:00',
    'Check-out: Before 00:00',
    'Cancellation: Free cancellation up to 48 hours before check-in',
    'Children: Children of all ages are welcome',
    'Pets: Pets are not allowed',
    'Smoking: Smoking is not permitted inside rooms',
  ];

  for (const branch of branches) {
    // Do not overwrite policies that an admin has already set.
    if (branch.policies.length > 0) {
      console.log(`Skipped ${branch.name}: policies already exist`);
      continue;
    }

    await prisma.branch.update({
      where: { id: branch.id },
      data: { policies: defaultPolicies },
    });

    console.log(`Added policies to ${branch.name}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
