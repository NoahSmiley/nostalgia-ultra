import { Rcon } from 'rcon-client';

// Server RCON configurations
interface RconConfig {
  host: string;
  port: number;
  password: string;
}

const RCON_HOST = process.env.RCON_HOST || 'n1429.pufferfish.host';

// Each server has its own RCON port and password
const serverConfigs: Record<string, RconConfig> = {
  frontier: {
    host: RCON_HOST,
    port: parseInt(process.env.FRONTIER_RCON_PORT || '25575'),
    password: process.env.FRONTIER_RCON_PASSWORD || '',
  },
  spawn: {
    host: RCON_HOST,
    port: parseInt(process.env.SPAWN_RCON_PORT || '25576'),
    password: process.env.SPAWN_RCON_PASSWORD || '',
  },
};

export class RconClient {
  private config: RconConfig;
  private serverName: string;

  constructor(serverName: string = 'frontier') {
    this.serverName = serverName;
    this.config = serverConfigs[serverName] || serverConfigs.frontier;
  }

  async sendCommand(command: string): Promise<string> {
    const rcon = new Rcon({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
    });

    try {
      await rcon.connect();
      const response = await rcon.send(command);
      await rcon.end();
      return response;
    } catch (error) {
      console.error(`RCON error (${this.serverName}):`, error);
      throw error;
    }
  }

  // Styled-nicknames commands
  async setNickname(username: string, nickname: string): Promise<string> {
    return this.sendCommand(`styled-nicknames set ${username} ${nickname}`);
  }

  async clearNickname(username: string): Promise<string> {
    return this.sendCommand(`styled-nicknames clear ${username}`);
  }
}

// Individual server clients
export const frontierRcon = new RconClient('frontier');
export const spawnRcon = new RconClient('spawn');

// Helper to send a command to all servers
export async function sendToAllServers(
  command: string
): Promise<Record<string, { success: boolean; response?: string; error?: string }>> {
  const results: Record<string, { success: boolean; response?: string; error?: string }> = {};

  const servers = [
    { name: 'frontier', client: frontierRcon },
    { name: 'spawn', client: spawnRcon },
  ];

  await Promise.all(
    servers.map(async ({ name, client }) => {
      try {
        const response = await client.sendCommand(command);
        results[name] = { success: true, response };
      } catch (error) {
        results[name] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    })
  );

  return results;
}

// Helper to set nickname on all servers
export async function setNicknameOnAllServers(
  username: string,
  nickname: string
): Promise<Record<string, { success: boolean; response?: string; error?: string }>> {
  return sendToAllServers(`styled-nicknames set ${username} ${nickname}`);
}

// Helper to clear nickname on all servers
export async function clearNicknameOnAllServers(
  username: string
): Promise<Record<string, { success: boolean; response?: string; error?: string }>> {
  return sendToAllServers(`styled-nicknames clear ${username}`);
}
