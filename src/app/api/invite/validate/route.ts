import { NextResponse } from "next/server";
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

    const inviteCode = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!inviteCode) {
      return NextResponse.json(
        { valid: false, error: "Invalid invite code" },
        { status: 404 }
      );
    }

    if (!inviteCode.active) {
      return NextResponse.json(
        { valid: false, error: "This invite code has been deactivated" },
        { status: 400 }
      );
    }

    if (inviteCode.uses >= inviteCode.maxUses) {
      return NextResponse.json(
        { valid: false, error: "This invite code has reached its maximum uses" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: inviteCode.code,
    });
  } catch (error) {
    console.error("Invite validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate invite code" },
      { status: 500 }
    );
  }
}
