import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mcControl } from "@/lib/mc-control";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Voucher code is required" },
        { status: 400 }
      );
    }

    // Find the voucher
    const voucher = await prisma.subscriptionVoucher.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: "Invalid voucher code" },
        { status: 400 }
      );
    }

    // Check if voucher is active
    if (!voucher.active) {
      return NextResponse.json(
        { error: "This voucher has been deactivated" },
        { status: 400 }
      );
    }

    // Check if voucher has remaining uses
    if (voucher.uses >= voucher.maxUses) {
      return NextResponse.json(
        { error: "This voucher has already been fully redeemed" },
        { status: 400 }
      );
    }

    // Check if voucher has expired
    if (voucher.expiresAt && new Date() > voucher.expiresAt) {
      return NextResponse.json(
        { error: "This voucher has expired" },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    const existingSub = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "active",
      },
    });

    if (existingSub) {
      // If user has a lifetime subscription, don't allow another
      if (existingSub.isLifetime) {
        return NextResponse.json(
          { error: "You already have a lifetime subscription" },
          { status: 400 }
        );
      }

      // If user has a stripe subscription, don't allow voucher (they should manage via billing)
      if (existingSub.stripeSubId) {
        return NextResponse.json(
          { error: "You already have an active subscription. Please manage it through your billing settings." },
          { status: 400 }
        );
      }
    }

    // Calculate subscription end date
    let currentPeriodEnd: Date | null = null;
    const isLifetime = voucher.type === "lifetime";

    if (!isLifetime && voucher.durationDays) {
      currentPeriodEnd = new Date();
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + voucher.durationDays);
    }

    // Create the subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        status: "active",
        tier: voucher.tier,
        monthlyAmount: 0, // Voucher subscriptions are free
        currentPeriodEnd,
        isLifetime,
        voucherId: voucher.id,
      },
    });

    // Increment voucher uses
    await prisma.subscriptionVoucher.update({
      where: { id: voucher.id },
      data: { uses: voucher.uses + 1 },
    });

    // Add to whitelist if user has linked Minecraft account
    const minecraftAccount = await prisma.minecraftAccount.findUnique({
      where: { userId: session.user.id },
    });

    if (minecraftAccount) {
      try {
        await mcControl.addToWhitelist(minecraftAccount.mcUsername);
      } catch (whitelistError) {
        console.error("Failed to add to whitelist:", whitelistError);
        // Don't fail the redemption, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      subscription: {
        tier: subscription.tier,
        isLifetime: subscription.isLifetime,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    });
  } catch (error) {
    console.error("Failed to redeem voucher:", error);
    return NextResponse.json(
      { error: "Failed to redeem voucher" },
      { status: 500 }
    );
  }
}
