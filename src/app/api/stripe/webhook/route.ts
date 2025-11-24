import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // Create or update subscription in database
          await prisma.subscription.upsert({
            where: {
              stripeCustomerId: session.customer as string,
            },
            create: {
              userId: session.metadata?.userId!,
              stripeCustomerId: session.customer as string,
              stripeSubId: subscription.id,
              status: subscription.status,
              monthlyAmount: subscription.items.data[0].price.unit_amount || 0,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
              stripeSubId: subscription.id,
              status: subscription.status,
              monthlyAmount: subscription.items.data[0].price.unit_amount || 0,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });

          // TODO: Add user to Minecraft whitelist
          await addToWhitelist(session.metadata?.userId!);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.subscription.update({
          where: {
            stripeSubId: subscription.id,
          },
          data: {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        // Handle status changes (e.g., remove from whitelist if canceled)
        if (subscription.status === 'canceled' || subscription.status === 'past_due') {
          const sub = await prisma.subscription.findUnique({
            where: { stripeSubId: subscription.id },
            include: { user: true },
          });

          if (sub) {
            await removeFromWhitelist(sub.userId);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const sub = await prisma.subscription.findUnique({
          where: { stripeSubId: subscription.id },
          include: { user: true },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { stripeSubId: subscription.id },
            data: { status: 'canceled' },
          });

          await removeFromWhitelist(sub.userId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Helper functions for whitelist management
async function addToWhitelist(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { minecraftLink: true },
    });

    if (user?.minecraftLink?.mcUsername) {
      // TODO: Call MC Control microservice to add to whitelist
      console.log(`TODO: Add ${user.minecraftLink.mcUsername} to whitelist`);
    }
  } catch (error) {
    console.error('Failed to add user to whitelist:', error);
  }
}

async function removeFromWhitelist(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { minecraftLink: true },
    });

    if (user?.minecraftLink?.mcUsername) {
      // TODO: Call MC Control microservice to remove from whitelist
      console.log(`TODO: Remove ${user.minecraftLink.mcUsername} from whitelist`);
    }
  } catch (error) {
    console.error('Failed to remove user from whitelist:', error);
  }
}