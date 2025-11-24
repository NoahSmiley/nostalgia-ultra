import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { mcControl } from '@/lib/mc-control';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the Minecraft account before deleting
    const minecraftAccount = await prisma.minecraftAccount.findUnique({
      where: { userId: session.user.id },
    });

    if (!minecraftAccount) {
      return NextResponse.json(
        { error: 'No Minecraft account linked' },
        { status: 404 }
      );
    }

    // Remove from whitelist via MC Control service
    try {
      const whitelistResult = await mcControl.removeFromWhitelist(minecraftAccount.mcUsername);
      console.log(`Whitelist removal for ${minecraftAccount.mcUsername}:`, whitelistResult.message);
    } catch (error) {
      console.error(`Failed to remove ${minecraftAccount.mcUsername} from whitelist:`, error);
      // Continue with unlinking even if whitelist removal fails
    }

    // Delete the Minecraft account link
    await prisma.minecraftAccount.delete({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to unlink Minecraft account:', error);
    return NextResponse.json(
      { error: 'Failed to unlink account' },
      { status: 500 }
    );
  }
}