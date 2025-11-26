import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';

// GET - List all subscriptions with debug info
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Admin subscriptions error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

// POST - Sync subscription from Stripe or manually activate
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, userId, stripeCustomerId, stripeSubId } = body;

    if (action === 'sync_from_stripe' && stripeSubId) {
      // Fetch subscription from Stripe and sync to DB
      const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);

      const existingSub = await prisma.subscription.findUnique({
        where: { stripeSubId },
      });

      if (existingSub) {
        const updated = await prisma.subscription.update({
          where: { stripeSubId },
          data: {
            status: stripeSub.status,
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        });
        return NextResponse.json({ message: 'Subscription synced', subscription: updated });
      } else {
        return NextResponse.json({ error: 'Subscription not found in DB' }, { status: 404 });
      }
    }

    if (action === 'activate' && userId) {
      // Manually activate a user's subscription
      const sub = await prisma.subscription.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (sub) {
        const updated = await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'active' },
        });
        return NextResponse.json({ message: 'Subscription activated', subscription: updated });
      } else {
        return NextResponse.json({ error: 'No subscription found for user' }, { status: 404 });
      }
    }

    if (action === 'create_from_stripe' && stripeCustomerId) {
      // Look up customer's subscriptions in Stripe and create in DB
      const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
      const stripeSubs = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        limit: 1,
      });

      if (stripeSubs.data.length === 0) {
        return NextResponse.json({ error: 'No Stripe subscription found for customer' }, { status: 404 });
      }

      const stripeSub = stripeSubs.data[0];

      // Find user by Stripe customer ID or create subscription
      let existingSub = await prisma.subscription.findUnique({
        where: { stripeCustomerId },
      });

      if (!existingSub && userId) {
        existingSub = await prisma.subscription.create({
          data: {
            userId,
            stripeCustomerId,
            stripeSubId: stripeSub.id,
            status: stripeSub.status,
            monthlyAmount: stripeSub.items.data[0]?.price?.unit_amount || 0,
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        });
        return NextResponse.json({ message: 'Subscription created from Stripe', subscription: existingSub });
      } else if (existingSub) {
        const updated = await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            stripeSubId: stripeSub.id,
            status: stripeSub.status,
            monthlyAmount: stripeSub.items.data[0]?.price?.unit_amount || 0,
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        });
        return NextResponse.json({ message: 'Subscription updated from Stripe', subscription: updated });
      }
    }

    return NextResponse.json({ error: 'Invalid action or missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Admin subscription action error:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}
