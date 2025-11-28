"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ExternalLink, Copy, Check, AlertTriangle, RefreshCw, Crown, Sparkles, Lock } from "lucide-react";
import { SERVER_CONFIG, SYSTEM_REQUIREMENTS, LINKS } from "@/config";
import Link from "next/link";

const PACKWIZ_INSTALLER_URL = "https://github.com/packwiz/packwiz-installer-bootstrap/releases/latest/download/packwiz-installer-bootstrap.jar";
const PACK_TOML_STANDARD = "https://noahsmiley.github.io/noahs-server-modpack/pack.toml";
const PACK_TOML_ULTRA = "https://noahsmiley.github.io/noahs-server-modpack-ultra/pack.toml";

type ModpackTier = "standard" | "ultra";

export default function InstallGuidePage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<ModpackTier | null>(null);
  const [isUltra, setIsUltra] = useState(false);
  const [loading, setLoading] = useState(true);

  const serverIP = SERVER_CONFIG.ip;
  // Default to standard pack URL until selection is made
  const effectivePack = selectedPack ?? "standard";
  const packUrl = effectivePack === "ultra" ? PACK_TOML_ULTRA : PACK_TOML_STANDARD;
  const preLaunchCommand = `"$INST_JAVA" -jar packwiz-installer-bootstrap.jar ${packUrl}`;

  useEffect(() => {
    async function checkSubscription() {
      try {
        const res = await fetch("/api/subscription");
        if (res.ok) {
          const data = await res.json();
          const userIsUltra = data.tier === "ultra";
          setIsUltra(userIsUltra);
          // Set initial selection based on subscription tier
          setSelectedPack(userIsUltra ? "ultra" : "standard");
        } else {
          // Default to standard if no subscription
          setSelectedPack("standard");
        }
      } catch {
        // Default to standard if can't fetch
        setSelectedPack("standard");
      } finally {
        setLoading(false);
      }
    }
    checkSubscription();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-sm font-medium text-primary mb-4">Setup Guide</p>
        <h1 className="text-h1 text-foreground mb-6">
          Install the Modpack
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Get set up in about 5 minutes. We recommend Prism Launcher for the easiest experience with automatic updates.
        </p>
      </div>

      {/* Modpack Selection */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-foreground mb-6">Choose Your Modpack</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Standard Pack */}
          <button
            onClick={() => setSelectedPack("standard")}
            disabled={loading}
            className={`text-left p-6 rounded-2xl border-2 transition-all ${
              loading
                ? "border-border bg-card"
                : selectedPack === "standard"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Standard</h3>
                <p className="text-sm text-muted-foreground">Server-required mods only</p>
              </div>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-[52px]">
              <li>• {SERVER_CONFIG.modCount}+ mods (server essentials)</li>
              <li>• Voice chat, world gen, gameplay mods</li>
              <li>• Auto-updates on every launch</li>
              <li>• Works on any computer</li>
            </ul>
          </button>

          {/* Ultra Pack */}
          <div
            onClick={() => !loading && isUltra && setSelectedPack("ultra")}
            role={!loading && isUltra ? "button" : undefined}
            tabIndex={!loading && isUltra ? 0 : undefined}
            className={`text-left p-6 rounded-2xl border-2 transition-all relative ${
              loading
                ? "border-border bg-card"
                : selectedPack === "ultra"
                  ? "border-amber-500 bg-amber-500/5"
                  : isUltra
                    ? "border-border bg-card hover:border-amber-500/50 cursor-pointer"
                    : "border-border bg-card/50 opacity-75"
            }`}
          >
            {!isUltra && !loading && (
              <div className="absolute inset-0 bg-background/60 rounded-2xl flex items-center justify-center z-10">
                <div className="text-center">
                  <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Ultra Subscribers Only</p>
                  <Link href="/dashboard/subscription">
                    <Button size="sm" variant="outline">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Ultra
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">Ultra</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-medium">Premium</span>
                </div>
                <p className="text-sm text-muted-foreground">Full visual experience</p>
              </div>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-[52px]">
              <li>• {SERVER_CONFIG.modCountUltra}+ mods with all enhancements</li>
              <li>• Shaders (Complementary, BSL, Bliss)</li>
              <li>• Performance mods (Sodium, Iris, Nvidium)</li>
              <li>• Visual effects, animations, sounds</li>
              <li>• Fresh Animations resource pack</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Requirements Note */}
      <div className="mb-12 p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <p className="text-blue-200">
          <strong>Before you start:</strong> Make sure you've linked your Minecraft account and have an active subscription to join the server.
        </p>
      </div>

      {/* Installation Tabs */}
      <Tabs defaultValue="prism" className="mb-16">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="prism">Prism Launcher</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="prism">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center gap-3 text-green-500 mb-8">
              <RefreshCw className="h-5 w-5" />
              <span className="font-medium">Recommended - Automatic updates every time you launch</span>
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
                    <a href={LINKS.prismLauncher} target="_blank" rel="noopener noreferrer">
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
                  <h3 className="text-lg font-semibold text-foreground">Create a Fabric Instance</h3>
                </div>
                <div className="text-muted-foreground mb-4 ml-14">
                  <p className="mb-2">Open Prism and click <strong className="text-foreground">"Add Instance"</strong>.</p>
                  <p>Select <strong className="text-foreground">Minecraft {SERVER_CONFIG.mcVersion}</strong> and install <strong className="text-foreground">Fabric Loader</strong>.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">3</span>
                  <h3 className="text-lg font-semibold text-foreground">Download the Installer</h3>
                </div>
                <div className="text-muted-foreground mb-4 ml-14">
                  <p className="mb-3">Download this file and place it in your instance's <code className="bg-muted px-2 py-1 rounded text-foreground">.minecraft</code> folder:</p>
                </div>
                <div className="ml-14">
                  <Button asChild>
                    <a href={PACKWIZ_INSTALLER_URL} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download packwiz-installer-bootstrap.jar
                    </a>
                  </Button>
                  <p className="text-muted-foreground text-sm mt-3">
                    To find the folder: Right-click the instance → <strong className="text-foreground">Folder</strong> → <strong className="text-foreground">.minecraft</strong>
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">4</span>
                  <h3 className="text-lg font-semibold text-foreground">Add Pre-Launch Command</h3>
                </div>
                <div className="text-muted-foreground mb-4 ml-14">
                  <p className="mb-2">Right-click the instance → <strong className="text-foreground">Edit</strong> → <strong className="text-foreground">Settings</strong> → <strong className="text-foreground">Custom commands</strong>.</p>
                  <p>Enable <strong className="text-foreground">"Custom commands"</strong> and paste this in the <strong className="text-foreground">Pre-launch command</strong> field:</p>
                </div>
                <div className="ml-14">
                  {selectedPack === "ultra" && (
                    <div className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-200 text-sm">Ultra modpack selected - includes shaders and visual enhancements</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <code className="flex-1 p-4 bg-muted rounded-lg font-mono text-foreground border border-border text-sm break-all">
                      {preLaunchCommand}
                    </code>
                    <Button variant="outline" size="lg" onClick={() => copyToClipboard(preLaunchCommand, 'prelaunch')}>
                      {copied === 'prelaunch' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">5</span>
                  <h3 className="text-lg font-semibold text-foreground">Launch and Connect</h3>
                </div>
                <p className="text-muted-foreground mb-4 ml-14">
                  Launch the instance - it will automatically download all mods. Add our server to your server list:
                </p>
                <div className="ml-14 flex items-center gap-3">
                  <code className="flex-1 p-4 bg-muted rounded-lg font-mono text-foreground border border-border">
                    {serverIP}
                  </code>
                  <Button variant="outline" size="lg" onClick={() => copyToClipboard(serverIP, 'server')}>
                    {copied === 'server' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="ml-14 mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-green-200 text-sm">
                    <strong>Auto-updates enabled!</strong> Every time you launch, the installer checks for updates and downloads any new or changed mods automatically.
                  </p>
                </div>
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
                  <li>Minecraft {SERVER_CONFIG.mcVersion}</li>
                  <li>Fabric Loader {SERVER_CONFIG.fabricVersion} or later</li>
                  <li>{SYSTEM_REQUIREMENTS.java.display}</li>
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
                <a href={LINKS.fabricInstaller} target="_blank" rel="noopener noreferrer">
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
            <p className="text-muted-foreground">{SYSTEM_REQUIREMENTS.ram.minimumDisplay}</p>
            {selectedPack === "ultra" && (
              <p className="text-amber-500 text-sm mt-1">Ultra: 8GB+ recommended</p>
            )}
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-1">Java Version</h3>
            <p className="text-muted-foreground">{SYSTEM_REQUIREMENTS.java.display} (Prism can install this)</p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-medium text-foreground mb-1">Storage</h3>
            <p className="text-muted-foreground">{SYSTEM_REQUIREMENTS.disk.display}</p>
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
              Allocate more RAM to Minecraft ({SYSTEM_REQUIREMENTS.ram.recommendedDisplay}). Lower your render distance to {SYSTEM_REQUIREMENTS.renderDistance.recommended}. Update your graphics drivers.
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
