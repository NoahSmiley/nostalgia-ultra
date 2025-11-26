import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

// POST - Create a setup intent for adding a new payment method
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

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Create a setup intent for collecting payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: subscription.stripeCustomerId,
      payment_method_types: ['card'],
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (error) {
    console.error('Update payment method error:', error);
    return NextResponse.json(
      { error: 'Failed to create setup intent' },
      { status: 500 }
    );
  }
}

// PUT - Set a payment method as default
export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { paymentMethodId } = await req.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID required' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Update customer's default payment method
    await stripe.customers.update(subscription.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Also update the subscription's default payment method
    if (subscription.stripeSubId) {
      await stripe.subscriptions.update(subscription.stripeSubId, {
        default_payment_method: paymentMethodId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set default payment method error:', error);
    return NextResponse.json(
      { error: 'Failed to set default payment method' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a payment method
export async function DELETE(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const paymentMethodId = searchParams.get('id');

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID required' },
        { status: 400 }
      );
    }

    // Detach the payment method from the customer
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove payment method error:', error);
    return NextResponse.json(
      { error: 'Failed to remove payment method' },
      { status: 500 }
    );
  }
}
