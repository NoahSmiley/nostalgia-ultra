import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

// GET - Fetch billing info (payment methods, invoices)
export async function GET() {
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
      return NextResponse.json({ paymentMethods: [], invoices: [] });
    }

    // Fetch payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: subscription.stripeCustomerId,
      type: 'card',
    });

    // Fetch recent invoices
    const invoices = await stripe.invoices.list({
      customer: subscription.stripeCustomerId,
      limit: 5,
    });

    // Get customer default payment method
    const customer = await stripe.customers.retrieve(subscription.stripeCustomerId);
    const defaultPaymentMethodId = (customer as any).invoice_settings?.default_payment_method;

    return NextResponse.json({
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
        isDefault: pm.id === defaultPaymentMethodId,
      })),
      invoices: invoices.data.map((inv) => ({
        id: inv.id,
        number: inv.number,
        amount: inv.amount_paid / 100,
        currency: inv.currency,
        status: inv.status,
        date: inv.created * 1000,
        pdfUrl: inv.invoice_pdf,
        hostedUrl: inv.hosted_invoice_url,
      })),
      stripeSubId: subscription.stripeSubId,
    });
  } catch (error) {
    console.error('Billing fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing info' },
      { status: 500 }
    );
  }
}
