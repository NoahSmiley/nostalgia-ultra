import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ULTRA_TIER_THRESHOLD } from '@/config';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find active subscription (includes those scheduled to cancel at period end)
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      return NextResponse.json({ status: 'none' });
    }

    const now = new Date();

    // Lifetime subscriptions never expire
    if (!subscription.isLifetime) {
      // Check if subscription has expired (for cancelled ones or voucher-based)
      if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < now) {
        // Mark as expired if needed
        if (subscription.status === 'active') {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'expired' },
          });
        }
        return NextResponse.json({ status: 'none' });
      }
    }

    // Use the tier field if set, otherwise determine from amount (for legacy data)
    let tier = subscription.tier || 'member';
    if (!subscription.tier && subscription.monthlyAmount >= ULTRA_TIER_THRESHOLD) {
      tier = 'ultra';
    }

    // Convert cents to dollars for display (voucher subs have 0)
    const monthlyAmountDollars = subscription.monthlyAmount / 100;

    return NextResponse.json({
      status: subscription.status,
      tier,
      monthlyAmount: monthlyAmountDollars,
      currentPeriodEnd: subscription.currentPeriodEnd,
      stripeSubId: subscription.stripeSubId,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      isLifetime: subscription.isLifetime,
      isVoucher: !!subscription.voucherId,
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}