import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

// Helper to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true, email: true },
  });

  // Check isAdmin flag or hardcoded admin email
  return user?.isAdmin || user?.email === "noahsmiley123@outlook.com";
}

// Generate a random invite code (6 characters, uppercase)
function generateCode(): string {
  return nanoid(6).toUpperCase();
}

// GET - List all invite codes (admin only)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invites = await prisma.inviteCode.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { displayName: true, email: true },
        },
        users: {
          select: { displayName: true, email: true, createdAt: true },
        },
      },
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error("Failed to fetch invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 }
    );
  }
}

// POST - Create a new invite code (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { maxUses = 1, note = "" } = body;

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.inviteCode.findUnique({ where: { code } });
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    const inviteCode = await prisma.inviteCode.create({
      data: {
        code,
        maxUses,
        note: note || null,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ inviteCode });
  } catch (error) {
    console.error("Failed to create invite:", error);
    return NextResponse.json(
      { error: "Failed to create invite code" },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate an invite code (admin only)
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.inviteCode.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to deactivate invite:", error);
    return NextResponse.json(
      { error: "Failed to deactivate invite code" },
      { status: 500 }
    );
  }
}
