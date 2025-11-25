"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function LandingCta() {
  return (
    <section
      className="bg-white section-padding-y"
      aria-labelledby="cta-heading"
    >
      <div className="container-padding-x container mx-auto">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
          {/* Heading */}
          <h2 id="cta-heading" className="heading-lg text-black">
            Ready to start your adventure?
          </h2>

          {/* Description */}
          <p className="text-black/70 text-lg">
            Join our growing community of players today. Sign up takes less than a minute.
          </p>

          {/* CTA Button */}
          <Link href="/login">
            <Button
              size="lg"
              className="bg-black text-white hover:bg-black/90 px-8"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
