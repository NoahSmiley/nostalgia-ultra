import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mcControl } from "@/lib/mc-control";

// MiniMessage formatted prefixes for each tier
// Only Ultra and Admin tiers get a prefix - members have no tag
const TIER_PREFIXES: Record<string, string> = {
  ultra: "<color:#61DAFB>[Ultra]</color>",
  admin: "<color:#FF5555>[Admin]</color>",
};

// Format nickname with tier prefix for in-game display
function formatNicknameWithPrefix(nickname: string, tier: string | null): string {
  const prefix = tier ? TIER_PREFIXES[tier] : null;
  return prefix ? `${prefix} <white>${nickname}</white>` : `<white>${nickname}</white>`;
}

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
        const tier = params.group as string;

        // Update LuckPerms group in-game
        const result = await mcControl.setPlayerGroup(username, tier);

        let nicknameCleared = false;
        let hadNickname = false;

        // Also update database subscription if userId provided
        if (userId) {
          // Find or create subscription for user
          const existingSub = await prisma.subscription.findFirst({
            where: { userId, status: "active" },
          });

          if (existingSub) {
            // Update existing subscription tier
            await prisma.subscription.update({
              where: { id: existingSub.id },
              data: { tier },
            });
          } else {
            // Create admin-granted subscription
            await prisma.subscription.create({
              data: {
                userId,
                tier,
                status: "active",
                isLifetime: true, // Admin-granted subscriptions are lifetime
                monthlyAmount: 0, // Admin-granted, no payment
              },
            });
          }

          // Update nickname with new tier prefix (or clear if no nickname)
          const mcAccount = await prisma.minecraftAccount.findUnique({
            where: { userId },
          });
          hadNickname = !!mcAccount?.nickname;
          if (mcAccount?.nickname) {
            // User has a nickname - update it with the new tier prefix
            const formattedNickname = formatNicknameWithPrefix(mcAccount.nickname, tier);
            await mcControl.setNicknameOnAllServers(username, formattedNickname);
          } else {
            // No nickname in database - clear any in-game nickname to remove stale prefixes
            nicknameCleared = true;
            await mcControl.clearNicknameOnAllServers(username);
          }
        }

        return NextResponse.json({
          ...result,
          tier,
          message: `Set ${username} to ${tier}`,
          nicknameCleared,
          hadNickname,
          userId: userId || null,
        });
      }

      case "add_group": {
        if (!username || !params.group) {
          return NextResponse.json({ error: "Username and group are required" }, { status: 400 });
        }
        const result = await mcControl.addPlayerToGroup(username, params.group as string);
        return NextResponse.json(result);
      }

      case "remove_group": {
        if (!username || !params.group) {
          return NextResponse.json({ error: "Username and group are required" }, { status: 400 });
        }
        const result = await mcControl.removePlayerFromGroup(username, params.group as string);

        // Also deactivate subscription in database if userId provided
        if (userId) {
          await prisma.subscription.updateMany({
            where: { userId, status: "active" },
            data: { status: "canceled" },
          });

          // If user has a nickname, update it without tier prefix
          const mcAccount = await prisma.minecraftAccount.findUnique({
            where: { userId },
          });
          if (mcAccount?.nickname) {
            const formattedNickname = formatNicknameWithPrefix(mcAccount.nickname, null);
            await mcControl.setNicknameOnAllServers(username, formattedNickname);
          }
        }

        return NextResponse.json({ ...result, message: `Removed ${username} from all roles` });
      }

      case "set_nickname": {
        if (!username || !params.nickname) {
          return NextResponse.json({ error: "Username and nickname are required" }, { status: 400 });
        }
        // Update in database and get user's subscription tier
        let userTier: string | null = null;
        if (userId) {
          const userWithSub = await prisma.user.findUnique({
            where: { id: userId },
            include: {
              subscriptions: {
                where: { status: "active" },
                take: 1,
              },
            },
          });
          userTier = userWithSub?.subscriptions[0]?.tier || null;

          await prisma.minecraftAccount.update({
            where: { userId },
            data: { nickname: params.nickname },
          });
        }
        // Format nickname with tier prefix and update in game on all backend servers
        const formattedNickname = formatNicknameWithPrefix(params.nickname, userTier);
        const result = await mcControl.setNicknameOnAllServers(username, formattedNickname);
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
        // Update in game on all backend servers via RCON
        const result = await mcControl.clearNicknameOnAllServers(username);
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
