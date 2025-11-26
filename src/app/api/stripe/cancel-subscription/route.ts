import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

// POST - Cancel subscription (at period end by default)
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { immediate } = await req.json().catch(() => ({ immediate: false }));

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: 'active' },
    });

    if (!subscription?.stripeSubId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (immediate) {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscription.stripeSubId);

      // Update local DB immediately
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'canceled' },
      });
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(subscription.stripeSubId, {
        cancel_at_period_end: true,
      });

      // Update local DB immediately so UI reflects the change
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { cancelAtPeriodEnd: true },
      });
    }

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: !immediate,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
