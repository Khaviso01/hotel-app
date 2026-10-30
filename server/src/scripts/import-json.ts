
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient, Role } from '@prisma/client';
import type { Store } from '../models/types.js';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.resolve(process.cwd(), 'data.json');

  if (!fs.existsSync(filePath)) {
    throw new Error('data.json was not found in the server folder.');
  }

  const data = JSON.parse(
    fs.readFileSync(filePath, 'utf8')
  ) as Store;

  console.log('Starting JSON to PostgreSQL import...');

  await prisma.$transaction(async (tx) => {
    // Import users, preserving their original IDs and password hashes.
    for (const user of data.users) {
      const values = {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role === 'admin' ? Role.ADMIN : Role.GUEST,
      };

      await tx.user.upsert({
        where: { id: user.id },
        update: values,
        create: { id: user.id, ...values },
      });
    }

    // Import hotel branches, including amenities.
    for (const branch of data.branches) {
      const values = {
        name: branch.name,
        city: branch.city,
        address: branch.address,
        description: branch.description,
        image: branch.image,
        rating: branch.rating,
        amenities: branch.amenities ?? [],
      };

      await tx.branch.upsert({
        where: { id: branch.id },
        update: values,
        create: { id: branch.id, ...values },
      });
    }

    // Import rooms after branches so foreign keys remain valid.
    for (const room of data.rooms) {
      const values = {
        branchId: room.branchId,
        name: room.name,
        type: room.type,
        description: room.description,
        capacity: room.capacity,
        price: room.price,
        available: room.available,
        image: room.image,
      };

      await tx.room.upsert({
        where: { id: room.id },
        update: values,
        create: { id: room.id, ...values },
      });
    }
  });

  console.log(`Imported ${data.users.length} users.`);
  console.log(`Imported ${data.branches.length} branches.`);
  console.log(`Imported ${data.rooms.length} rooms.`);
  console.log('PostgreSQL import completed successfully.');
}

main()
  .catch((error) => {
    console.error('Import failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
