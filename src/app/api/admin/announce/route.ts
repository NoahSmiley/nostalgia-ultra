import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mcControl } from "@/lib/mc-control";

// POST - Send announcement to all players in-game
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { message, type = "alert" } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 1 || trimmedMessage.length > 500) {
      return NextResponse.json(
        { error: "Message must be between 1 and 500 characters" },
        { status: 400 }
      );
    }

    // Send announcement via MC Control to all backend servers
    try {
      const command = type === "formatted"
        ? `broadcast ${trimmedMessage}`
        : `say [Announcement] ${trimmedMessage}`;

      const result = await mcControl.executeOnAllBackends(command);

      // Also send via Velocity for proxy-wide reach
      await mcControl.executeCommand(`alert ${trimmedMessage}`).catch(() => {
        // Ignore if Velocity alert fails - backends got the message
      });

      return NextResponse.json({
        success: true,
        message: "Announcement sent successfully",
        results: result.results,
      });
    } catch (e) {
      console.error("Failed to send announcement:", e);
      return NextResponse.json(
        { error: "Failed to send announcement to server" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Failed to process announcement:", error);
    return NextResponse.json({ error: "Failed to process announcement" }, { status: 500 });
  }
}
