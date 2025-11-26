import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { mcControl } from '@/lib/mc-control';

// POST - Confirm a subscription after successful payment
// This is called by the frontend after returning from Stripe payment
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID required' },
        { status: 400 }
      );
    }

    console.log('Confirming subscription:', subscriptionId, 'for user:', session.user.id);

    // Fetch the subscription from Stripe to check its current status
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subAny = stripeSubscription as any;

    console.log('Stripe subscription status:', subAny.status);

    // Only activate if the Stripe subscription is active
    if (subAny.status !== 'active') {
      return NextResponse.json({
        status: subAny.status,
        message: 'Subscription is not yet active in Stripe',
      });
    }

    // Find the subscription in our database
    const existingSub = await prisma.subscription.findFirst({
      where: {
        OR: [
          { stripeSubId: subscriptionId },
          { userId: session.user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!existingSub) {
      // Create the subscription record if it doesn't exist
      const customerId = typeof subAny.customer === 'string' ? subAny.customer : subAny.customer?.id;
      const periodEnd = subAny.current_period_end;
      const monthlyAmount = subAny.items?.data?.[0]?.price?.unit_amount || 0;
      const tier = subAny.metadata?.tier || (monthlyAmount >= 1200 ? 'ultra' : 'member');

      await prisma.subscription.create({
        data: {
          userId: session.user.id,
          stripeCustomerId: customerId,
          stripeSubId: subscriptionId,
          status: 'active',
          tier,
          monthlyAmount,
          currentPeriodEnd: new Date(periodEnd * 1000),
        },
      });

      console.log('Created new subscription record with active status');

      // Add to whitelist
      await addToWhitelist(session.user.id);

      return NextResponse.json({
        status: 'active',
        message: 'Subscription activated',
      });
    }

    // Update existing subscription to active
    if (existingSub.status !== 'active') {
      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          stripeSubId: subscriptionId,
          status: 'active',
        },
      });

      console.log('Updated subscription to active status');

      // Add to whitelist
      await addToWhitelist(session.user.id);
    }

    return NextResponse.json({
      status: 'active',
      message: 'Subscription confirmed',
    });
  } catch (error: any) {
    console.error('Confirm subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm subscription' },
      { status: 500 }
    );
  }
}

// Helper function to add user to whitelist
async function addToWhitelist(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { minecraftLink: true },
    });

    if (user?.minecraftLink?.mcUsername) {
      const result = await mcControl.addToWhitelist(user.minecraftLink.mcUsername);
      console.log(`Added ${user.minecraftLink.mcUsername} to whitelist:`, result.message);
    }
  } catch (error) {
    console.error('Failed to add user to whitelist:', error);
  }
}
