import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { mcControl } from '@/lib/mc-control';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

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

          // Get subscription data with type safety
          const subData = subscription as unknown as {
            id: string;
            status: string;
            current_period_end: number;
            items: { data: Array<{ price: { unit_amount: number | null } }> };
          };

          // Create or update subscription in database
          await prisma.subscription.upsert({
            where: {
              stripeCustomerId: session.customer as string,
            },
            create: {
              userId: session.metadata?.userId!,
              stripeCustomerId: session.customer as string,
              stripeSubId: subData.id,
              status: subData.status,
              monthlyAmount: subData.items.data[0].price.unit_amount || 0,
              currentPeriodEnd: new Date(subData.current_period_end * 1000),
            },
            update: {
              stripeSubId: subData.id,
              status: subData.status,
              monthlyAmount: subData.items.data[0].price.unit_amount || 0,
              currentPeriodEnd: new Date(subData.current_period_end * 1000),
            },
          });

          // Add user to Minecraft whitelist
          await addToWhitelist(session.metadata?.userId!);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subData = subscription as unknown as { id: string; status: string; current_period_end: number };

        await prisma.subscription.update({
          where: {
            stripeSubId: subData.id,
          },
          data: {
            status: subData.status,
            currentPeriodEnd: new Date(subData.current_period_end * 1000),
          },
        });

        // Handle status changes (e.g., remove from whitelist if canceled)
        if (subData.status === 'canceled' || subData.status === 'past_due') {
          const sub = await prisma.subscription.findUnique({
            where: { stripeSubId: subData.id },
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
        const deletedSubData = subscription as unknown as { id: string };

        const sub = await prisma.subscription.findUnique({
          where: { stripeSubId: deletedSubData.id },
          include: { user: true },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { stripeSubId: deletedSubData.id },
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
      const result = await mcControl.addToWhitelist(user.minecraftLink.mcUsername);
      console.log(`Added ${user.minecraftLink.mcUsername} to whitelist:`, result.message);
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
      const result = await mcControl.removeFromWhitelist(user.minecraftLink.mcUsername);
      console.log(`Removed ${user.minecraftLink.mcUsername} from whitelist:`, result.message);
    }
  } catch (error) {
    console.error('Failed to remove user from whitelist:', error);
  }
}
