import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activate() {
  const updated = await prisma.subscription.updateMany({
    where: {
      user: { username: 'brandonkerney' }
    },
    data: { status: 'active' }
  });
  console.log('Updated', updated.count, 'subscription(s) for brandonkerney to active');
  await prisma.$disconnect();
}
activate();
