import { Separator } from "@/components/ui/separator";

export default function StatusPage() {
  return (
    <div className="w-full">
      {/* Hero - OpenAI Style */}
      <div className="mb-16">
        <p className="text-sm font-medium text-green-500 mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          All Systems Online
        </p>
        <h1 className="text-h1 text-foreground mb-6">
          Server Status
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          The server is running smoothly. Jump in and play!
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-4xl font-semibold text-foreground">12</p>
          <p className="text-muted-foreground mt-1">Players Online</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-4xl font-semibold text-foreground">1.21.1</p>
          <p className="text-muted-foreground mt-1">Minecraft Version</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-4xl font-semibold text-foreground">20.0</p>
          <p className="text-muted-foreground mt-1">Server TPS</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-4xl font-semibold text-foreground">99.9%</p>
          <p className="text-muted-foreground mt-1">Uptime</p>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Server Info */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">Server Information</h2>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          <div className="flex justify-between p-5">
            <span className="text-muted-foreground">Server Address</span>
            <code className="font-mono text-foreground">play.nostalgraultra.com</code>
          </div>
          <div className="flex justify-between p-5">
            <span className="text-muted-foreground">Mod Loader</span>
            <span className="text-foreground">Fabric 0.18.1</span>
          </div>
          <div className="flex justify-between p-5">
            <span className="text-muted-foreground">Player Slots</span>
            <span className="text-foreground">50</span>
          </div>
          <div className="flex justify-between p-5">
            <span className="text-muted-foreground">World Size</span>
            <span className="text-foreground">4.2 GB</span>
          </div>
          <div className="flex justify-between p-5">
            <span className="text-muted-foreground">Average Ping</span>
            <span className="text-foreground">24ms</span>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">Service Status</h2>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {[
            { name: "Game Server", status: "Operational" },
            { name: "Web Dashboard", status: "Operational" },
            { name: "Live Map (Dynmap)", status: "Operational" },
            { name: "Discord Bot", status: "Operational" },
            { name: "Automatic Backups", status: "Operational" },
          ].map((service, i) => (
            <div key={i} className="flex items-center justify-between p-5">
              <span className="text-foreground">{service.name}</span>
              <span className="flex items-center gap-2 text-green-500">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {service.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-8">Recent Maintenance</h2>
        <div className="space-y-6">
          <div className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">Scheduled Restart</span>
              <span className="text-sm text-muted-foreground">2 days ago</span>
            </div>
            <p className="text-muted-foreground">Daily 4 AM EST restart for performance optimization.</p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">Mod Update</span>
              <span className="text-sm text-muted-foreground">5 days ago</span>
            </div>
            <p className="text-muted-foreground">Updated Create mod to latest version with bug fixes.</p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">Configuration Changes</span>
              <span className="text-sm text-muted-foreground">1 week ago</span>
            </div>
            <p className="text-muted-foreground">Adjusted mob spawn rates for better performance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
