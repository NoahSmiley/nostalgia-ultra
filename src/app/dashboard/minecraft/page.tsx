"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2, Gamepad2, Info } from "lucide-react";

export default function MinecraftLinkPage() {
  const { data: session, update } = useSession();
  const [mcUsername, setMcUsername] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mcAccount, setMcAccount] = useState<any>(null);

  useEffect(() => {
    // Fetch current Minecraft account if linked
    if (session?.user?.minecraftLinked) {
      fetchMinecraftAccount();
    }
  }, [session]);

  const fetchMinecraftAccount = async () => {
    try {
      const res = await fetch("/api/minecraft/account");
      if (res.ok) {
        const data = await res.json();
        setMcAccount(data);
      }
    } catch (err) {
      console.error("Failed to fetch Minecraft account:", err);
    }
  };

  const linkAccount = async () => {
    if (!mcUsername.trim()) {
      setError("Please enter your Minecraft username");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/minecraft/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCode: mcUsername.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMcAccount(data);
        setMcUsername("");
        await update(); // Refresh session
      } else {
        setError(data.error || "Failed to link account");
      }
    } catch (err) {
      setError("Failed to link account. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const unlinkAccount = async () => {
    if (!confirm("Are you sure you want to unlink your Minecraft account?")) {
      return;
    }

    try {
      const res = await fetch("/api/minecraft/unlink", {
        method: "POST",
      });

      if (res.ok) {
        setMcAccount(null);
        setSuccess(false);
        await update(); // Refresh session
        // Force a full page reload to ensure UI is in sync
        window.location.reload();
      }
    } catch (err) {
      setError("Failed to unlink account");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Minecraft Account Linking
          </CardTitle>
          <CardDescription>
            Link your Minecraft Java Edition account to access the server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {session?.user?.minecraftLinked && mcAccount ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border border-green-500/20 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <p className="text-green-200">
                  Your Minecraft account is linked!
                </p>
              </div>

              <div className="p-4 bg-zinc-900 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Username:</span>
                  <span className="font-mono text-white">{mcAccount.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Whitelisted:</span>
                  <span className={mcAccount.whitelisted ? "text-green-400" : "text-yellow-400"}>
                    {mcAccount.whitelisted ? "Yes" : "No (Subscribe to get access)"}
                  </span>
                </div>
              </div>

              <Button
                onClick={unlinkAccount}
                variant="outline"
                className="w-full"
              >
                Unlink Account
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg border border-red-500/20 bg-red-500/10">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <p className="text-red-200">
                    {error}
                  </p>
                </div>
              )}

              {success && !session?.user?.minecraftLinked && (
                <div className="flex items-center gap-3 p-4 rounded-lg border border-green-500/20 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <p className="text-green-200">
                    Successfully linked your Minecraft account!
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-500/20 bg-blue-500/10">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p className="text-blue-200">
                    Since you're signed in with Microsoft, we just need your Minecraft username to complete the link.
                    Make sure you own Minecraft Java Edition on this Microsoft account.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mc-username">Minecraft Java Edition Username</Label>
                  <Input
                    id="mc-username"
                    value={mcUsername}
                    onChange={(e) => setMcUsername(e.target.value)}
                    placeholder="Enter your Minecraft username"
                    className="bg-zinc-800"
                  />
                  <p className="text-xs text-zinc-500">
                    This is your in-game username, not your Microsoft email
                  </p>
                </div>

                <Button
                  onClick={linkAccount}
                  disabled={verifying || !mcUsername.trim()}
                  className="w-full"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    <>
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      Link Minecraft Account
                    </>
                  )}
                </Button>

                <div className="text-sm text-zinc-400 space-y-2">
                  <p>After linking, you'll get:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Automatic server whitelisting with an active subscription</li>
                    <li>Access to exclusive member features</li>
                    <li>Sync between your website and in-game profiles</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}