import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mcControl } from "@/lib/mc-control";

// Admin emails that can send announcements
const ADMIN_EMAILS = [
  "lucidthedev@outlook.com",
  // Add more admin emails as needed
];

// POST - Send announcement to all players in-game
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
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

    // Send announcement via MC Control
    try {
      let result;
      if (type === "formatted") {
        // Allow MiniMessage formatting
        result = await mcControl.broadcastFormattedAnnouncement(trimmedMessage);
      } else {
        // Simple alert message
        result = await mcControl.broadcastAnnouncement(trimmedMessage);
      }

      return NextResponse.json({
        success: true,
        message: "Announcement sent successfully",
        response: result.response,
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
