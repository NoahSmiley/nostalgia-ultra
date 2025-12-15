import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2] || 'lucid111';

  // Find user by minecraft username
  const mcAccount = await prisma.minecraftAccount.findFirst({
    where: { mcUsername: { equals: username, mode: 'insensitive' } },
    include: { user: true }
  });

  if (mcAccount) {
    const updated = await prisma.user.update({
      where: { id: mcAccount.userId },
      data: { isAdmin: true }
    });
    console.log(`Made ${updated.email} (MC: ${mcAccount.mcUsername}) an admin`);
    return;
  }

  // Try finding by email or name
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { contains: username, mode: 'insensitive' } },
        { name: { contains: username, mode: 'insensitive' } }
      ]
    }
  });

  if (user) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true }
    });
    console.log(`Made ${updated.email} an admin`);
    return;
  }

  console.log(`User '${username}' not found`);

  // List all users
  const users = await prisma.user.findMany({ include: { minecraftLink: true } });
  console.log('\nAll users:');
  users.forEach(u => console.log(`- ${u.email} | MC: ${u.minecraftLink?.mcUsername || 'none'} | Role: ${u.role}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
