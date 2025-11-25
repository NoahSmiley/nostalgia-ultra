"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Download, ExternalLink } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "1",
    title: "Download Prism Launcher",
    description: "Get the free, open-source Minecraft launcher that makes modpack management easy.",
  },
  {
    number: "2",
    title: "Sign In to the Website",
    description: "Create your account and subscribe to get your Minecraft username whitelisted.",
  },
  {
    number: "3",
    title: "Install Modpack",
    description: "Use our one-click installer or paste the modpack URL in Prism Launcher.",
  },
  {
    number: "4",
    title: "Join the Server",
    description: "Connect to the server and start your adventure with our community!",
  },
];

export function LandingInstall() {
  return (
    <section
      id="install"
      className="bg-zinc-950 section-padding-y"
      aria-labelledby="install-heading"
    >
      <div className="container-padding-x container mx-auto">
        <div className="flex flex-col items-center gap-12">
          {/* Section Header */}
          <div className="flex flex-col items-center gap-4 text-center max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80">
              <Download className="h-4 w-4" />
              Getting Started
            </div>
            <h2
              id="install-heading"
              className="heading-lg text-white"
            >
              Ready to play in minutes
            </h2>
            <p className="text-white/60 text-base lg:text-lg">
              Our simple setup process gets you into the game quickly with auto-updating mods.
            </p>
          </div>

          {/* Steps */}
          <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold">
                  {step.number}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="https://prismlauncher.org/download/" target="_blank">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Download className="mr-2 h-4 w-4" />
                Get Prism Launcher
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="bg-white text-black hover:bg-white/90">
                Sign In to Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
