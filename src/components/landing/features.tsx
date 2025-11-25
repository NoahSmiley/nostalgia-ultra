"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Map, Users, Zap, Shield, Download, RefreshCw } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "High Performance",
    description: "Optimized server running on premium hardware for smooth gameplay with minimal lag.",
  },
  {
    icon: Users,
    title: "Active Community",
    description: "Join a friendly community of players who share your passion for Minecraft.",
  },
  {
    icon: Map,
    title: "Live Dynmap",
    description: "Explore the world in real-time with our interactive live map feature.",
  },
  {
    icon: Shield,
    title: "Anti-Grief Protection",
    description: "Your builds are safe with our comprehensive protection systems.",
  },
  {
    icon: Download,
    title: "Easy Modpack Install",
    description: "One-click modpack installation through Prism Launcher with auto-updates.",
  },
  {
    icon: RefreshCw,
    title: "Regular Updates",
    description: "Stay up to date with automatic modpack updates and new content.",
  },
];

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="bg-black section-padding-y"
      aria-labelledby="features-heading"
    >
      <div className="container-padding-x container mx-auto">
        <div className="flex flex-col items-center gap-12">
          {/* Section Header */}
          <div className="flex flex-col items-center gap-4 text-center max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80">
              Features
            </div>
            <h2
              id="features-heading"
              className="heading-lg text-white"
            >
              Everything you need for the ultimate Minecraft experience
            </h2>
            <p className="text-white/60 text-base lg:text-lg">
              We've built a server with all the tools and features you need for an amazing adventure.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/5 border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {feature.description}
                    </p>
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
