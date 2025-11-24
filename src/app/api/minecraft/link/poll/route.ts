import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mcControl } from "@/lib/mc-control";

// Import the same device code flows map
const deviceCodeFlows = new Map<string, any>();

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const flowData = deviceCodeFlows.get(userId);

  if (!flowData) {
    return NextResponse.json(
      { error: "No authentication flow found" },
      { status: 404 }
    );
  }

  try {
    // Try to complete the authentication
    const { flow } = flowData;

    // Get Minecraft profile
    const mcProfile = await flow.getMinecraft();

    if (!mcProfile || !mcProfile.profile) {
      return NextResponse.json(
        { status: "pending" }
      );
    }

    // Extract UUID and username
    const mcUuid = mcProfile.profile.id;
    const mcUsername = mcProfile.profile.name;

    // Check if this Minecraft account is already linked
    const existingLink = await prisma.minecraftAccount.findUnique({
      where: { mcUuid }
    });

    if (existingLink && existingLink.userId !== userId) {
      return NextResponse.json(
        { error: "This Minecraft account is already linked to another user" },
        { status: 400 }
      );
    }

    // Create or update the link
    await prisma.minecraftAccount.upsert({
      where: { userId },
      create: {
        userId,
        mcUuid,
        mcUsername,
      },
      update: {
        mcUuid,
        mcUsername,
      },
    });

    // Automatically whitelist the user for testing
    try {
      await mcControl.addToWhitelist(mcUsername);
      console.log(`Auto-whitelisted ${mcUsername} after account linking`);
    } catch (whitelistError) {
      console.error(`Failed to auto-whitelist ${mcUsername}:`, whitelistError);
      // Don't fail the whole request if whitelist fails
    }

    // Clean up the flow
    deviceCodeFlows.delete(userId);

    return NextResponse.json({
      status: "complete",
      minecraft: {
        uuid: mcUuid,
        username: mcUsername,
      },
    });
  } catch (error: any) {
    if (error.message?.includes("authorization_pending")) {
      return NextResponse.json(
        { status: "pending" }
      );
    }

    console.error("Minecraft link poll error:", error);
    return NextResponse.json(
      { error: "Failed to complete authentication" },
      { status: 500 }
    );
  }
}