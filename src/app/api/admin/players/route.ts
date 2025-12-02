import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mcControl } from "@/lib/mc-control";

async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true, email: true },
  });
  return user?.isAdmin || user?.email === "noahsmiley123@outlook.com";
}

// GET - List all players with their status
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users with their Minecraft accounts and subscriptions
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        minecraftLink: true,
        subscriptions: {
          where: { status: "active" },
        },
      },
    });

    // Get whitelist from Velocity
    let whitelistData: { enabled: boolean; players: string[] } = { enabled: false, players: [] };
    try {
      whitelistData = await mcControl.getWhitelistList();
    } catch (e) {
      console.error("Failed to fetch whitelist:", e);
    }

    // Get online players from Velocity
    let onlinePlayers: { username: string; uuid: string; server?: string; ping: number }[] = [];
    try {
      const onlineData = await mcControl.getOnlinePlayers();
      onlinePlayers = onlineData.players || [];
    } catch (e) {
      console.error("Failed to fetch online players:", e);
    }

    const players = users.map(user => {
      const mcUsername = user.minecraftLink?.mcUsername;
      const isOnline = mcUsername
        ? onlinePlayers.some(p => p.username.toLowerCase() === mcUsername.toLowerCase())
        : false;
      const currentServer = mcUsername
        ? onlinePlayers.find(p => p.username.toLowerCase() === mcUsername.toLowerCase())?.server
        : undefined;
      const isWhitelisted = mcUsername
        ? whitelistData.players.some(p => p.toLowerCase() === mcUsername.toLowerCase())
        : false;

      const activeSub = user.subscriptions[0];

      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        minecraft: user.minecraftLink ? {
          username: user.minecraftLink.mcUsername,
          uuid: user.minecraftLink.mcUuid,
          nickname: user.minecraftLink.nickname,
          isOnline,
          currentServer,
          isWhitelisted,
        } : null,
        subscription: activeSub ? {
          tier: activeSub.tier,
          status: activeSub.status,
          isLifetime: activeSub.isLifetime,
        } : null,
      };
    });

    return NextResponse.json({
      players,
      whitelistEnabled: whitelistData.enabled,
      onlineCount: onlinePlayers.length,
    });
  } catch (error) {
    console.error("Failed to fetch players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}

// POST - Perform actions on players (whitelist, kick, set group, etc.)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, username, userId, ...params } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    switch (action) {
      case "whitelist_add": {
        if (!username) {
          return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }
        const result = await mcControl.addToWhitelist(username);
        return NextResponse.json(result);
      }

      case "whitelist_remove": {
        if (!username) {
          return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }
        const result = await mcControl.removeFromWhitelist(username);
        return NextResponse.json(result);
      }

      case "whitelist_toggle": {
        const enabled = params.enabled as boolean;
        const result = await mcControl.setWhitelistEnabled(enabled);
        return NextResponse.json(result);
      }

      case "kick": {
        if (!username) {
          return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }
        const result = await mcControl.kickPlayer(username, params.reason);
        return NextResponse.json(result);
      }

      case "set_group": {
        if (!username || !params.group) {
          return NextResponse.json({ error: "Username and group are required" }, { status: 400 });
        }
        const result = await mcControl.setPlayerGroup(username, params.group);
        return NextResponse.json(result);
      }

      case "add_group": {
        if (!username || !params.group) {
          return NextResponse.json({ error: "Username and group are required" }, { status: 400 });
        }
        const result = await mcControl.addPlayerToGroup(username, params.group);
        return NextResponse.json(result);
      }

      case "remove_group": {
        if (!username || !params.group) {
          return NextResponse.json({ error: "Username and group are required" }, { status: 400 });
        }
        const result = await mcControl.removePlayerFromGroup(username, params.group);
        return NextResponse.json(result);
      }

      case "set_nickname": {
        if (!username || !params.nickname) {
          return NextResponse.json({ error: "Username and nickname are required" }, { status: 400 });
        }
        // Update in database
        if (userId) {
          await prisma.minecraftAccount.update({
            where: { userId },
            data: { nickname: params.nickname },
          });
        }
        // Update in game
        const result = await mcControl.setPlayerNickname(username, params.nickname);
        return NextResponse.json(result);
      }

      case "clear_nickname": {
        if (!username) {
          return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }
        // Update in database
        if (userId) {
          await prisma.minecraftAccount.update({
            where: { userId },
            data: { nickname: null },
          });
        }
        // Update in game
        const result = await mcControl.clearPlayerNickname(username);
        return NextResponse.json(result);
      }

      case "execute_command": {
        if (!params.command) {
          return NextResponse.json({ error: "Command is required" }, { status: 400 });
        }
        const result = await mcControl.executeCommand(params.command);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Failed to perform action:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to perform action" },
      { status: 500 }
    );
  }
}
