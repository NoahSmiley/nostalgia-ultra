"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  invite_required: "You need an invite code to sign up. Enter your code below.",
  invalid_invite: "That invite code is invalid or has been used. Please try a different code.",
  signin_error: "Something went wrong during sign in. Please try again.",
};

export default function InvitePage() {
  const searchParams = useSearchParams();
  const [inviteCode, setInviteCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for error in URL params
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam && ERROR_MESSAGES[errorParam]) {
      setError(ERROR_MESSAGES[errorParam]);
    }
  }, [searchParams]);

  const handleValidateCode = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const res = await fetch("/api/invite/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        // Code is valid and stored in cookie, proceed to sign in
        signIn("microsoft-entra-id", { callbackUrl: "/dashboard" });
      } else {
        setError(data.error || "Invalid invite code");
      }
    } catch {
      setError("Failed to validate code. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-foreground mb-4">
          Enter Your Invite Code
        </h1>
        <p className="text-muted-foreground">
          This server is invite-only. Enter the code you received to continue.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Code Input */}
      <div className="space-y-4 mb-8">
        <Input
          type="text"
          placeholder="XXXXXX"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleValidateCode()}
          className="h-14 text-2xl font-mono tracking-[0.5em] text-center uppercase"
          maxLength={10}
          autoFocus
        />
        <Button
          onClick={handleValidateCode}
          disabled={isValidating || !inviteCode.trim()}
          className="w-full h-12 rounded-full text-base"
          size="lg"
        >
          {isValidating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Validating...
            </>
          ) : (
            "Continue with Microsoft"
          )}
        </Button>
      </div>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Already have an account */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Already have an account?
        </p>
        <Button
          variant="outline"
          onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
          className="w-full h-11 rounded-full"
        >
          Sign In
        </Button>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground mt-12">
        Don't have an invite code? This server is for friends and family only.
        <br />
        Ask the server admin for an invite.
      </p>
    </div>
  );
}
