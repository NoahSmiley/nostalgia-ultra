"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ExternalLink, FileText, Gamepad2, Info, CheckCircle2, Copy } from "lucide-react";

export default function InstallGuidePage() {
  const [copiedCommand, setCopiedCommand] = useState(false);
  const serverIP = "play.nostalgiaultra.com";
  const modpackUrl = "https://packwiz.nostalgiaultra.com/pack.toml";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Installation Guide</h1>
          <p className="text-xl text-zinc-400">
            Get started with the Nostalgia Ultra modpack
          </p>
        </div>

        <Alert className="border-blue-500/20 bg-blue-500/10">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-200">
            An active subscription is required to join the server. Make sure you've linked your Minecraft account first.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="prism" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prism">Prism Launcher</TabsTrigger>
            <TabsTrigger value="atlauncher">ATLauncher</TabsTrigger>
            <TabsTrigger value="manual">Manual Install</TabsTrigger>
          </TabsList>

          <TabsContent value="prism" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Installing with Prism Launcher (Recommended)</CardTitle>
                <CardDescription>
                  The easiest way to install and keep the modpack updated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Step 1: Download Prism Launcher</h3>
                  <p className="text-sm text-zinc-400">
                    If you don't have Prism Launcher installed, download it from the official website.
                  </p>
                  <a
                    href="https://prismlauncher.org/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                  >
                    Download Prism Launcher
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Step 2: Add Instance</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-400">
                    <li>Open Prism Launcher and click "Add Instance"</li>
                    <li>Select "Import from ZIP"</li>
                    <li>Enter the modpack URL:</li>
                  </ol>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-zinc-900 rounded text-xs font-mono">
                      {modpackUrl}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(modpackUrl)}
                    >
                      {copiedCommand ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Step 3: Configure Java</h3>
                  <p className="text-sm text-zinc-400">
                    Make sure you have Java 17 or later installed. Prism Launcher can download it for you automatically.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Step 4: Launch & Connect</h3>
                  <p className="text-sm text-zinc-400">
                    Launch the instance and connect to the server:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-zinc-900 rounded text-xs font-mono">
                      {serverIP}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(serverIP)}
                    >
                      {copiedCommand ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="atlauncher" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Installing with ATLauncher</CardTitle>
                <CardDescription>
                  Alternative launcher with packwiz support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Step 1: Download ATLauncher</h3>
                  <p className="text-sm text-zinc-400">
                    Download ATLauncher from the official website.
                  </p>
                  <a
                    href="https://atlauncher.com/downloads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                  >
                    Download ATLauncher
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Step 2: Create Instance</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-400">
                    <li>Go to the "Instances" tab</li>
                    <li>Click "Create Instance"</li>
                    <li>Select "Vanilla Minecraft"</li>
                    <li>Choose Minecraft version 1.20.1</li>
                    <li>Install Fabric loader</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Step 3: Add Packwiz Installer</h3>
                  <p className="text-sm text-zinc-400">
                    After creating the instance, add the packwiz installer mod to automatically sync mods.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Step 4: Connect to Server</h3>
                  <p className="text-sm text-zinc-400">
                    Launch the instance and add our server to your server list.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manual Installation</CardTitle>
                <CardDescription>
                  For advanced users who prefer manual setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-yellow-500/20 bg-yellow-500/10">
                  <Info className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-200">
                    Manual installation requires more technical knowledge and won't auto-update.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                    <li>Minecraft 1.20.1</li>
                    <li>Fabric Loader 0.15.0 or later</li>
                    <li>Java 17 or later</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Step 1: Install Fabric</h3>
                  <p className="text-sm text-zinc-400">
                    Download and run the Fabric installer for Minecraft 1.20.1.
                  </p>
                  <a
                    href="https://fabricmc.net/use/installer/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                  >
                    Fabric Installer
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Step 2: Download Mods</h3>
                  <p className="text-sm text-zinc-400">
                    Download the mod list and packwiz installer from our repository.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Mod List
                  </Button>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Step 3: Configure Mods</h3>
                  <p className="text-sm text-zinc-400">
                    Place all mods in your .minecraft/mods folder and configure as needed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>
              Common issues and solutions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Can't connect to server?</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                <li>Make sure you have an active subscription</li>
                <li>Verify your Minecraft account is linked</li>
                <li>Check that you're using the correct modpack version</li>
                <li>Ensure you're using Minecraft 1.20.1</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-white">Mods not loading?</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                <li>Verify Fabric is installed correctly</li>
                <li>Check Java version (must be 17 or later)</li>
                <li>Ensure all dependencies are installed</li>
                <li>Try reinstalling the modpack</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-white">Performance issues?</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                <li>Allocate at least 4GB of RAM</li>
                <li>Update your graphics drivers</li>
                <li>Disable shaders if experiencing lag</li>
                <li>Lower render distance in video settings</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Get support from our community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400 mb-4">
              If you're still having trouble, our community is here to help!
            </p>
            <div className="flex gap-4">
              <Button variant="outline">
                <Gamepad2 className="mr-2 h-4 w-4" />
                Discord Support
              </Button>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Wiki
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}