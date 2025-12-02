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

interface WhitelistListResponse {
  success: boolean;
  enabled: boolean;
  players: string[];
}

interface OnlinePlayer {
  username: string;
  uuid: string;
  server?: string;
  ping: number;
}

interface OnlinePlayersResponse {
  success: boolean;
  players: OnlinePlayer[];
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
    return this.request('/command/execute', {
      method: 'POST',
      body: JSON.stringify({ command }),
    });
  }

  // LuckPerms group management
  async setPlayerGroup(username: string, group: string): Promise<{ success: boolean; response: string }> {
    return this.executeCommand(`lp user ${username} parent set ${group}`);
  }

  async addPlayerToGroup(username: string, group: string): Promise<{ success: boolean; response: string }> {
    return this.executeCommand(`lp user ${username} parent add ${group}`);
  }

  async removePlayerFromGroup(username: string, group: string): Promise<{ success: boolean; response: string }> {
    return this.executeCommand(`lp user ${username} parent remove ${group}`);
  }

  async clearSubscriptionGroups(username: string): Promise<void> {
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

  async getWhitelistList(): Promise<WhitelistListResponse> {
    return this.request<WhitelistListResponse>('/whitelist/list');
  }

  async getOnlinePlayers(): Promise<OnlinePlayersResponse> {
    return this.request<OnlinePlayersResponse>('/server/players');
  }

  async kickPlayer(username: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return this.request('/player/kick', {
      method: 'POST',
      body: JSON.stringify({ username, reason }),
    });
  }

  async setWhitelistEnabled(enabled: boolean): Promise<{ success: boolean; message: string }> {
    return this.request(enabled ? '/whitelist/enable' : '/whitelist/disable', {
      method: 'POST',
    });
  }

  // Nickname management (styled-nicknames mod on backend servers)
  async setPlayerNickname(username: string, nickname: string): Promise<{ success: boolean; response: string }> {
    return this.executeCommand(`styled-nicknames set ${username} ${nickname}`);
  }

  async clearPlayerNickname(username: string): Promise<{ success: boolean; response: string }> {
    return this.executeCommand(`styled-nicknames clear ${username}`);
  }

  // Execute command on all backend Fabric servers via RCON
  async executeOnAllBackends(command: string): Promise<{ success: boolean; results?: Record<string, { success: boolean; response: string }>; error?: string }> {
    try {
      const response = await this.request<{ success: boolean; results: Record<string, { success: boolean; response: string }> }>('/backend/execute-all', {
        method: 'POST',
        body: JSON.stringify({ command }),
      });
      return { success: response.success, results: response.results };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Set nickname on all backend servers via RCON
  async setNicknameOnAllServers(username: string, nickname: string): Promise<{ success: boolean; results?: Record<string, { success: boolean; response: string }>; error?: string }> {
    return this.executeOnAllBackends(`styled-nicknames set ${username} ${nickname}`);
  }

  // Clear nickname on all backend servers
  async clearNicknameOnAllServers(username: string): Promise<{ success: boolean; results?: Record<string, { success: boolean; response: string }>; error?: string }> {
    return this.executeOnAllBackends(`styled-nicknames clear ${username}`);
  }

  // Server announcements - broadcast message to all players
  async broadcastAnnouncement(message: string): Promise<{ success: boolean; response: string }> {
    return this.executeCommand(`alert ${message}`);
  }

  // Send formatted announcement with MiniMessage styling
  async broadcastFormattedAnnouncement(message: string): Promise<{ success: boolean; response: string }> {
    return this.executeCommand(`broadcast ${message}`);
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
