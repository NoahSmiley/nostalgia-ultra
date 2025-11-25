import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";

export default function RulesPage() {
  return (
    <div className="w-full">
      {/* Hero - OpenAI Style */}
      <div className="mb-16">
        <p className="text-sm font-medium text-primary mb-4">Community Guidelines</p>
        <h1 className="text-h1 text-foreground mb-6">
          Server Rules
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          A few simple rules to keep our community fun for everyone.
        </p>
      </div>

      {/* Warning */}
      <div className="mb-12 p-5 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
        <p className="text-red-200">
          Breaking these rules can result in warnings, mutes, or bans. Severe violations (cheating, hate speech) result in immediate permanent bans.
        </p>
      </div>

      {/* Rules - Card Style */}
      <div className="grid gap-6 mb-16">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Be Respectful</h2>
          <p className="text-muted-foreground leading-relaxed">
            Treat everyone with respect. No harassment, bullying, hate speech, or discrimination of any kind.
            We want everyone to feel welcome here.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-3">2. No Griefing or Stealing</h2>
          <p className="text-muted-foreground leading-relaxed">
            Don't destroy, modify, or take from other players' builds without permission.
            Even if something looks abandoned, ask first. Use the land claiming system to protect your own builds.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-3">3. No Cheating</h2>
          <p className="text-muted-foreground leading-relaxed">
            Hacked clients, X-ray texture packs, duplication glitches, and any other exploits are strictly prohibited.
            Play fair - it's more fun for everyone.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Keep Chat Clean</h2>
          <p className="text-muted-foreground leading-relaxed">
            No spam, excessive caps, or advertising. Keep conversations appropriate -
            remember that players of all ages are here. Light swearing is okay, but don't overdo it.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-3">5. No Real-Money Trading</h2>
          <p className="text-muted-foreground leading-relaxed">
            Trading in-game items or currency for real money is not allowed. This includes selling accounts
            or items outside the game.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Report Bugs</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you find a bug or exploit, report it to staff instead of using it. Players who report issues
            help make the server better for everyone.
          </p>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Consequences */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">What Happens If You Break the Rules?</h2>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          <div className="flex justify-between p-5">
            <span className="text-foreground">First offense</span>
            <span className="text-muted-foreground">Warning</span>
          </div>
          <div className="flex justify-between p-5">
            <span className="text-foreground">Second offense</span>
            <span className="text-muted-foreground">24-hour mute or tempban</span>
          </div>
          <div className="flex justify-between p-5">
            <span className="text-foreground">Third offense</span>
            <span className="text-muted-foreground">7-day ban</span>
          </div>
          <div className="flex justify-between p-5">
            <span className="text-foreground">Severe violations</span>
            <span className="text-red-400">Permanent ban</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Staff use their judgment based on the situation. Repeat offenders or severe violations skip the warning stages.
        </p>
      </div>

      {/* Appeals */}
      <div className="rounded-2xl border border-border bg-card p-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Appeals</h2>
        <p className="text-muted-foreground">
          Think you were banned unfairly? You can appeal through our Discord server.
          Create a ticket in the #support channel and explain your case. We review all appeals fairly,
          but repeated rule-breaking will not be tolerated.
        </p>
      </div>
    </div>
  );
}
