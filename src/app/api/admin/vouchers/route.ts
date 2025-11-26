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
  return user?.isAdmin || user?.email === "noahsmiley123@outlook.com";
}

// Generate a voucher code (8 characters, uppercase with dashes)
function generateCode(): string {
  const part1 = nanoid(4).toUpperCase();
  const part2 = nanoid(4).toUpperCase();
  return `${part1}-${part2}`;
}

// GET - List all vouchers (admin only)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const vouchers = await prisma.subscriptionVoucher.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { displayName: true, email: true },
        },
        redemptions: {
          select: {
            user: {
              select: { displayName: true, email: true },
            },
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ vouchers });
  } catch (error) {
    console.error("Failed to fetch vouchers:", error);
    return NextResponse.json(
      { error: "Failed to fetch vouchers" },
      { status: 500 }
    );
  }
}

// POST - Create a new voucher (admin only)
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
    const {
      type = "time_limited", // "time_limited" or "lifetime"
      tier = "member", // "member" or "ultra"
      durationDays, // Required for time_limited
      maxUses = 1,
      note = "",
      expiresAt, // Optional expiration for the voucher code itself
    } = body;

    // Validate type
    if (!["time_limited", "lifetime"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid voucher type" },
        { status: 400 }
      );
    }

    // Validate tier
    if (!["member", "ultra"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 }
      );
    }

    // Require durationDays for time_limited vouchers
    if (type === "time_limited" && (!durationDays || durationDays < 1)) {
      return NextResponse.json(
        { error: "Duration is required for time-limited vouchers" },
        { status: 400 }
      );
    }

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.subscriptionVoucher.findUnique({ where: { code } });
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    const voucher = await prisma.subscriptionVoucher.create({
      data: {
        code,
        type,
        tier,
        durationDays: type === "lifetime" ? null : durationDays,
        maxUses,
        note: note || null,
        createdById: session.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        createdBy: {
          select: { displayName: true, email: true },
        },
        redemptions: {
          select: {
            user: {
              select: { displayName: true, email: true },
            },
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ voucher });
  } catch (error) {
    console.error("Failed to create voucher:", error);
    return NextResponse.json(
      { error: "Failed to create voucher" },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate a voucher (admin only)
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

    await prisma.subscriptionVoucher.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to deactivate voucher:", error);
    return NextResponse.json(
      { error: "Failed to deactivate voucher" },
      { status: 500 }
    );
  }
}
