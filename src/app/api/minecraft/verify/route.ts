import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { mcControl } from '@/lib/mc-control';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userCode } = await req.json();

    if (!userCode) {
      return NextResponse.json(
        { error: 'Minecraft username is required' },
        { status: 400 }
      );
    }

    // For demo purposes, we'll use the username directly
    // In production, you'd verify through prismarine-auth or Mojang API
    const mcUsername = userCode.trim();

    // Generate a UUID for demo (in production, get from Mojang API)
    const mcUuid = `${mcUsername.toLowerCase()}-uuid-${Date.now()}`;

    // Check if this username is already linked to another user
    const existingLink = await prisma.minecraftAccount.findFirst({
      where: {
        mcUsername: mcUsername,
        userId: { not: session.user.id }
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'This Minecraft account is already linked to another user' },
        { status: 400 }
      );
    }

    // Create or update the Minecraft link
    const minecraftAccount = await prisma.minecraftAccount.upsert({
      where: { userId: session.user.id },
      update: {
        mcUuid: mcUuid,
        mcUsername: mcUsername,
        linkedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        mcUuid: mcUuid,
        mcUsername: mcUsername,
      },
    });

    // Check if user has active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
    });

    // Only whitelist if user has an active subscription
    let whitelisted = false;
    if (subscription) {
      try {
        const whitelistResult = await mcControl.addToWhitelist(mcUsername);
        console.log(`Whitelisted ${mcUsername} (active subscription):`, whitelistResult.message);
        whitelisted = true;
      } catch (error) {
        console.error(`Failed to whitelist ${mcUsername}:`, error);
        // Don't fail the whole request if whitelist fails
      }
    }

    return NextResponse.json({
      success: true,
      username: mcUsername,
      uuid: mcUuid,
      whitelisted: whitelisted,
    });
  } catch (error) {
    console.error('Minecraft verification error:', error);
    return NextResponse.json(
      { error: 'Failed to link Minecraft account' },
      { status: 500 }
    );
  }
}