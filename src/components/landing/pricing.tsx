"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Standard",
    price: "$10",
    period: "/month",
    description: "Full access to the server with all core features",
    features: [
      "Server whitelist access",
      "Play with the community",
      "Access to live Dynmap",
      "50+ curated mods included",
    ],
    highlighted: false,
    buttonText: "Get Standard",
    buttonVariant: "secondary" as const,
  },
  {
    name: "Ultra",
    price: "$15+",
    period: "/month",
    badge: "Best Value",
    description: "For dedicated players who want the full experience",
    features: [
      "Everything in Standard",
      "Ultra modpack with shaders",
      "Exclusive Ultra role",
      "Vote on server decisions",
      "Early access to new features",
    ],
    highlighted: true,
    buttonText: "Get Ultra",
    buttonVariant: "default" as const,
  },
];

export function LandingPricing() {
  return (
    <section
      id="pricing"
      className="bg-gradient-to-b from-black to-zinc-950 section-padding-y"
      aria-labelledby="pricing-heading"
    >
      <div className="container-padding-x container mx-auto">
        <div className="flex flex-col items-center gap-12">
          {/* Section Header */}
          <div className="flex flex-col items-center gap-4 text-center max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80">
              Pricing
            </div>
            <h2
              id="pricing-heading"
              className="heading-lg text-white"
            >
              Simple, transparent pricing
            </h2>
            <p className="text-white/60 text-base lg:text-lg">
              Choose the plan that works best for you. All plans include access to our community and support.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`bg-white/5 border-white/10 rounded-xl p-6 lg:p-8 ${
                  plan.highlighted ? "ring-2 ring-white" : ""
                }`}
              >
                <CardContent className="flex flex-col gap-6 p-0">
                  {/* Plan Header */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <h3 className={`text-xl font-semibold ${plan.highlighted ? "text-white" : "text-white/90"}`}>
                        {plan.name}
                      </h3>
                      {plan.badge && (
                        <Badge className="bg-white text-black">
                          {plan.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/60 text-sm">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-white/60 text-base pb-1">
                      {plan.period}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Link href="/login">
                    <Button
                      variant={plan.buttonVariant}
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-white text-black hover:bg-white/90"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>

                  {/* Features */}
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-white/80">
                      What's included:
                    </p>
                    <ul className="flex flex-col gap-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-white/70 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
