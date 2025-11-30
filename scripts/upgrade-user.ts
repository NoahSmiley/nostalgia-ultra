import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upgradeUserToUltra(searchTerm: string) {
  // Find user by username, email, or displayName containing the search term
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { displayName: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
    include: {
      subscriptions: true,
    },
  });

  if (users.length === 0) {
    console.log(`No users found matching "${searchTerm}"`);
    return;
  }

  console.log(`Found ${users.length} user(s):`);
  for (const user of users) {
    console.log(`  - ${user.username} (${user.email}) - ${user.displayName || 'no display name'}`);
    console.log(`    Subscriptions: ${user.subscriptions.length}`);

    for (const sub of user.subscriptions) {
      console.log(`      - ID: ${sub.id}, Tier: ${sub.tier}, Status: ${sub.status}`);
    }
  }

  // If exactly one user found, upgrade their subscription
  if (users.length === 1) {
    const user = users[0];
    const sub = user.subscriptions[0];

    if (sub) {
      const updated = await prisma.subscription.update({
        where: { id: sub.id },
        data: { tier: 'ultra' },
      });
      console.log(`\nUpgraded ${user.username}'s subscription to ultra!`);
      console.log(`  New tier: ${updated.tier}`);
    } else {
      console.log(`\n${user.username} has no subscriptions to upgrade.`);
    }
  } else if (users.length > 1) {
    console.log('\nMultiple users found. Please refine your search.');
  }
}

// Run with the search term from command line
const searchTerm = process.argv[2] || 'riley';
upgradeUserToUltra(searchTerm)
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
