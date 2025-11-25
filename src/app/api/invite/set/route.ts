import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();

    // Validate the code exists and is usable
    const inviteCode = await prisma.inviteCode.findUnique({
      where: { code: normalizedCode },
    });

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    if (!inviteCode.active) {
      return NextResponse.json(
        { error: "This invite code has been deactivated" },
        { status: 400 }
      );
    }

    if (inviteCode.uses >= inviteCode.maxUses) {
      return NextResponse.json(
        { error: "This invite code has reached its maximum uses" },
        { status: 400 }
      );
    }

    // Set the cookie
    const cookieStore = await cookies();
    cookieStore.set("invite_code", normalizedCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 30, // 30 minutes
      path: "/",
    });

    return NextResponse.json({ success: true, code: normalizedCode });
  } catch (error) {
    console.error("Set invite code error:", error);
    return NextResponse.json(
      { error: "Failed to set invite code" },
      { status: 500 }
    );
  }
}
