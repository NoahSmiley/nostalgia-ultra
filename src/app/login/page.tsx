"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Welcome to Nostalgia Ultra</CardTitle>
          <CardDescription className="text-zinc-400">
            Sign in with your Microsoft account to access the server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            className="w-full bg-white text-black hover:bg-zinc-200"
            onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="9" height="9" fill="#F25022"/>
              <rect x="11.5" y="0.5" width="9" height="9" fill="#7FBA00"/>
              <rect x="0.5" y="11.5" width="9" height="9" fill="#00A4EF"/>
              <rect x="11.5" y="11.5" width="9" height="9" fill="#FFB900"/>
            </svg>
            Sign in with Microsoft
          </Button>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
