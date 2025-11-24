import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-zinc-400 mt-1">
          Here&apos;s what&apos;s happening with Nostalgia Ultra
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Server Status</CardTitle>
            <CardDescription className="text-zinc-400">Current server status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 font-medium">Online</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Players Online</CardTitle>
            <CardDescription className="text-zinc-400">Currently playing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">12 / 50</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Server Version</CardTitle>
            <CardDescription className="text-zinc-400">Minecraft version</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-white">1.21.1</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Quick Connect</CardTitle>
          <CardDescription className="text-zinc-400">Join the server</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <code className="px-4 py-2 bg-zinc-800 rounded-md text-zinc-300 font-mono">
              play.nostalgraultra.com
            </code>
            <button className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-zinc-200 transition-colors">
              Copy IP
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
