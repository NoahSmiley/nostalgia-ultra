const MC_CONTROL_URL = process.env.MC_CONTROL_URL || 'http://localhost:3001';
const MC_CONTROL_API_SECRET = process.env.MC_CONTROL_API_SECRET;

interface WhitelistResponse {
  success: boolean;
  message: string;
}

interface WhitelistStatusResponse {
  whitelisted: boolean;
  message: string;
}

export class McControlClient {
  private baseUrl: string;
  private apiSecret: string;

  constructor(baseUrl?: string, apiSecret?: string) {
    this.baseUrl = baseUrl || MC_CONTROL_URL;
    this.apiSecret = apiSecret || MC_CONTROL_API_SECRET || '';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': this.apiSecret,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async addToWhitelist(username: string): Promise<WhitelistResponse> {
    return this.request<WhitelistResponse>('/whitelist/add', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async removeFromWhitelist(username: string): Promise<WhitelistResponse> {
    return this.request<WhitelistResponse>('/whitelist/remove', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async checkWhitelistStatus(username: string): Promise<WhitelistStatusResponse> {
    return this.request<WhitelistStatusResponse>(`/whitelist/status/${username}`);
  }

  async executeCommand(command: string): Promise<{ success: boolean; response: string }> {
    return this.request('/rcon/execute', {
      method: 'POST',
      body: JSON.stringify({ command }),
    });
  }

  // LuckPerms group management
  async setPlayerGroup(username: string, group: string): Promise<{ success: boolean; response: string }> {
    // Set the player's primary group (replaces existing primary group)
    return this.executeCommand(`lp user ${username} parent set ${group}`);
  }

  async addPlayerToGroup(username: string, group: string): Promise<{ success: boolean; response: string }> {
    return this.executeCommand(`lp user ${username} parent add ${group}`);
  }

  async removePlayerFromGroup(username: string, group: string): Promise<{ success: boolean; response: string }> {
    return this.executeCommand(`lp user ${username} parent remove ${group}`);
  }

  async clearSubscriptionGroups(username: string): Promise<void> {
    // Remove player from all subscription-related groups
    const subscriptionGroups = ['member', 'ultra'];
    for (const group of subscriptionGroups) {
      try {
        await this.removePlayerFromGroup(username, group);
      } catch {
        // Ignore errors if user isn't in the group
      }
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  async getServerStatus(): Promise<ServerStatus> {
    return this.request<ServerStatus>('/server/status');
  }
}

export interface ServerStatus {
  online: boolean;
  players: {
    online: number;
    max: number;
    list?: string[];
  };
  tps?: number;
  uptime?: string;
  worldSize?: string;
}

export const mcControl = new McControlClient();
