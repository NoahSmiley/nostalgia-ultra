import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Authflow } from "prismarine-auth";

// Store device code flows in memory (in production, use Redis or similar)
const deviceCodeFlows = new Map<string, any>();

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    const flow = new Authflow("", "./auth-cache", {
      authTitle: "00000000402b5328",
      flow: "live",
      deviceType: "Win32"
    });

    // Start device code flow
    const deviceCode = await flow.getXboxToken();

    // Store the flow for polling
    deviceCodeFlows.set(userId, {
      flow,
      deviceCode,
      createdAt: Date.now(),
    });

    // Clean up old flows after 10 minutes
    setTimeout(() => {
      deviceCodeFlows.delete(userId);
    }, 600000);

    return NextResponse.json({
      userCode: deviceCode.user_code,
      verificationUri: deviceCode.verification_uri,
      expiresIn: deviceCode.expires_in,
    });
  } catch (error) {
    console.error("Minecraft link start error:", error);
    return NextResponse.json(
      { error: "Failed to start authentication flow" },
      { status: 500 }
    );
  }
}