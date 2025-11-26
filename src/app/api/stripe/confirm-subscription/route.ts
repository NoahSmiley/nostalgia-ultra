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
    let stripeSubscription;
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    } catch (stripeError: any) {
      console.error('Failed to retrieve subscription from Stripe:', stripeError.message);
      // If we can't reach Stripe, try to activate based on DB record
      const existingSub = await prisma.subscription.findFirst({
        where: { userId: session.user.id, stripeSubId: subscriptionId },
      });
      if (existingSub && existingSub.status === 'incomplete') {
        // Assume payment went through since user was redirected with success=true
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: { status: 'active' },
        });
        await addToWhitelist(session.user.id);
        return NextResponse.json({ status: 'active', message: 'Subscription activated (Stripe unreachable)' });
      }
      throw stripeError;
    }

    const subAny = stripeSubscription as any;

    console.log('Stripe subscription status:', subAny.status);

    // Accept both 'active' and 'trialing' as valid statuses
    // Also accept 'incomplete' if payment_intent is succeeded (payment went through but status not updated yet)
    const isActive = subAny.status === 'active' || subAny.status === 'trialing';

    if (!isActive) {
      // Check if the latest invoice was paid - if so, we can activate
      const latestInvoice = subAny.latest_invoice;
      let invoicePaid = false;

      if (typeof latestInvoice === 'string') {
        try {
          const invoice = await stripe.invoices.retrieve(latestInvoice);
          invoicePaid = invoice.status === 'paid';
          console.log('Invoice status:', invoice.status);
        } catch (e) {
          console.log('Could not retrieve invoice');
        }
      } else if (latestInvoice?.status === 'paid') {
        invoicePaid = true;
      }

      if (!invoicePaid) {
        return NextResponse.json({
          status: subAny.status,
          message: 'Subscription is not yet active in Stripe',
        });
      }

      console.log('Invoice is paid, activating subscription despite status:', subAny.status);
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
