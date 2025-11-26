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

      case 'invoice.paid': {
        // Handle successful payment for subscriptions (including embedded flow)
        const invoice = event.data.object as Stripe.Invoice;

        // Only process subscription invoices
        if (invoice.subscription && invoice.billing_reason === 'subscription_create') {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );

          const subData = subscription as unknown as {
            id: string;
            status: string;
            current_period_end: number;
            metadata: { userId?: string; tier?: string; amount?: string };
            items: { data: Array<{ price: { unit_amount: number | null } }> };
          };

          const userId = subData.metadata?.userId;
          if (!userId) {
            console.error('No userId in subscription metadata');
            break;
          }

          // Create or update subscription in database
          await prisma.subscription.upsert({
            where: {
              stripeCustomerId: invoice.customer as string,
            },
            create: {
              userId,
              stripeCustomerId: invoice.customer as string,
              stripeSubId: subData.id,
              status: 'active',
              monthlyAmount: subData.items.data[0].price.unit_amount || 0,
              currentPeriodEnd: new Date(subData.current_period_end * 1000),
            },
            update: {
              stripeSubId: subData.id,
              status: 'active',
              monthlyAmount: subData.items.data[0].price.unit_amount || 0,
              currentPeriodEnd: new Date(subData.current_period_end * 1000),
            },
          });

          console.log(`Subscription activated for user ${userId}`);

          // Add user to Minecraft whitelist
          await addToWhitelist(userId);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const subData = subscription as unknown as {
          id: string;
          status: string;
          current_period_end: number;
          cancel_at_period_end: boolean;
          customer: string;
          metadata: { userId?: string; tier?: string; amount?: string };
          items: { data: Array<{ price: { unit_amount: number | null }; current_period_end?: number }> };
        };

        const customerId = typeof subData.customer === 'string' ? subData.customer : (subData.customer as any).id;

        console.log(`Processing ${event.type} for subscription ${subData.id}, status: ${subData.status}, cancel_at_period_end: ${subData.cancel_at_period_end}`);

        // Get period end from subscription or items
        const periodEnd = subData.current_period_end || subData.items?.data?.[0]?.current_period_end;
        const periodEndDate = periodEnd ? new Date(periodEnd * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Check if subscription exists in database - try both stripeSubId and stripeCustomerId
        let existingSub = await prisma.subscription.findUnique({
          where: { stripeSubId: subData.id },
        });

        // Also try finding by customerId if not found by subId
        if (!existingSub) {
          existingSub = await prisma.subscription.findUnique({
            where: { stripeCustomerId: customerId },
          });
        }

        if (existingSub) {
          // Only update if this webhook is for the SAME Stripe subscription
          const isSameStripeSubscription = existingSub.stripeSubId === subData.id;

          // Don't let a different subscription's webhook overwrite our record
          if (!isSameStripeSubscription && existingSub.status === 'active') {
            console.log(`Skipping update - existing subscription ${existingSub.id} is active with different stripeSubId (${existingSub.stripeSubId} vs ${subData.id})`);
          } else {
            // Determine the status to use - don't downgrade from 'active' to 'incomplete' for same subscription
            // This can happen because Stripe's subscription status may not update immediately
            let newStatus = subData.status;
            if (isSameStripeSubscription && existingSub.status === 'active' && subData.status === 'incomplete') {
              // Keep it active - the payment succeeded, Stripe just hasn't updated yet
              newStatus = 'active';
              console.log(`Keeping subscription ${existingSub.id} as active (ignoring Stripe's incomplete status)`);
            }

            await prisma.subscription.update({
              where: { id: existingSub.id },
              data: {
                stripeSubId: subData.id,
                status: newStatus,
                currentPeriodEnd: periodEndDate,
                cancelAtPeriodEnd: subData.cancel_at_period_end || false,
                monthlyAmount: subData.items.data[0]?.price.unit_amount || existingSub.monthlyAmount,
              },
            });

            console.log(`Updated subscription ${existingSub.id} to status: ${newStatus}`);

            // If subscription became active, add to whitelist
            if (newStatus === 'active') {
              await addToWhitelist(existingSub.userId);
            }
          }
        } else if (subData.metadata?.userId) {
          // Create new subscription if we have userId (regardless of status)
          // The status will be updated as webhooks come in
          await prisma.subscription.create({
            data: {
              userId: subData.metadata.userId,
              stripeCustomerId: customerId,
              stripeSubId: subData.id,
              status: subData.status,
              monthlyAmount: subData.items.data[0]?.price.unit_amount || 0,
              currentPeriodEnd: periodEndDate,
              cancelAtPeriodEnd: subData.cancel_at_period_end || false,
            },
          });

          console.log(`Subscription created for user ${subData.metadata.userId} with status: ${subData.status}`);

          // Add user to Minecraft whitelist only if active
          if (subData.status === 'active') {
            await addToWhitelist(subData.metadata.userId);
          }
        }

        // Handle status changes (e.g., remove from whitelist if canceled)
        // Only remove from whitelist when subscription is actually canceled (not just scheduled to cancel)
        if (subData.status === 'canceled' || subData.status === 'past_due') {
          const sub = existingSub || await prisma.subscription.findUnique({
            where: { stripeSubId: subData.id },
          });

          if (sub) {
            await removeFromWhitelist(sub.userId);
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        // Handle successful payment intent (for embedded subscription flow)
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const piData = paymentIntent as unknown as {
          id: string;
          customer: string;
          metadata: {
            subscription_id?: string;
            userId?: string;
            tier?: string;
          };
        };

        console.log(`Payment intent succeeded: ${piData.id}`);
        console.log('Payment intent metadata:', piData.metadata);

        // If this payment is for a subscription, activate it
        if (piData.metadata?.subscription_id && piData.metadata?.userId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(piData.metadata.subscription_id);

            // Access subscription properties - try multiple paths for period_end
            const subAny = subscription as any;
            const currentPeriodEnd = subAny.current_period_end
              || subAny.items?.data?.[0]?.current_period_end
              || subAny.items?.data?.[0]?.period?.end;
            const subscriptionItems = subAny.items?.data;
            const monthlyAmount = subscriptionItems?.[0]?.price?.unit_amount || 0;

            console.log(`Extracted current_period_end: ${currentPeriodEnd}, monthlyAmount: ${monthlyAmount}`);

            // Create or update subscription in database
            const customerId = typeof piData.customer === 'string' ? piData.customer : (piData.customer as any)?.id;

            // Use a fallback date if current_period_end is not available (30 days from now)
            const periodEndDate = currentPeriodEnd && !isNaN(currentPeriodEnd)
              ? new Date(currentPeriodEnd * 1000)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            console.log(`Using periodEndDate: ${periodEndDate.toISOString()}`);

            await prisma.subscription.upsert({
              where: {
                stripeCustomerId: customerId,
              },
              create: {
                userId: piData.metadata.userId,
                stripeCustomerId: customerId,
                stripeSubId: subscription.id,
                status: 'active',
                monthlyAmount,
                currentPeriodEnd: periodEndDate,
              },
              update: {
                stripeSubId: subscription.id,
                status: 'active',
                monthlyAmount,
                currentPeriodEnd: periodEndDate,
              },
            });

            console.log(`Subscription activated via payment_intent.succeeded for user ${piData.metadata.userId}`);

            // Add user to Minecraft whitelist
            await addToWhitelist(piData.metadata.userId);
          } catch (error) {
            console.error('Failed to activate subscription from payment intent:', error);
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
