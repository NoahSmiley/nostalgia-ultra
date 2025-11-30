import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";
import { db } from "@/lib/db";

async function getModpackVersions() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/modpack/versions`, {
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch (error) {
    return [];
  }
}

async function getServerUpdates() {
  try {
    const updates = await db.serverUpdate.findMany({
      orderBy: { createdAt: "desc" },
      take: 10, // Last 10 updates
    });
    return updates;
  } catch (error) {
    console.error("Error fetching server updates:", error);
    return [];
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function isNew(date: Date): boolean {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(date) > sevenDaysAgo;
}

export default async function UpdatesPage() {
  const [modpackVersions, serverUpdates] = await Promise.all([
    getModpackVersions(),
    getServerUpdates(),
  ]);

  return (
    <div className="w-full">
      {/* Hero - OpenAI Style */}
      <div className="mb-16">
        <p className="text-sm font-medium text-primary mb-4">What's New</p>
        <h1 className="text-h1 text-foreground mb-6">
          Updates & Changelog
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Stay up to date with modpack changes and server updates.
        </p>
      </div>

      {/* How Updates Work */}
      <div className="mb-12 p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex gap-4">
          <Download className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-200 font-medium mb-1">Updates are automatic</p>
            <p className="text-blue-200/80">
              If you're using Prism Launcher with our modpack URL, updates install automatically when you launch the game.
            </p>
          </div>
        </div>
      </div>

      {/* Version History */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">Modpack Versions</h2>
        {modpackVersions.length > 0 ? (
          <div className="space-y-4">
            {modpackVersions.map((version: any, i: number) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{version.name}</h3>
                    <p className="text-sm text-muted-foreground">{version.date}</p>
                  </div>
                  {i === 0 && (
                    <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded">
                      Latest
                    </span>
                  )}
                </div>
                {version.changes && (
                  <ul className="space-y-2">
                    {version.changes.map((change: string, j: number) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
                        <span className="text-muted-foreground">{change}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No version history available yet.</p>
          </div>
        )}
      </div>

      <Separator className="my-12" />

      {/* Server Updates - Dynamic from Database */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">Recent Server Changes</h2>
        <div className="space-y-4">
          {serverUpdates.length > 0 ? (
            serverUpdates.map((update) => (
              <div
                key={update.id}
                className={`rounded-xl p-5 ${
                  update.isHighlight
                    ? "border border-primary/30 bg-primary/5"
                    : "border border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{update.title}</span>
                    {isNew(update.createdAt) && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                        New
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(update.createdAt)}
                  </span>
                </div>
                <p className="text-muted-foreground mb-3">{update.description}</p>
                {update.changes && update.changes.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    {update.changes.map((change, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        <span className="text-muted-foreground">{change}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">No server updates yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-8">Current Version</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-3xl font-semibold text-foreground">1.21.1</p>
            <p className="text-muted-foreground mt-1">Minecraft Version</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-3xl font-semibold text-foreground">90+</p>
            <p className="text-muted-foreground mt-1">Mods Included</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-3xl font-semibold text-foreground">
              {serverUpdates.length > 0
                ? formatDate(serverUpdates[0].createdAt).replace(', 2024', '')
                : modpackVersions.length > 0
                ? new Date(modpackVersions[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'N/A'
              }
            </p>
            <p className="text-muted-foreground">Last Update</p>
          </div>
        </div>
      </div>
    </div>
  );
}
