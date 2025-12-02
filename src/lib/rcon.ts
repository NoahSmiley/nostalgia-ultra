import { Rcon } from 'rcon-client';

// Frontier server RCON configuration
const FRONTIER_RCON_HOST = process.env.FRONTIER_RCON_HOST || 'n1429.pufferfish.host';
const FRONTIER_RCON_PORT = parseInt(process.env.FRONTIER_RCON_PORT || '25575');
const FRONTIER_RCON_PASSWORD = process.env.FRONTIER_RCON_PASSWORD || '';

export class RconClient {
  private host: string;
  private port: number;
  private password: string;

  constructor(host?: string, port?: number, password?: string) {
    this.host = host || FRONTIER_RCON_HOST;
    this.port = port || FRONTIER_RCON_PORT;
    this.password = password || FRONTIER_RCON_PASSWORD;
  }

  async sendCommand(command: string): Promise<string> {
    const rcon = new Rcon({
      host: this.host,
      port: this.port,
      password: this.password,
    });

    try {
      await rcon.connect();
      const response = await rcon.send(command);
      await rcon.end();
      return response;
    } catch (error) {
      console.error('RCON error:', error);
      throw error;
    }
  }

  // Styled-nicknames commands
  async setNickname(username: string, nickname: string): Promise<string> {
    // styled-nicknames admin command format
    return this.sendCommand(`styled-nicknames set ${username} ${nickname}`);
  }

  async clearNickname(username: string): Promise<string> {
    return this.sendCommand(`styled-nicknames clear ${username}`);
  }
}

// Default client for Frontier server
export const frontierRcon = new RconClient();
