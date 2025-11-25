"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ExternalLink, Copy, Check, AlertTriangle } from "lucide-react";

export default function InstallGuidePage() {
  const [copied, setCopied] = useState<string | null>(null);
  const serverIP = "play.nostalgiaultra.com";
  const modpackUrl = "https://packwiz.nostalgiaultra.com/pack.toml";

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-full">
      {/* Hero - OpenAI Style */}
      <div className="mb-16">
        <p className="text-sm font-medium text-primary mb-4">Setup Guide</p>
        <h1 className="text-h1 text-foreground mb-6">
          Install the Modpack
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Get set up in about 5 minutes. We recommend Prism Launcher for the easiest experience.
        </p>
      </div>

      {/* Requirements Note */}
      <div className="mb-12 p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <p className="text-blue-200">
          <strong>Before you start:</strong> Make sure you've linked your Minecraft account and have an active subscription to join the server.
        </p>
      </div>

      {/* Installation Tabs */}
      <Tabs defaultValue="prism" className="mb-16">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="prism">Prism Launcher</TabsTrigger>
          <TabsTrigger value="atlauncher">ATLauncher</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="prism">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center gap-3 text-green-500 mb-8">
              <Check className="h-5 w-5" />
              <span className="font-medium">Recommended - Easiest setup with automatic updates</span>
            </div>

            <div className="space-y-10">
              {/* Step 1 */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">1</span>
                  <h3 className="text-lg font-semibold text-foreground">Download Prism Launcher</h3>
                </div>
                <p className="text-muted-foreground mb-4 ml-14">
                  Prism is a free, open-source Minecraft launcher that makes managing modpacks easy.
                </p>
                <div className="ml-14">
                  <Button asChild>
                    <a href="https://prismlauncher.org/download" target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download Prism Launcher
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">2</span>
                  <h3 className="text-lg font-semibold text-foreground">Import the Modpack</h3>
                </div>
                <div className="text-muted-foreground mb-4 ml-14">
                  <p className="mb-2">Open Prism and click <strong className="text-foreground">"Add Instance"</strong>, then select <strong className="text-foreground">"Import from zip or link"</strong>.</p>
                  <p>Paste this URL:</p>
                </div>
                <div className="ml-14 flex items-center gap-3">
                  <code className="flex-1 p-4 bg-muted rounded-lg font-mono text-foreground border border-border text-sm">
                    {modpackUrl}
                  </code>
                  <Button variant="outline" size="lg" onClick={() => copyToClipboard(modpackUrl, 'modpack')}>
                    {copied === 'modpack' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">3</span>
                  <h3 className="text-lg font-semibold text-foreground">Launch and Connect</h3>
                </div>
                <p className="text-muted-foreground mb-4 ml-14">
                  Click the instance to launch Minecraft. Add our server to your server list:
                </p>
                <div className="ml-14 flex items-center gap-3">
                  <code className="flex-1 p-4 bg-muted rounded-lg font-mono text-foreground border border-border">
                    {serverIP}
                  </code>
                  <Button variant="outline" size="lg" onClick={() => copyToClipboard(serverIP, 'server')}>
                    {copied === 'server' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="atlauncher">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">1</span>
                  <h3 className="text-lg font-semibold text-foreground">Download ATLauncher</h3>
                </div>
                <div className="ml-14">
                  <Button asChild>
                    <a href="https://atlauncher.com/downloads" target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download ATLauncher
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">2</span>
                  <h3 className="text-lg font-semibold text-foreground">Create an Instance</h3>
                </div>
                <div className="text-muted-foreground ml-14 space-y-1">
                  <p>Go to the <strong className="text-foreground">Instances</strong> tab and click <strong className="text-foreground">Create Instance</strong>.</p>
                  <p>Select Minecraft 1.21.1 and install Fabric loader.</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">3</span>
                  <h3 className="text-lg font-semibold text-foreground">Add Packwiz Installer</h3>
                </div>
                <p className="text-muted-foreground ml-14">
                  Add the packwiz installer mod to your instance. This will automatically download and sync our modpack.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">4</span>
                  <h3 className="text-lg font-semibold text-foreground">Connect to the Server</h3>
                </div>
                <p className="text-muted-foreground ml-14">
                  Launch the instance and add <code className="bg-muted px-2 py-1 rounded text-foreground">{serverIP}</code> to your server list.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="mb-8 p-5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-yellow-200">
                Manual installation is for advanced users. You won't get automatic updates and troubleshooting is harder.
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Requirements</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Minecraft 1.21.1</li>
                  <li>Fabric Loader 0.18.1 or later</li>
                  <li>Java 21 or later</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Steps</h3>
                <ol className="text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Download and install the Fabric loader</li>
                  <li>Download all required mods from our mod list</li>
                  <li>Place all mods in your <code className="bg-muted px-2 py-1 rounded text-foreground">.minecraft/mods</code> folder</li>
                  <li>Launch Minecraft with the Fabric profile and connect to the server</li>
                </ol>
              </div>

              <Button variant="outline" asChild>
                <a href="https://fabricmc.net/use/installer/" target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download Fabric Installer
                </a>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Separator className="my-12" />

      {/* System Requirements */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">System Requirements</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-1">Memory (RAM)</h3>
            <p className="text-muted-foreground">At least 4GB allocated to Minecraft</p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-1">Java Version</h3>
            <p className="text-muted-foreground">Java 21 or later (Prism can install this)</p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-1">Storage</h3>
            <p className="text-muted-foreground">About 2GB of free space</p>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-8">Troubleshooting</h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-2">Can't connect to the server?</h3>
            <p className="text-muted-foreground">
              Make sure your subscription is active and your Minecraft account is linked. Double-check you're using the correct modpack version.
            </p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-2">Game running slowly?</h3>
            <p className="text-muted-foreground">
              Allocate more RAM to Minecraft (4-6GB is ideal). Lower your render distance to 8-10 chunks. Update your graphics drivers.
            </p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-2">Still stuck?</h3>
            <p className="text-muted-foreground">
              Join our Discord and ask in the #support channel. We're happy to help!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
