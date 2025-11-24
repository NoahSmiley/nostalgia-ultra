import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  member: {
    name: 'Member',
    price: 1000, // $10.00 in cents
    priceId: process.env.STRIPE_MEMBER_PRICE_ID,
    features: [
      'Full server access',
      'Member role & perks',
      'Access to all worlds',
      'Community events',
    ],
  },
  ultra: {
    name: 'Ultra',
    price: 1500, // $15.00 minimum in cents
    minPrice: 1500,
    priceId: process.env.STRIPE_ULTRA_PRICE_ID,
    customAmount: true,
    features: [
      'Everything in Member tier',
      'Ultra role & exclusive perks',
      'Priority support',
      'Vote on server decisions',
      'Early access to updates',
      'Special recognition',
      'Custom donation amount',
    ],
  },
};