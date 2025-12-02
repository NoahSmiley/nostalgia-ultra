import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mcControl } from "@/lib/mc-control";

// GET - Get current nickname
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        minecraftLink: true,
        subscriptions: {
          where: { status: "active" },
        },
      },
    });

    if (!user?.minecraftLink) {
      return NextResponse.json({ error: "No Minecraft account linked" }, { status: 400 });
    }

    return NextResponse.json({
      nickname: user.minecraftLink.nickname,
      username: user.minecraftLink.mcUsername,
    });
  } catch (error) {
    console.error("Failed to get nickname:", error);
    return NextResponse.json({ error: "Failed to get nickname" }, { status: 500 });
  }
}

// POST - Set nickname (Ultra only)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        minecraftLink: true,
        subscriptions: {
          where: { status: "active" },
        },
      },
    });

    if (!user?.minecraftLink) {
      return NextResponse.json({ error: "No Minecraft account linked" }, { status: 400 });
    }

    // Check if user has Ultra subscription
    const hasUltra = user.subscriptions.some(sub => sub.tier === "ultra");
    if (!hasUltra) {
      return NextResponse.json(
        { error: "Nicknames are only available for Ultra members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nickname } = body;

    if (!nickname || typeof nickname !== "string") {
      return NextResponse.json({ error: "Nickname is required" }, { status: 400 });
    }

    // Validate nickname
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 1 || trimmedNickname.length > 32) {
      return NextResponse.json(
        { error: "Nickname must be between 1 and 32 characters" },
        { status: 400 }
      );
    }

    // Check for inappropriate content (basic filter)
    const inappropriateWords = ["admin", "moderator", "mod", "staff", "owner"];
    if (inappropriateWords.some(word => trimmedNickname.toLowerCase().includes(word))) {
      return NextResponse.json(
        { error: "Nickname contains restricted words" },
        { status: 400 }
      );
    }

    // Update in database
    await prisma.minecraftAccount.update({
      where: { userId: session.user.id },
      data: { nickname: trimmedNickname },
    });

    // Update in game
    try {
      await mcControl.setPlayerNickname(user.minecraftLink.mcUsername, trimmedNickname);
    } catch (e) {
      console.error("Failed to set nickname in game:", e);
      // Don't fail the request - DB is updated, game command might fail if player is offline
    }

    return NextResponse.json({
      success: true,
      nickname: trimmedNickname,
      message: "Nickname updated successfully",
    });
  } catch (error) {
    console.error("Failed to set nickname:", error);
    return NextResponse.json({ error: "Failed to set nickname" }, { status: 500 });
  }
}

// DELETE - Clear nickname
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        minecraftLink: true,
      },
    });

    if (!user?.minecraftLink) {
      return NextResponse.json({ error: "No Minecraft account linked" }, { status: 400 });
    }

    // Update in database
    await prisma.minecraftAccount.update({
      where: { userId: session.user.id },
      data: { nickname: null },
    });

    // Update in game
    try {
      await mcControl.clearPlayerNickname(user.minecraftLink.mcUsername);
    } catch (e) {
      console.error("Failed to clear nickname in game:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Nickname cleared",
    });
  } catch (error) {
    console.error("Failed to clear nickname:", error);
    return NextResponse.json({ error: "Failed to clear nickname" }, { status: 500 });
  }
}
