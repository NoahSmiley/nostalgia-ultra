import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { mcControl } from '@/lib/mc-control';

// Mojang API response type
interface MojangProfile {
  id: string;  // UUID without dashes
  name: string;  // Current username
}

// Fetch UUID from Mojang API
async function getMojangProfile(username: string): Promise<MojangProfile | null> {
  try {
    const response = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`,
      {
        headers: {
          'User-Agent': 'Endless/1.0 (minecraft verification)',
        },
      }
    );

    if (response.status === 404) {
      return null; // Username doesn't exist
    }

    if (!response.ok) {
      throw new Error(`Mojang API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Mojang API error:', error);
    throw error;
  }
}

// Format UUID with dashes (Mojang returns without dashes)
function formatUuid(uuid: string): string {
  return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
}

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

    const inputUsername = userCode.trim();

    // Verify username exists via Mojang API
    const mojangProfile = await getMojangProfile(inputUsername);

    if (!mojangProfile) {
      return NextResponse.json(
        { error: 'Minecraft username not found. Please check the spelling and try again.' },
        { status: 400 }
      );
    }

    // Use the official username and UUID from Mojang
    const mcUsername = mojangProfile.name;
    const mcUuid = formatUuid(mojangProfile.id);

    // Check if this Minecraft account (by UUID) is already linked to another user
    // Using UUID is more reliable than username since Minecraft usernames can change
    const existingLink = await prisma.minecraftAccount.findFirst({
      where: {
        mcUuid: mcUuid,
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