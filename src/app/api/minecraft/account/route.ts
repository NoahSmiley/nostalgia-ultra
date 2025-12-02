import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const minecraftAccount = await prisma.minecraftAccount.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          include: {
            subscriptions: {
              where: { status: 'active' },
            },
          },
        },
      },
    });

    if (!minecraftAccount) {
      return NextResponse.json(
        { error: 'No Minecraft account linked' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      username: minecraftAccount.mcUsername,
      uuid: minecraftAccount.mcUuid,
      linkedAt: minecraftAccount.linkedAt,
      nickname: minecraftAccount.nickname,
      whitelisted: minecraftAccount.user.subscriptions.length > 0,
    });
  } catch (error) {
    console.error('Failed to fetch Minecraft account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}