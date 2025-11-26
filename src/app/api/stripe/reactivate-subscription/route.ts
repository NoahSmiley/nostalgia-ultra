import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

// POST - Reactivate a subscription that's scheduled to cancel
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeSubId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Remove the cancel_at_period_end flag
    await stripe.subscriptions.update(subscription.stripeSubId, {
      cancel_at_period_end: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
}
