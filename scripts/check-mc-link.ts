import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMcLink(username: string) {
  const user = await prisma.user.findFirst({
    where: { username },
    include: { minecraftLink: true, subscriptions: true }
  });

  if (!user) {
    console.log(`No user found with username: ${username}`);
    return;
  }

  console.log('User:', user.username);
  console.log('Email:', user.email);
  console.log('Minecraft Link:', JSON.stringify(user.minecraftLink, null, 2));
  console.log('Subscriptions:', JSON.stringify(user.subscriptions, null, 2));

  await prisma.$disconnect();
}

const username = process.argv[2] || 'brandonkerney';
checkMcLink(username);
