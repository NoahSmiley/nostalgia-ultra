import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AVAILABLE_KNIVES, isValidKnifeId, getKnifeById } from "@/lib/knives";

// GET - Get current knife selection and available knives
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

    // Check if user has Ultra subscription
    const ultraSub = user.subscriptions.find(sub => sub.tier === "ultra");
    const hasUltra = !!ultraSub;

    return NextResponse.json({
      selectedKnife: user.minecraftLink.selectedKnife,
      availableKnives: AVAILABLE_KNIVES,
      hasUltra,
    });
  } catch (error) {
    console.error("Failed to get knife selection:", error);
    return NextResponse.json({ error: "Failed to get knife selection" }, { status: 500 });
  }
}

// POST - Set knife selection (Ultra only)
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
    const ultraSub = user.subscriptions.find(sub => sub.tier === "ultra");
    if (!ultraSub) {
      return NextResponse.json(
        { error: "CS2 knives are only available for Ultra members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { knifeId } = body;

    if (!knifeId || typeof knifeId !== "string") {
      return NextResponse.json({ error: "Knife selection is required" }, { status: 400 });
    }

    // Validate knife ID
    if (!isValidKnifeId(knifeId)) {
      return NextResponse.json({ error: "Invalid knife selection" }, { status: 400 });
    }

    const knife = getKnifeById(knifeId);

    // Update in database
    await prisma.minecraftAccount.update({
      where: { userId: session.user.id },
      data: { selectedKnife: knifeId },
    });

    // Note: The knife will be given to the player when they join the server
    // This is handled by server-side logic that checks the player's selectedKnife

    return NextResponse.json({
      success: true,
      selectedKnife: knifeId,
      knifeName: knife?.name,
      message: "Knife selection saved! You'll receive it when you join the server.",
    });
  } catch (error) {
    console.error("Failed to set knife selection:", error);
    return NextResponse.json({ error: "Failed to set knife selection" }, { status: 500 });
  }
}

// DELETE - Clear knife selection
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
      data: { selectedKnife: null },
    });

    return NextResponse.json({
      success: true,
      message: "Knife selection cleared",
    });
  } catch (error) {
    console.error("Failed to clear knife selection:", error);
    return NextResponse.json({ error: "Failed to clear knife selection" }, { status: 500 });
  }
}
