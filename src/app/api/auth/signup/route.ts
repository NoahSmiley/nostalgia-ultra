import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, email, password, referralCode } = await req.json();

    // Validate input
    if (!username || !email || !password || !referralCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate referral code
    const validCode = await prisma.referralCode.findUnique({
      where: { code: referralCode },
    });

    if (!validCode) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      );
    }

    if (!validCode.active) {
      return NextResponse.json(
        { error: "This referral code is no longer active" },
        { status: 400 }
      );
    }

    if (validCode.uses >= validCode.maxUses) {
      return NextResponse.json(
        { error: "This referral code has reached its maximum uses" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          referralCodeId: validCode.id,
        },
      }),
      prisma.referralCode.update({
        where: { id: validCode.id },
        data: { uses: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
