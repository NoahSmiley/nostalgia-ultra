/**
 * Pricing Configuration
 * Central source of truth for subscription pricing
 *
 * Note: Actual Stripe price IDs are stored in environment variables.
 * This file contains display values and tier thresholds.
 */

export const PRICING = {
  member: {
    name: 'Member',
    price: 1000, // cents
    priceDisplay: '$10.00',
    priceShort: '$10',
    period: 'month',
    description: 'Full access to the server and community',
    features: [
      'Full server access',
      'Member role & perks',
      'Access to all worlds',
      'Community events',
    ],
  },
  ultra: {
    name: 'Ultra',
    minPrice: 1500, // cents (minimum)
    minPriceDisplay: '$15.00',
    priceShort: '$15+',
    period: 'month',
    description: 'Support the server with additional perks',
    features: [
      'Everything in Member tier',
      'Ultra role & exclusive perks',
      'Priority support',
      'Vote on server decisions',
      'Early access to updates',
      'Special recognition',
    ],
    // Available Ultra price options (in dollars)
    priceOptions: [12, 20, 25],
  },
} as const;

// Threshold for determining if a subscription is Ultra tier (in cents)
export const ULTRA_TIER_THRESHOLD = 1200;

// Helper to format cents as dollars
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Helper to format price for display
export function formatPriceShort(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}
