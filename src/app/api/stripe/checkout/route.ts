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

    const { tier, customAmount } = await req.json();

    if (!tier || !SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    const selectedTier = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];

    // Get the price ID
    let priceId: string | undefined;

    if (tier === 'ultra' && customAmount) {
      // Convert cents to dollars for lookup
      const amountInDollars = customAmount / 100;
      priceId = ULTRA_PRICE_IDS[amountInDollars];

      if (!priceId) {
        return NextResponse.json(
          { error: `Invalid Ultra tier amount: $${amountInDollars}` },
          { status: 400 }
        );
      }
    } else {
      priceId = selectedTier.priceId;
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured' },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscriptions: true }
    });

    let customerId = user?.subscriptions[0]?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/subscription`,
      metadata: {
        userId: session.user.id,
        tier,
        amount: customAmount?.toString() || '',
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}