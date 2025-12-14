"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { PRICING, LINKS } from "@/config";

export default function PricingPage() {
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
          href={LINKS.discord}
          target="_blank"
          className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          Questions? Contact us on Discord <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

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
              <span className="text-foreground font-medium">{PRICING.member.priceDisplay}</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 mt-8 rounded-full"
            onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard/subscription" })}
          >
            Get Started
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
              <span className="text-foreground font-medium">{PRICING.ultra.priceShort}</span>
            </div>
            <p className="text-xs text-muted-foreground">Minimum {PRICING.ultra.minPriceDisplay}/month</p>
          </div>

          <Button
            className="w-full h-11 mt-8 rounded-full"
            onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard/subscription" })}
          >
            Get Started
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

      <Separator className="my-12" />

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium text-foreground mb-2">Can I cancel anytime?</h3>
            <p className="text-muted-foreground">
              Yes! You can cancel your subscription at any time. You'll keep access until the end of your billing period.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">Is this pay-to-win?</h3>
            <p className="text-muted-foreground">
              No. All players get the same gameplay experience. Higher tiers only unlock cosmetic perks and support the server.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards through Stripe. Your payment information is never stored on our servers.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">What happens if I stop paying?</h3>
            <p className="text-muted-foreground">
              You'll lose server access but your builds and items are safe. Resubscribe anytime to pick up where you left off.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">Do I need to own Minecraft?</h3>
            <p className="text-muted-foreground">
              Yes, you need Minecraft Java Edition. We verify ownership through your Microsoft account.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">Where do the funds go?</h3>
            <p className="text-muted-foreground">
              Subscription fees cover server hosting, maintenance, and domain costs. Any extra goes back into improving the server.
            </p>
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
          <Button
            onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard/subscription" })}
          >
            Sign In to Subscribe <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
