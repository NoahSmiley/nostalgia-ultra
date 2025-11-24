"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Crown, Sparkles, Star, AlertCircle } from "lucide-react";

const tiers = [
  {
    id: 'member',
    name: 'Member',
    price: '$10',
    priceMonthly: '/month',
    icon: Star,
    features: [
      'Full server access',
      'Member role & perks',
      'Access to all worlds',
      'Community events',
    ],
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: '$15+',
    priceMonthly: '/month',
    minPrice: 15,
    customAmount: true,
    icon: Crown,
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
];

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(15);
  const [showCustomAmount, setShowCustomAmount] = useState<string | null>(null);

  const success = searchParams.get('success') === 'true';

  useEffect(() => {
    // Fetch current subscription status
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription');
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    }
  };

  const handleSubscribe = async (tierId: string) => {
    // For Ultra tier, check if custom amount is valid
    if (tierId === 'ultra' && customAmount < 15) {
      setError('Ultra tier requires a minimum of $15/month');
      return;
    }

    setLoading(tierId);
    setError(null);

    try {
      const body: any = { tier: tierId };

      // Include custom amount for ultra tier
      if (tierId === 'ultra') {
        body.customAmount = Math.round(customAmount * 100); // Convert to cents
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading('manage');
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError('Failed to open billing portal');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-zinc-400">
            Get access to the Nostalgia Ultra Minecraft server
          </p>
        </div>

        {success && (
          <Alert className="mb-8 border-green-500/20 bg-green-500/10">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-200">
              Subscription successful! You now have access to the server.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-8 border-red-500/20 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {!session?.user?.minecraftLinked && (
          <Alert className="mb-8 border-yellow-500/20 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-200">
              Please link your Minecraft account first to enable automatic whitelisting after subscription.
            </AlertDescription>
          </Alert>
        )}

        {subscription?.status === 'active' ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Active Subscription</CardTitle>
              <CardDescription>
                You have an active {subscription.tier} subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Your subscription renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
              <Button
                onClick={handleManage}
                disabled={loading === 'manage'}
              >
                {loading === 'manage' ? 'Loading...' : 'Manage Subscription'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card
                  key={tier.id}
                  className="relative"
                >
                  <CardHeader className="text-center">
                    <Icon className="h-12 w-12 mx-auto mb-4 text-white" />
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-white">{tier.price}</span>
                      <span className="text-zinc-400">{tier.priceMonthly}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <span className="text-zinc-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Custom amount input for Ultra tier */}
                    {tier.customAmount && (
                      <div className="mb-4 space-y-2">
                        <Label htmlFor={`amount-${tier.id}`} className="text-sm text-zinc-300">
                          Choose your monthly amount
                        </Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-zinc-400">$</span>
                          <Input
                            id={`amount-${tier.id}`}
                            type="number"
                            min={tier.minPrice}
                            value={customAmount}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || tier.minPrice;
                              setCustomAmount(Math.max(value, tier.minPrice));
                            }}
                            className="bg-zinc-900 border-zinc-700"
                            placeholder={`${tier.minPrice}+`}
                          />
                          <span className="text-zinc-400">/month</span>
                        </div>
                        {customAmount < tier.minPrice && (
                          <p className="text-xs text-yellow-500">
                            Minimum amount is ${tier.minPrice}
                          </p>
                        )}
                      </div>
                    )}

                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleSubscribe(tier.id)}
                      disabled={loading === tier.id}
                    >
                      {loading === tier.id ? 'Loading...' :
                        tier.customAmount ? `Subscribe for $${customAmount}/month` : 'Subscribe'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center text-sm text-zinc-500">
          <p>Secure payments processed by Stripe</p>
          <p className="mt-2">Cancel anytime from your billing portal</p>
        </div>
      </div>
    </div>
  );
}