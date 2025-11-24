import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Land Claiming",
    description: "Protect your builds with our advanced land claiming system. Claim chunks and manage permissions for friends.",
    icon: "🏰",
  },
  {
    title: "Economy System",
    description: "Earn money by selling items, completing jobs, and trading with other players. Buy land, items, and more!",
    icon: "💰",
  },
  {
    title: "Player Shops",
    description: "Set up your own shop and sell items to other players. Create a thriving marketplace.",
    icon: "🏪",
  },
  {
    title: "Custom Enchants",
    description: "Discover unique enchantments not found in vanilla Minecraft. Power up your gear!",
    icon: "✨",
  },
  {
    title: "Teleportation",
    description: "Set homes, teleport to friends, and use warps to travel quickly around the server.",
    icon: "🌀",
  },
  {
    title: "Discord Integration",
    description: "Chat between Discord and in-game. Get notifications for server events and announcements.",
    icon: "💬",
  },
];

export default function FeaturesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Features</h1>
        <p className="text-zinc-400 mt-1">What makes Nostalgia Ultra special</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-amber-400">
                <span className="text-2xl">{feature.icon}</span>
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-400 text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
