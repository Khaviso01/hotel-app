
const { PrismaClient } = require("@prisma/client");
const fs = require("node:fs");
const path = require("node:path");

const prisma = new PrismaClient();

async function main() {
    const backupPath = path.resolve(process.cwd(), "hotels-backup.json");

    if (!fs.existsSync(backupPath)) {
        throw new Error("hotels-backup.json was not found.");
    }

    const { branches, rooms } = JSON.parse(
        fs.readFileSync(backupPath, "utf8")
    );

    if (!Array.isArray(branches) || !Array.isArray(rooms)) {
        throw new Error("Invalid backup file.");
    }

    if (branches.length === 0 || rooms.length === 0) {
        throw new Error("Backup contains no hotels or rooms.");
    }

    console.log(`Backup: ${branches.length} branches, ${rooms.length} rooms`);

    const existingBranches = await prisma.branch.count();
    const existingRooms = await prisma.room.count();

    // Prevent accidental overwriting of existing production data.
    if (existingBranches > 0 || existingRooms > 0) {
        throw new Error(
            "Destination already contains hotels or rooms. Import cancelled."
        );
    }

    await prisma.$transaction(async (tx) => {
        // Import branches first to preserve room relationships.
        for (const branch of branches) {
            await tx.branch.create({ data: branch });
        }

        // Import rooms after their parent branches.
        for (const room of rooms) {
            await tx.room.create({ data: room });
        }
    }, {
        maxWait: 10000,
        timeout: 120000,
    });

    console.log(`Imported ${branches.length} branches`);
    console.log(`Imported ${rooms.length} rooms`);
    console.log("Neon import completed successfully!");
}

main()
    .catch((error) => {
        console.error("Import failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
