import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const update = await prisma.serverUpdate.create({
    data: {
      title: "New Mods & Features Added!",
      description: "Fresh Animations, Dynmap live maps, and more quality-of-life improvements.",
      changes: [
        "Fresh Animations - Enhanced mob animations",
        "Fresh Animations Extensions - Additional animation packs",
        "Hold My Items - Visual item holding improvements",
        "Dynmap - Live server maps for all worlds",
        "Clear Glass - Cleaner glass textures (Ultra)",
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
