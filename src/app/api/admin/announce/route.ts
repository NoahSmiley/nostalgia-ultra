import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mcControl } from "@/lib/mc-control";

// Announcement styles with MiniMessage formatting
const ANNOUNCEMENT_STYLES = {
  // Standard announcement - gold/yellow theme
  standard: {
    titleColor: "gold",
    chatPrefix: "<gradient:#FFD700:#FFA500><bold>✦ ANNOUNCEMENT ✦</bold></gradient>",
    chatColor: "<yellow>",
  },
  // Important announcement - red theme
  important: {
    titleColor: "red",
    chatPrefix: "<gradient:#FF4444:#CC0000><bold>⚠ IMPORTANT ⚠</bold></gradient>",
    chatColor: "<red>",
  },
  // Event announcement - purple/pink theme
  event: {
    titleColor: "light_purple",
    chatPrefix: "<gradient:#FF69B4:#9400D3><bold>🎉 EVENT 🎉</bold></gradient>",
    chatColor: "<light_purple>",
  },
  // Update announcement - green theme
  update: {
    titleColor: "green",
    chatPrefix: "<gradient:#00FF00:#32CD32><bold>🔄 UPDATE 🔄</bold></gradient>",
    chatColor: "<green>",
  },
};

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
    const { message, style = "standard", showTitle = true, playSound = true } = body;

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

    const announcementStyle = ANNOUNCEMENT_STYLES[style as keyof typeof ANNOUNCEMENT_STYLES] || ANNOUNCEMENT_STYLES.standard;

    // Send announcement via MC Control to all backend servers
    try {
      const commands: string[] = [];

      // 1. Show title on screen (big centered text) if enabled
      if (showTitle) {
        // Title command: /title @a title {"text":"message","color":"color"}
        commands.push(`title @a title {"text":"ANNOUNCEMENT","color":"${announcementStyle.titleColor}","bold":true}`);
        // Subtitle with the actual message (shorter version if too long)
        const subtitleText = trimmedMessage.length > 50 ? trimmedMessage.substring(0, 47) + "..." : trimmedMessage;
        commands.push(`title @a subtitle {"text":"${subtitleText.replace(/"/g, '\\"')}","color":"white"}`);
      }

      // 2. Play sound effect if enabled
      if (playSound) {
        commands.push(`playsound minecraft:block.note_block.pling master @a ~ ~ ~ 1 1`);
      }

      // 3. Send formatted chat message with separator lines
      const chatMessage = `${announcementStyle.chatPrefix}\\n${announcementStyle.chatColor}${trimmedMessage}</color>`;

      // Use tellraw for rich chat formatting
      const tellrawMessage = {
        text: "",
        extra: [
          { text: "\n" },
          { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", color: "dark_gray" },
          { text: "\n" },
          { text: style === "important" ? "⚠ IMPORTANT ⚠" : style === "event" ? "🎉 EVENT 🎉" : style === "update" ? "🔄 UPDATE 🔄" : "✦ ANNOUNCEMENT ✦", color: announcementStyle.titleColor, bold: true },
          { text: "\n\n" },
          { text: trimmedMessage, color: style === "important" ? "red" : style === "event" ? "light_purple" : style === "update" ? "green" : "yellow" },
          { text: "\n" },
          { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", color: "dark_gray" },
          { text: "\n" },
        ]
      };
      commands.push(`tellraw @a ${JSON.stringify(tellrawMessage)}`);

      // Execute all commands on backend servers
      const results: Record<string, unknown> = {};
      for (const cmd of commands) {
        const result = await mcControl.executeOnAllBackends(cmd);
        if (result.results) {
          for (const [server, serverResult] of Object.entries(result.results)) {
            if (!results[server]) results[server] = { success: true, commands: [] };
            (results[server] as { commands: string[] }).commands.push(cmd);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Announcement sent successfully",
        style,
        showTitle,
        playSound,
        results,
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
