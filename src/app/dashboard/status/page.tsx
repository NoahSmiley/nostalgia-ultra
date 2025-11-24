import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Server Status</h1>
        <p className="text-zinc-400 mt-1">Real-time server information</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Server Status</CardTitle>
            <CardDescription className="text-zinc-400">Current availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
              <span className="text-xl font-semibold text-green-400">Online</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Players</CardTitle>
            <CardDescription className="text-zinc-400">Currently online</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">12 <span className="text-zinc-500 text-lg">/ 50</span></div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Server IP</CardTitle>
            <CardDescription className="text-zinc-400">Connect address</CardDescription>
          </CardHeader>
          <CardContent>
            <code className="text-lg text-cyan-400 font-mono">play.nostalgraultra.com</code>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Version</CardTitle>
            <CardDescription className="text-zinc-400">Supported Minecraft version</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-white">1.21.1</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
