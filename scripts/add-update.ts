import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const update = await prisma.serverUpdate.create({
    data: {
      title: "December Server Update",
      description: "New mods and gameplay improvements for the holiday season",
      changes: [
        "Added Moving Elevators - Create functional elevators with blocks",
        "Added Diagonal Fences - Fences now connect diagonally for better builds",
        "Added Hunger Tweaks - Reduced hunger drain rate for better gameplay",
        "Spawn server now uses Adventure mode to protect the hub",
        "Removed Effective mod (caused shader compatibility issues)",
      ],
      isHighlight: true,
    },
  });

  console.log("Created update:", update);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
