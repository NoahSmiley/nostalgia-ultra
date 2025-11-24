import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const rules = [
  {
    number: 1,
    title: "Be Respectful",
    description: "Treat all players with respect. No harassment, bullying, or hate speech of any kind.",
  },
  {
    number: 2,
    title: "No Griefing",
    description: "Do not destroy or modify other players' builds without permission. This includes stealing items.",
  },
  {
    number: 3,
    title: "No Cheating",
    description: "Hacked clients, X-ray texture packs, and exploits are strictly prohibited.",
  },
  {
    number: 4,
    title: "No Spamming",
    description: "Avoid excessive messaging, caps lock abuse, or advertising in chat.",
  },
  {
    number: 5,
    title: "Keep Chat Clean",
    description: "No inappropriate content, excessive swearing, or NSFW material.",
  },
  {
    number: 6,
    title: "No Real-World Trading",
    description: "Trading in-game items or currency for real money is not allowed.",
  },
  {
    number: 7,
    title: "Report Issues",
    description: "If you find a bug or exploit, report it to staff instead of abusing it.",
  },
  {
    number: 8,
    title: "Have Fun!",
    description: "This is a game. Enjoy yourself and help create a positive community.",
  },
];

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Server Rules</h1>
        <p className="text-zinc-400 mt-1">Please read and follow these rules</p>
      </div>

      <Card className="bg-red-900/20 border-red-800/50">
        <CardContent className="pt-6">
          <p className="text-red-200/80">
            Breaking these rules may result in warnings, mutes, kicks, or permanent bans depending on severity.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.number} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl font-bold text-orange-400">{rule.number}</span>
                <span className="text-white">{rule.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400 pl-10">{rule.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
