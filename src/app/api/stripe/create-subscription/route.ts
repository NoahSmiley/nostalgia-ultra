import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe, SUBSCRIPTION_TIERS, ULTRA_PRICE_IDS } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tier, amount } = await req.json();

    if (!tier || !SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Get the price ID
    let priceId: string | undefined;

    if (tier === 'ultra') {
      // Try specific amount price first, fall back to default ultra price
      priceId = amount ? ULTRA_PRICE_IDS[amount] : undefined;
      if (!priceId) {
        priceId = process.env.STRIPE_ULTRA_PRICE_ID;
      }
    } else {
      priceId = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS].priceId;
    }

    if (!priceId) {
      console.error('Price not configured for tier:', tier, 'amount:', amount);
      return NextResponse.json(
        { error: 'Price not configured. Please contact support.' },
        { status: 500 }
      );
    }

    console.log('Using price ID:', priceId, 'for tier:', tier);

    // Get user and existing subscription
    const existingSub = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    let customerId = existingSub?.stripeCustomerId;

    // Check if user already has an active subscription (not scheduled to cancel)
    if (existingSub?.stripeSubId && existingSub.status === 'active' && !existingSub.cancelAtPeriodEnd) {
      // Allow upgrades from member to ultra, or changing ultra amount
      // Note: monthlyAmount in DB is stored in cents, amount from frontend is in dollars
      const currentAmountDollars = existingSub.monthlyAmount / 100;

      // Determine current tier - use tier field if set, otherwise infer from amount
      // $12+ is ultra, $10 is member (legacy data may not have tier field set)
      const currentTier = existingSub.tier || (currentAmountDollars >= 12 ? 'ultra' : 'member');

      const isUpgrade = currentTier === 'member' && tier === 'ultra';
      const isUltraChange = currentTier === 'ultra' && tier === 'ultra' && amount !== currentAmountDollars;
      const isDowngrade = currentTier === 'ultra' && tier === 'member';

      if (isUpgrade || isUltraChange || isDowngrade) {
        console.log('Changing subscription:', existingSub.stripeSubId, 'from', existingSub.tier, 'to', tier);

        // Get the current subscription from Stripe
        const currentSub = await stripe.subscriptions.retrieve(existingSub.stripeSubId);

        // Update the subscription with the new price
        const updatedSub = await stripe.subscriptions.update(existingSub.stripeSubId, {
          items: [{
            id: currentSub.items.data[0].id,
            price: priceId,
          }],
          proration_behavior: 'create_prorations', // Prorate the change
          metadata: {
            userId: session.user.id,
            tier,
            amount: amount?.toString() || '',
          },
        });

        // Update our database (store amount in cents)
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            tier,
            monthlyAmount: tier === 'ultra' ? amount * 100 : 1000,
          },
        });

        return NextResponse.json({
          upgraded: true,
          subscriptionId: updatedSub.id,
        });
      }

      console.log('User already has active subscription:', existingSub.stripeSubId);
      return NextResponse.json(
        { error: 'You already have an active subscription at this tier' },
        { status: 400 }
      );
    }

    // Check if user has an active subscription that's scheduled to cancel - reactivate it
    if (existingSub?.stripeSubId && existingSub.status === 'active' && existingSub.cancelAtPeriodEnd) {
      console.log('Reactivating cancelled subscription:', existingSub.stripeSubId);

      // Un-cancel the subscription in Stripe
      const reactivatedSub = await stripe.subscriptions.update(existingSub.stripeSubId, {
        cancel_at_period_end: false,
      });

      // Update our database immediately
      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: { cancelAtPeriodEnd: false },
      });

      return NextResponse.json({
        reactivated: true,
        subscriptionId: reactivatedSub.id,
      });
    }

    // Create or get Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;
    }

    // Create the subscription with payment_behavior: 'default_incomplete'
    // This creates the subscription but doesn't charge until payment is confirmed
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
      metadata: {
        userId: session.user.id,
        tier,
        amount: amount?.toString() || '',
      },
    });

    // Get the client secret from the payment intent on the invoice
    const invoice = subscription.latest_invoice as any;
    let clientSecret: string | undefined;

    console.log('Subscription created:', subscription.id);
    console.log('Invoice:', invoice?.id, 'status:', invoice?.status);
    console.log('Invoice payment_intent:', invoice?.payment_intent);

    // Check if payment intent exists on the expanded invoice
    if (invoice?.payment_intent?.client_secret) {
      clientSecret = invoice.payment_intent.client_secret;
    } else if (invoice?.id && !invoice?.payment_intent) {
      // Invoice exists but no payment intent - create a payment intent for the invoice
      // This can happen with certain Stripe API versions
      console.log('Creating payment intent for invoice...');

      const paymentIntent = await stripe.paymentIntents.create({
        amount: invoice.amount_due,
        currency: invoice.currency,
        customer: customerId,
        metadata: {
          invoice_id: invoice.id,
          subscription_id: subscription.id,
          userId: session.user.id,
          tier,
        },
        setup_future_usage: 'off_session',
      });

      clientSecret = paymentIntent.client_secret!;
    }

    // Fallback to pending setup intent for $0 trials
    if (!clientSecret && subscription.pending_setup_intent) {
      const setupIntent = subscription.pending_setup_intent as any;
      clientSecret = setupIntent.client_secret;
    }

    if (!clientSecret) {
      console.error('No client secret found. Invoice:', JSON.stringify(invoice, null, 2));
      return NextResponse.json(
        { error: 'Failed to create payment intent' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
      customerId,
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
