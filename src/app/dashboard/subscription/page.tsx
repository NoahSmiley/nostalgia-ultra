"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Crown, AlertCircle, CreditCard, Loader2, ExternalLink, ArrowRight, ArrowLeft, Ticket, Infinity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Brand } from "@/components/brand";
import { StripeProvider } from "@/components/stripe-provider";
import { PaymentForm } from "@/components/payment-form";
import { BillingManagement } from "@/components/billing-management";
import { LINKS, PRICING } from "@/config";

const ULTRA_AMOUNTS = PRICING.ultra.priceOptions;

type CheckoutState = {
  tier: string;
  amount: number;
  clientSecret: string;
} | null;

type SubscriptionData = {
  status: string;
  tier?: string;
  monthlyAmount?: number;
  currentPeriodEnd?: string;
  stripeSubId?: string;
  cancelAtPeriodEnd?: boolean;
  isLifetime?: boolean;
  isVoucher?: boolean;
} | null;

function SubscriptionContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedUltraAmount, setSelectedUltraAmount] = useState<number>(12);
  const [checkout, setCheckout] = useState<CheckoutState>(null);
  const [showBilling, setShowBilling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [redeemingVoucher, setRedeemingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  const successParam = searchParams.get('success') === 'true';
  const billingParam = searchParams.get('billing') === 'true';
  const hasHandledSuccess = useRef(false);

  useEffect(() => {
    // Don't fetch on initial load if we're handling success param
    if (!successParam) {
      fetchSubscription();
    }
  }, []);

  // Handle success param - show message, clear URL, and confirm subscription
  useEffect(() => {
    if (successParam && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      setShowSuccess(true);
      setInitialLoading(false); // Make sure we're not showing skeleton

      // Clear the URL params
      router.replace('/dashboard/subscription', { scroll: false });

      // Try to confirm the subscription directly (backup for webhook)
      const confirmAndPoll = async () => {
        try {
          // First fetch to see if we have a subscription with stripeSubId
          const subRes = await fetch('/api/subscription');
          if (subRes.ok) {
            const subData = await subRes.json();
            if (subData.status === 'active') {
              setSubscription(subData);
              return; // Already active, no need to confirm
            }

            // If we have a stripeSubId but not active, try to confirm it
            if (subData.stripeSubId) {
              console.log('Attempting to confirm subscription:', subData.stripeSubId);
              const confirmRes = await fetch('/api/stripe/confirm-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionId: subData.stripeSubId }),
              });

              if (confirmRes.ok) {
                const confirmData = await confirmRes.json();
                console.log('Confirm result:', confirmData);
                if (confirmData.status === 'active') {
                  await fetchSubscription();
                  return;
                }
              }
            }
          }
        } catch (err) {
          console.error('Failed to confirm subscription:', err);
        }

        // Poll for subscription status (webhook may take a moment to process)
        let attempts = 0;
        const maxAttempts = 10;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const res = await fetch('/api/subscription');
            if (res.ok) {
              const data = await res.json();
              console.log('Polling subscription, attempt', attempts, ':', data);
              if (data.status === 'active') {
                setSubscription(data);
                clearInterval(pollInterval);
              }
            }
          } catch (err) {
            console.error('Failed to poll subscription:', err);
          }

          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            // Final fetch attempt
            fetchSubscription();
          }
        }, 1000); // Poll every 1 second
      };

      confirmAndPoll();
    }
  }, [successParam]);

  // Open billing management if returning from payment method setup
  useEffect(() => {
    if (billingParam) {
      setShowBilling(true);
      // Clear the URL params
      router.replace('/dashboard/subscription', { scroll: false });
    }
  }, [billingParam]);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription');
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubscribe = async (tierId: string, amount: number) => {
    setLoading(tierId);
    setError(null);

    try {
      const res = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierId,
          amount: tierId === 'ultra' ? amount : undefined
        }),
      });

      const data = await res.json();

      if (data.reactivated || data.upgraded) {
        // Subscription was reactivated (un-cancelled) or upgraded/changed
        setShowCancelled(false);
        setShowSuccess(true);
        await fetchSubscription();
      } else if (data.clientSecret) {
        setCheckout({
          tier: tierId,
          amount,
          clientSecret: data.clientSecret,
        });
      } else {
        setError(data.error || 'Failed to create subscription');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleManage = () => {
    setShowBilling(true);
  };

  const handleRedeemVoucher = async () => {
    if (!voucherCode.trim()) return;

    setRedeemingVoucher(true);
    setVoucherError(null);
    setVoucherSuccess(null);

    try {
      const res = await fetch('/api/voucher/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        setVoucherCode("");
        setCheckout(null); // Close checkout view
        setShowSuccess(true);
        await fetchSubscription();
      } else {
        setVoucherError(data.error || 'Failed to redeem voucher');
      }
    } catch {
      setVoucherError('Something went wrong. Please try again.');
    } finally {
      setRedeemingVoucher(false);
    }
  };

  // Helper to determine button text based on current subscription
  const getButtonText = (tierId: string, amount: number) => {
    if (!subscription || subscription.status !== 'active') {
      return tierId === 'member' ? 'Subscribe' : `Subscribe $${amount}/mo`;
    }

    const currentTier = subscription.tier;
    const currentAmount = subscription.monthlyAmount || 0;
    const isCancelling = subscription.cancelAtPeriodEnd;

    // For voucher or lifetime subscriptions, show "Current Plan" for matching tier
    if (subscription.isVoucher || subscription.isLifetime) {
      if (currentTier === tierId) {
        return 'Current Plan';
      }
      // Can't change a voucher/lifetime subscription via Stripe
      return tierId === 'member' ? 'Subscribe' : `Subscribe $${amount}/mo`;
    }

    if (tierId === 'member') {
      if (currentTier === 'member') {
        return isCancelling ? 'Resubscribe' : 'Current Plan';
      }
      return 'Downgrade';
    }

    if (tierId === 'ultra') {
      if (currentTier === 'member') return `Upgrade $${amount}/mo`;
      if (currentTier === 'ultra') {
        if (amount === currentAmount) {
          return isCancelling ? `Resubscribe $${amount}/mo` : 'Current Plan';
        }
        if (amount > currentAmount) return `Upgrade to $${amount}/mo`;
        return `Change to $${amount}/mo`;
      }
    }

    return 'Subscribe';
  };

  const isCurrentPlan = (tierId: string, amount?: number) => {
    if (!subscription || subscription.status !== 'active') return false;
    // If subscription is cancelling, don't treat it as "current plan" (allow resubscribe)
    if (subscription.cancelAtPeriodEnd) return false;
    // For voucher subscriptions, just match the tier (no amount comparison since it's $0)
    if (subscription.isVoucher || subscription.isLifetime) {
      return subscription.tier === tierId;
    }
    if (tierId === 'member' && subscription.tier === 'member') return true;
    if (tierId === 'ultra' && subscription.tier === 'ultra' && amount === subscription.monthlyAmount) return true;
    return false;
  };

  // Initial Loading State
  if (initialLoading) {
    return <SubscriptionSkeleton />;
  }

  // Payment Form View
  if (checkout) {
    return (
      <div className="w-full max-w-lg mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setCheckout(null)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to plans
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-foreground mb-3">
            Complete your subscription
          </h1>
          <p className="text-muted-foreground">
            {checkout.tier === 'member' ? 'Standard' : 'Ultra'} plan - ${checkout.amount}/month
          </p>
        </div>

        {/* Payment Form */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <StripeProvider clientSecret={checkout.clientSecret}>
            <PaymentForm
              tier={checkout.tier}
              amount={checkout.amount}
              onCancel={() => setCheckout(null)}
            />
          </StripeProvider>
        </div>

        {/* Voucher Code Section */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Ticket className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-foreground">Have a voucher code?</span>
            </div>

            {voucherError && (
              <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {voucherError}
              </div>
            )}

            {voucherSuccess && (
              <div className="mb-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {voucherSuccess}
              </div>
            )}

            <div className="flex gap-2 max-w-xs mx-auto">
              <Input
                type="text"
                placeholder="XXXX-XXXX"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                className="h-10 font-mono text-center tracking-wider text-sm"
                maxLength={9}
              />
              <Button
                onClick={handleRedeemVoucher}
                disabled={redeemingVoucher || !voucherCode.trim()}
                variant="outline"
                className="h-10 px-4"
              >
                {redeemingVoucher ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Redeem'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Billing Management View
  if (showBilling) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setShowBilling(false)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to subscription
        </button>

        {/* Billing Management */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <BillingManagement
            onClose={() => setShowBilling(false)}
            onSubscriptionCancelled={async () => {
              setShowBilling(false);
              setShowSuccess(false); // Clear success message
              setShowCancelled(true); // Show cancelled message
              await fetchSubscription();
            }}
          />
        </div>
      </div>
    );
  }

  // Main View - Shows both current subscription info AND pricing cards
  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-normal text-foreground mb-6">
          {subscription?.status === 'active' ? 'Your Subscription' : 'Subscription Plans'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          {subscription?.status === 'active'
            ? <>Manage your <Brand /> membership and billing details.</>
            : <>Get full access to <Brand /> with a subscription plan that works for you.</>
          }
        </p>
        {subscription?.status !== 'active' && (
          <Link
            href={LINKS.discord}
            target="_blank"
            className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            Questions? Contact us on Discord <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Alerts */}
      {showSuccess && (
        <div className="mb-8 p-5 rounded-xl border border-green-500/20 bg-green-500/10 flex gap-3 max-w-3xl mx-auto">
          <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-green-200 font-medium">Subscription successful!</p>
            <p className="text-green-200/80">You now have full access to the server.</p>
          </div>
        </div>
      )}

      {showCancelled && (
        <div className="mb-8 p-5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 flex gap-3 max-w-3xl mx-auto">
          <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-200 font-medium">Subscription cancelled</p>
            <p className="text-yellow-200/80">You&apos;ll keep access until the end of your billing period.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-5 rounded-xl border border-red-500/20 bg-red-500/10 flex gap-3 max-w-3xl mx-auto">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {!session?.user?.minecraftLinked && subscription?.status !== 'active' && (
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

      {/* Current Subscription Card (if active) */}
      {subscription?.status === 'active' && (
        <div className="max-w-3xl mx-auto mb-12">
          <div className={`rounded-2xl border bg-card p-8 ${
            subscription.isLifetime ? 'border-amber-500/30' : subscription.cancelAtPeriodEnd ? 'border-yellow-500/30' : 'border-primary/30'
          }`}>
            <div className="flex items-start gap-4 mb-6">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                subscription.isLifetime ? 'bg-amber-500/20' : subscription.cancelAtPeriodEnd ? 'bg-yellow-500/20' : 'bg-primary/20'
              }`}>
                {subscription.isLifetime ? (
                  <Infinity className="h-7 w-7 text-amber-400" />
                ) : (
                  <Crown className={`h-7 w-7 ${subscription.cancelAtPeriodEnd ? 'text-yellow-400' : 'text-primary'}`} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-semibold text-foreground">
                    {subscription.tier === 'ultra' ? 'Ultra' : 'Standard'} Membership
                  </h2>
                  {subscription.isLifetime ? (
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">
                      Lifetime
                    </span>
                  ) : subscription.cancelAtPeriodEnd ? (
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
                      Cancelling
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                      Active
                    </span>
                  )}
                  {subscription.isVoucher && !subscription.isLifetime && (
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400">
                      Voucher
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {subscription.isLifetime ? (
                    <>Never expires · Enjoy your permanent access!</>
                  ) : subscription.cancelAtPeriodEnd ? (
                    <>Access ends {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}</>
                  ) : subscription.isVoucher ? (
                    <>Access until {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}</>
                  ) : (
                    <>${subscription.monthlyAmount}/month · Renews {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              {!subscription.isLifetime && !subscription.isVoucher && (
                <Button
                  onClick={handleManage}
                  variant="outline"
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Manage Billing
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {subscription?.status === 'active' ? 'Change your plan' : 'Membership tiers'}
        </h2>
        <p className="text-muted-foreground">
          {subscription?.status === 'active'
            ? 'Upgrade or change your subscription at any time.'
            : 'Choose a plan that fits your needs. All plans include full server access.'
          }
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {/* Standard Tier */}
        <div className={`rounded-2xl border bg-card p-8 flex flex-col ${
          isCurrentPlan('member') ? 'border-primary/50' : 'border-border'
        }`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Standard</h3>
              <p className="text-muted-foreground text-sm">
                Full access to the <Brand /> experience with all core features.
              </p>
            </div>
            {isCurrentPlan('member') && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary shrink-0">
                Current
              </span>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monthly</span>
              <span className="text-foreground font-medium">$10.00</span>
            </div>
          </div>

          <Button
            variant={isCurrentPlan('member') ? "secondary" : "outline"}
            className="w-full h-11 mt-8 rounded-full"
            onClick={() => handleSubscribe('member', 10)}
            disabled={loading === 'member' || isCurrentPlan('member')}
          >
            {loading === 'member' ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
            ) : (
              getButtonText('member', 10)
            )}
          </Button>
        </div>

        {/* Ultra Tier */}
        <div className={`rounded-2xl border bg-card p-8 flex flex-col ${
          subscription?.tier === 'ultra' ? 'border-primary/50' : 'border-border'
        }`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Ultra</h3>
              <p className="text-muted-foreground text-sm">
                For dedicated supporters who want extra benefits and recognition.
              </p>
            </div>
            {subscription?.tier === 'ultra' && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary shrink-0">
                Current
              </span>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-4 flex-1">
            <span className="text-muted-foreground text-sm">Choose your amount</span>
            <div className="flex flex-wrap gap-2">
              {ULTRA_AMOUNTS.map((amount) => {
                const isCurrent = subscription?.tier === 'ultra' && subscription?.monthlyAmount === amount;
                return (
                  <button
                    key={amount}
                    onClick={() => setSelectedUltraAmount(amount)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors relative ${
                      selectedUltraAmount === amount
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    ${amount}
                    {isCurrent && selectedUltraAmount !== amount && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>

          <Button
            variant={isCurrentPlan('ultra', selectedUltraAmount) ? "secondary" : "default"}
            className="w-full h-11 mt-8 rounded-full"
            onClick={() => handleSubscribe('ultra', selectedUltraAmount)}
            disabled={loading === 'ultra' || isCurrentPlan('ultra', selectedUltraAmount)}
          >
            {loading === 'ultra' ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
            ) : (
              getButtonText('ultra', selectedUltraAmount)
            )}
          </Button>
        </div>
      </div>

      <Separator className="my-12" />

      {/* What's Included Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">What's included</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Standard Features */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Standard</h3>
            <ul className="space-y-3">
              {[
                "Full server access",
                "Access to all worlds & dimensions",
                "125+ curated mods included",
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
                "Ultra modpack with shaders & enhancements",
                "Ultra role & exclusive perks",
                "Vote on server decisions",
                "Early access to new features",
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
      <div className="mb-16 text-center">
        <Skeleton className="h-14 md:h-16 w-72 md:w-96 mx-auto mb-6" />
        <Skeleton className="h-6 w-80 md:w-[32rem] mx-auto max-w-full mb-8" />
        <Skeleton className="h-5 w-64 mx-auto" />
      </div>

      {/* Section header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Cards skeleton */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <Skeleton className="h-px w-full my-4" />
            <div className="flex justify-between items-center mb-8">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-11 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Separator skeleton */}
      <Skeleton className="h-px w-full my-12" />

      {/* Features section skeleton */}
      <div className="mb-16">
        <Skeleton className="h-8 w-40 mb-8" />
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2].map((col) => (
            <div key={col}>
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
