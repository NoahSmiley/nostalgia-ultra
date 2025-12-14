import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mcControl } from "@/lib/mc-control";
import { getKnifeById } from "@/lib/knives";

// API secret for server-to-server authentication
const API_SECRET = process.env.MC_CONTROL_API_SECRET;

// POST - Called by MC Control when a player joins
// Gives the player their selected knife if they're an Ultra member
export async function POST(request: Request) {
  try {
    // Verify API secret
    const authHeader = request.headers.get("x-api-secret");
    if (!API_SECRET || authHeader !== API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { uuid, username, server } = body;

    if (!uuid || !username) {
      return NextResponse.json(
        { error: "UUID and username are required" },
        { status: 400 }
      );
    }

    // Find the Minecraft account by UUID
    const minecraftAccount = await prisma.minecraftAccount.findUnique({
      where: { mcUuid: uuid },
      include: {
        user: {
          include: {
            subscriptions: {
              where: { status: "active" },
            },
          },
        },
      },
    });

    if (!minecraftAccount) {
      return NextResponse.json({
        success: true,
        message: "No linked account found",
        actions: [],
      });
    }

    const actions: string[] = [];

    // Check if user has Ultra subscription and a selected knife
    const ultraSub = minecraftAccount.user.subscriptions.find(
      (sub) => sub.tier === "ultra"
    );

    if (ultraSub && minecraftAccount.selectedKnife) {
      const knife = getKnifeById(minecraftAccount.selectedKnife);

      if (knife) {
        try {
          // Give the knife to the player
          await mcControl.giveKnife(username, knife.itemId);
          actions.push(`Gave ${knife.name} to player`);
        } catch (error) {
          console.error("Failed to give knife:", error);
          actions.push(`Failed to give knife: ${error}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Player join handled",
      actions,
      player: {
        uuid,
        username,
        server,
        hasUltra: !!ultraSub,
        selectedKnife: minecraftAccount.selectedKnife,
      },
    });
  } catch (error) {
    console.error("Failed to handle player join:", error);
    return NextResponse.json(
      { error: "Failed to handle player join" },
      { status: 500 }
    );
  }
}
