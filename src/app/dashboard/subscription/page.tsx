"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Crown, AlertCircle, CreditCard, Loader2, ExternalLink, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Brand } from "@/components/brand";

function SubscriptionContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [customAmountInput, setCustomAmountInput] = useState<string>("15");

  const customAmount = parseFloat(customAmountInput) || 0;

  const success = searchParams.get('success') === 'true';

  useEffect(() => {
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
    if (tierId === 'ultra' && customAmount < 15) {
      setError('Ultra tier requires a minimum of $15/month');
      return;
    }

    setLoading(tierId);
    setError(null);

    try {
      const body: any = { tier: tierId };
      if (tierId === 'ultra') {
        body.customAmount = Math.round(customAmount * 100);
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

  // Active Subscription View
  if (subscription?.status === 'active') {
    return (
      <div className="w-full">
        {/* Hero */}
        <div className="mb-16">
          <p className="text-sm font-medium text-primary mb-4">Your Subscription</p>
          <h1 className="text-h1 text-foreground mb-6">
            You're all set
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Manage your <Brand /> membership and billing details.
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-8 p-5 rounded-xl border border-green-500/20 bg-green-500/10 flex gap-3">
            <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-green-200 font-medium">Subscription successful!</p>
              <p className="text-green-200/80">You now have full access to the server.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-5 rounded-xl border border-red-500/20 bg-red-500/10 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Active Subscription Card */}
        <div className="max-w-xl rounded-2xl border border-border bg-card p-8 mb-10">
          <div className="flex items-start gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20">
              <Crown className="h-7 w-7 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Active Subscription</h2>
              <p className="text-muted-foreground">
                You have an active {subscription.tier} membership
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Status</span>
              <span className="text-green-400 font-semibold">Active</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Plan</span>
              <span className="text-foreground font-semibold capitalize">{subscription.tier}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-muted-foreground">Renews</span>
              <span className="text-foreground">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
            </div>
          </div>

          <Button
            onClick={handleManage}
            disabled={loading === 'manage'}
            className="w-full h-12"
            size="lg"
          >
            {loading === 'manage' ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
            ) : (
              <><CreditCard className="mr-2 h-4 w-4" /> Manage Subscription</>
            )}
          </Button>
        </div>

        <p className="text-muted-foreground">
          Need help? Contact us on Discord for billing support.
        </p>
      </div>
    );
  }

  // Pricing Plans View - OpenAI Style
  return (
    <div className="w-full">
      {/* Hero - OpenAI Centered Style */}
      <div className="mb-20 text-center">
        <h1 className="text-5xl md:text-6xl font-normal text-foreground mb-6">
          Subscription Plans
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Get full access to <Brand /> with a subscription plan that works for you.
        </p>
        <Link
          href="https://discord.gg/nostalgraultra"
          target="_blank"
          className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          Questions? Contact us on Discord <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-8 p-5 rounded-xl border border-green-500/20 bg-green-500/10 flex gap-3 max-w-3xl mx-auto">
          <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-green-200 font-medium">Subscription successful!</p>
            <p className="text-green-200/80">You now have full access to the server.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-5 rounded-xl border border-red-500/20 bg-red-500/10 flex gap-3 max-w-3xl mx-auto">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {!session?.user?.minecraftLinked && (
        <div className="mb-8 p-5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 flex gap-3 max-w-3xl mx-auto">
          <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-200 font-medium">Link your Minecraft account first</p>
            <p className="text-yellow-200/80 mb-2">This enables automatic whitelisting when you subscribe.</p>
            <Link href="/dashboard/minecraft" className="text-yellow-300 hover:underline inline-flex items-center gap-1">
              Link Account <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Section Header - OpenAI Style */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Membership tiers</h2>
        <p className="text-muted-foreground">
          Choose a plan that fits your needs. All plans include full server access.
        </p>
      </div>

      {/* Pricing Cards Grid - OpenAI Style */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {/* Standard Tier */}
        <div className="rounded-2xl border border-border bg-card p-8 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-2">Standard</h3>
            <p className="text-muted-foreground text-sm">
              Full access to the <Brand /> experience with all core features.
            </p>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monthly</span>
              <span className="text-foreground font-medium">$10.00</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 mt-8 rounded-full"
            onClick={() => handleSubscribe('standard')}
            disabled={loading === 'standard'}
          >
            {loading === 'standard' ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
            ) : (
              'Subscribe'
            )}
          </Button>
        </div>

        {/* Ultra Tier */}
        <div className="rounded-2xl border border-border bg-card p-8 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-2">Ultra</h3>
            <p className="text-muted-foreground text-sm">
              For dedicated supporters who want extra benefits and recognition.
            </p>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monthly (custom)</span>
              <div className="flex items-center gap-1">
                <span className="text-foreground font-medium">$</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={customAmountInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setCustomAmountInput(value);
                    }
                  }}
                  onBlur={() => {
                    const num = parseFloat(customAmountInput);
                    if (isNaN(num) || num < 15) {
                      setCustomAmountInput("15");
                    }
                  }}
                  className="w-16 h-8 text-right font-medium"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Minimum $15/month</p>
          </div>

          <Button
            className="w-full h-11 mt-8 rounded-full"
            onClick={() => handleSubscribe('ultra')}
            disabled={loading === 'ultra'}
          >
            {loading === 'ultra' ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
            ) : (
              `Subscribe $${customAmount || 15}/mo`
            )}
          </Button>
        </div>
      </div>

      <Separator className="my-12" />

      {/* What's Included Section - OpenAI Style */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">What's included</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Standard Features */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Standard</h3>
            <ul className="space-y-3">
              {[
                "Full server access",
                "Standard role in Discord",
                "Access to all worlds & dimensions",
                "Land claiming system",
                "Economy & player shops",
                "Community events participation",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ultra Features */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Ultra</h3>
            <ul className="space-y-3">
              {[
                "Everything in Standard",
                "Ultra role & exclusive perks",
                "Priority support",
                "Vote on server decisions",
                "Early access to new features",
                "Custom cosmetic options",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-2xl border border-border bg-card/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-foreground font-medium">Secure payments by Stripe</p>
            <p className="text-muted-foreground text-sm">Cancel anytime from your account settings.</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/features" className="flex items-center gap-1">
              View all features <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SubscriptionSkeleton() {
  return (
    <div className="w-full">
      {/* Hero skeleton */}
      <div className="mb-20 text-center">
        <Skeleton className="h-14 w-80 mx-auto mb-6" />
        <Skeleton className="h-6 w-96 mx-auto max-w-full" />
      </div>

      {/* Cards skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-8">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-full mb-6" />
            <Skeleton className="h-px w-full my-4" />
            <div className="flex justify-between mb-8">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-11 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<SubscriptionSkeleton />}>
      <SubscriptionContent />
    </Suspense>
  );
}
