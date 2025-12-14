# endless - Server Infrastructure

## Claude's Role
I serve as the full-time lead software engineer for endless. My responsibilities include:
- Maintaining and developing the Next.js website
- Managing and configuring the Minecraft servers (Velocity, Spawn, Frontier)
- Maintaining and updating the packwiz modpacks (Standard & Ultra)
- Troubleshooting player issues and server problems
- Implementing new features across the stack

## Overview
endless is a Minecraft server network with an integrated Next.js web dashboard for server management, Stripe subscriptions, and whitelist control.

---

## Server Network (Pufferfish Host)

### Connection Info

**SFTP Host:** `sftp://ash-gmp-1012.pufferfish.host:2022`

**SSH Keys:**
- `noahs-desktop` - SHA256:SEOEpzSsvIxwMLZyabkBlIt7XRpuof/p8+JNMBRqJ8U (original desktop)
- `noahs-macbook` - SHA256:k+rV4u/ORQ2USZ04/h2fNzfATv0GoM+HiB3/vLcaPjA (MacBook)

### Servers

| Server | Game Port | SFTP Username | RCON Port | Voice Chat Port | Purpose |
|--------|-----------|---------------|-----------|-----------------|---------|
| Velocity | 25565 | 1xuip1uy.9a993ee5 | 25440 | - | Proxy |
| Spawn | 25782 | 1xuip1uy.b5a84873 | 25853 | - | Hub/lobby |
| Frontier | 25211 | 1xuip1uy.c61d4114 | 25149 | 24454 | Main survival |

**Host:** `n1429.pufferfish.host`

### Additional Servers (removed from velocity.toml)
- ~~Canvas: port 25678~~ (removed)
- ~~Crucible: port 25245~~ (removed)
- ~~Island: port 25768~~ (removed)

---

## Velocity Proxy (Detailed)

### Server Software
- Velocity proxy with Forge compatibility
- `announce-forge = true`, `ping-passthrough = "mods"`

### Plugins
| Plugin | Status | Purpose |
|--------|--------|---------|
| LuckPerms-Velocity-5.5.17.jar | Active | Permissions (pluginmsg sync) |
| velocity-whitelist-api-1.0.0.jar | Active | Custom whitelist with HTTP API |
| ambassador.jar | Active | Server switch handling |
| SignedVelocity-Proxy-1.4.1.jar | Disabled | Signed chat |

### Custom RCON API Service (dist/)
A **Fastify-based Node.js service** runs alongside Velocity providing HTTP endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/whitelist/add` | POST | Add player to whitelist |
| `/whitelist/remove` | POST | Remove player from whitelist |
| `/whitelist/status/:username` | GET | Check whitelist status |
| `/rcon/execute` | POST | Execute RCON command on Velocity |
| `/backend/execute` | POST | Execute on specific backend server |
| `/backend/execute-all` | POST | Execute on all backend servers |
| `/backend/servers` | GET | List configured backend servers |

**API Port:** 3001
**Auth Header:** `x-api-secret`

### Whitelist API Plugin
- **HTTP Port:** 25989
- **API Secret:** `Gu25tUyHzYhyOAAIQIRyWBVoRtpQKLvgOFqBsOGi8UC23Dn0dhH3Lp5DbszGRdLn`
- **Whitelist File:** `/plugins/whitelist-api/whitelist.txt`

### Current Whitelisted Players
lucid111, mikeyyroxx, dereksawesome3, kernevski, rayraydaquan, xxexphiosxx, evosity, javarison_lamar, sammunism1

### Old Fabric 1.21.1 Mods (in Velocity mods/ folder - NOT ACTIVE for Forge)
These are remnants from the old Fabric setup - the styled-nicknames we need is here!
- **styled-nicknames-1.6.0+1.21.jar** ← Need to find Forge equivalent
- **styled-chat-2.6.1+1.21.jar**
- DistantHorizons, Dynmap, FallingTree, LuckPerms-Fabric
- fabric-api, fabric-language-kotlin, cloth-config
- voicechat, polymer, placeholder-api, etc.

### Velocity Config
```toml
bind = "0.0.0.0:25565"
motd = "<bold>endless</bold>"
show-max-players = 100
online-mode = true
player-info-forwarding-mode = "modern"
announce-forge = true
ping-passthrough = "mods"

[servers]
spawn = "n1429.pufferfish.host:25782"
frontier = "n1429.pufferfish.host:25211"

try = ["frontier"]
```

### Ambassador Plugin Config
Handles player reconnection during server switches:
```toml
disconnect-reset-message = "&6Please reconnect"
server-switch-cancellation-time = 120
```

### Fabric Tab Config
```json
{
  "header": "§f§lendless",
  "footer": "",
  "enabled": true
}
```

### Velocity Backup
- `archive-2025-12-12T210742Z.tar.gz` (122MB) - Backup from migration

---

## Frontier Server (Main Survival - Detailed)

### Server Properties
- **Gamemode:** Survival
- **Difficulty:** Normal
- **PVP:** Enabled
- **View Distance:** 16
- **Simulation Distance:** 10
- **Online Mode:** false (handled by Velocity)
- **Command Blocks:** Enabled
- **RCON:** Disabled in server.properties (external port 25149)

### Operators
| Username | UUID | Level |
|----------|------|-------|
| lucid111 | ccb0e5be-255e-4ae2-b50d-2484eb1a3a20 | 4 |
| javarison_lamar | 59dfdbe3-4862-4539-9c23-d363b3c2c4c4 | 4 |

### Mods (85 total)

**Core/Tech:**
- Create 6.0.8
- Mekanism 10.4.16.80
- Applied Energistics 2 15.4.10
- CC: Tweaked 1.116.2
- GuideME 20.1.14 (AE2 guide book)

**Building/Decoration:**
- Chipped 3.0.7
- Chisel 2.0.0
- Create Deco 2.0.3
- Macaw's Bridges 3.1.0
- Supplementaries 3.1.41
- Amendments 2.2.3
- Athena 3.1.2

**Adventure/Combat:**
- Tinkers Construct 3.10.2.92
- TACZ (Guns) 1.1.7 + CS2 Knives Pack v1.0.1
- LR Tactical 0.3.0
- Quark 4.0-462
- Botania 450
- Nyfs Spiders 2.1.1

**Transportation:**
- Steam & Rails 1.6.14-beta
- Moving Elevators 1.4.11
- Astikor Carts 1.1.8
- Waystones 14.1.17

**Storage/QoL:**
- Iron Chests 14.4.4
- Sophisticated Backpacks 3.24.13
- Traveler's Backpack 9.1.46
- Lootr 0.7.35 (randomized loot)
- Shulker Box Tooltip 4.0.4
- Carry On 2.1.2.7
- Inventory Sorter 23.1.9

**Recipe/Info:**
- JEI 15.20.0.127
- EMI 1.1.22
- Jade 11.13.2
- Patchouli 84.1
- Polymorph 0.49.10

**Performance:**
- ModernFix 5.25.2
- FerriteCore 6.0.1
- Canary 0.3.3
- Memory Leak Fix 1.1.3
- Clumps 12.0.0.4

**Utility/Server:**
- LuckPerms 5.4.102
- Proxy Compatible Forge 1.1.7
- Voice Chat 2.6.7
- Spark 1.10.53 (profiler)
- Chunky 1.3.146 (pre-gen)
- Corpse 1.0.23 (death corpses)

**Cosmetic/Animation:**
- Not Enough Animations 1.11.1
- Player Animation Lib 1.0.2
- Particular 1.2.7 (particles)
- Squake Reforged 1.3.0F

**Misc:**
- Do A Barrel Roll 3.5.6
- Elytra Slot 6.4.4
- Curios API 5.14.1
- Falling Tree 4.3.4
- Realistic Bees 4.2
- Farm & Charm 1.0.14
- Farmers Delight 1.2.9
- Tectonic 2.2.1 (worldgen)

### World Structure
```
world/
├── DIM-1/          # Nether
├── DIM1/           # End
├── dimensions/     # Custom dimensions
├── region/         # Overworld chunks
├── entities/       # Entity data
├── playerdata/     # Player NBT data
├── advancements/   # Player advancements
├── stats/          # Player statistics
├── data/           # World data (waystones, etc)
└── serverconfig/   # Per-world mod configs
```

### Voice Chat Config
- **Port:** 24454
- **Max Distance:** 48 blocks
- **Whisper Distance:** 24 blocks
- **Groups:** Enabled
- **Recording:** Allowed
- **Force Voice Chat:** No

### JVM Args
Currently using defaults. Recommended: `-Xmx4G` minimum for modded.

---

## Spawn Server (Hub - Detailed)

### Server Properties
- **Gamemode:** Survival
- **Difficulty:** Peaceful
- **Spawn Monsters:** false
- **View Distance:** 10
- **Online Mode:** false

### Operators
| Username | UUID | Level |
|----------|------|-------|
| lucid111 | ccb0e5be-255e-4ae2-b50d-2484eb1a3a20 | 4 |

### Mods (Minimal)
- proxy-compatible-forge-1.1.7.jar (active)
- luckperms-forge-5.4.102.jar (disabled - permissions from Velocity)

---

## RCON Credentials

### Velocity Custom API
```env
API_PORT=3001
API_SECRET=4fd95f99626d29e52a8f4ca4c98629cfc78cab653d703b0c4b076e7a39b68f95
```

### Velocity RCON (internal)
```env
RCON_HOST=localhost
RCON_PORT=25440
RCON_PASSWORD=00c375ca51b6debb4a40cb7480c54c6d
```

### Backend Servers
```env
FRONTIER_RCON_PORT=25149
FRONTIER_RCON_PASSWORD=NostalgiaUltraRcon2024Secret
SPAWN_RCON_PORT=25853
SPAWN_RCON_PASSWORD=NostalgiaUltraRcon2024Secret
CRUCIBLE_RCON_PORT=25768
CRUCIBLE_RCON_PASSWORD=NostalgiaUltraRcon2024Secret
```

### Whitelist API
```env
WHITELIST_API_PORT=25989
WHITELIST_API_SECRET=Gu25tUyHzYhyOAAIQIRyWBVoRtpQKLvgOFqBsOGi8UC23Dn0dhH3Lp5DbszGRdLn
```

---

## LuckPerms Setup

### Architecture
- **Velocity:** H2 database with `pluginmsg` sync to backends
- **Frontier:** Local H2 database (could be synced better)
- **Spawn:** LuckPerms disabled (permissions from Velocity)

### Storage
All servers use local H2 databases. For better sync, could migrate to MySQL/MariaDB.

---

## Web Dashboard (Detailed)

### Stack
- **Framework:** Next.js 16.0.3 with App Router
- **React:** 19.2.0
- **Database:** PostgreSQL (Vercel Postgres)
- **ORM:** Prisma 6.19.0
- **Auth:** NextAuth 5.0.0-beta.30 with Microsoft Entra ID
- **Payments:** Stripe 20.0.0
- **UI:** Tailwind CSS 4, Radix UI, Lucide icons
- **Hosting:** Vercel

### URLs
- **Production:** https://endlessmc.vercel.app/
- **Repo:** https://github.com/NoahSmiley/nostalgia-ultra

### Project Structure
```
nostalgia-ultra/
├── src/
│   ├── app/
│   │   ├── (landing)/          # Public pages
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── about/          # About page
│   │   │   ├── features/       # Features page
│   │   │   ├── invite/         # Invite code entry
│   │   │   ├── mods/           # Mod list
│   │   │   └── pricing/        # Subscription tiers
│   │   ├── dashboard/          # Protected user area
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── minecraft/      # MC account linking
│   │   │   ├── subscription/   # Manage subscription
│   │   │   ├── mods/           # View mods
│   │   │   ├── install/        # Installation guide
│   │   │   ├── status/         # Server status
│   │   │   ├── map/            # World map (if enabled)
│   │   │   ├── rules/          # Server rules
│   │   │   ├── updates/        # Changelog
│   │   │   ├── features/       # Feature showcase
│   │   │   └── admin/          # Admin-only routes
│   │   │       ├── announce/   # Send announcements
│   │   │       ├── invites/    # Manage invite codes
│   │   │       ├── players/    # Player management
│   │   │       ├── updates/    # Post updates
│   │   │       └── vouchers/   # Subscription vouchers
│   │   ├── api/                # API routes
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   ├── lib/
│   │   ├── auth.ts             # NextAuth config
│   │   ├── auth.config.ts      # Auth callbacks
│   │   ├── db.ts               # Prisma client
│   │   ├── stripe.ts           # Stripe client & tiers
│   │   ├── mc-control.ts       # HTTP client for Velocity API
│   │   └── rcon.ts             # Direct RCON client
│   ├── config/
│   │   ├── server.ts           # Server config (OUTDATED!)
│   │   └── pricing.ts          # Subscription pricing
│   └── components/             # React components
└── prisma/
    └── schema.prisma           # Database schema
```

### API Routes

#### Authentication
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth handlers |
| `/api/invite/validate` | POST | Validate invite code |
| `/api/invite/set` | POST | Store invite code in cookie |

#### Minecraft Integration
| Route | Method | Description |
|-------|--------|-------------|
| `/api/minecraft/verify` | POST | Link MC account (username → UUID) |
| `/api/minecraft/unlink` | POST | Unlink MC account |
| `/api/minecraft/account` | GET | Get linked account info |
| `/api/minecraft/nickname` | POST/DELETE | Set/clear Ultra nickname |

#### Stripe/Subscriptions
| Route | Method | Description |
|-------|--------|-------------|
| `/api/stripe/checkout` | POST | Create checkout session |
| `/api/stripe/create-subscription` | POST | Create embedded subscription |
| `/api/stripe/confirm-subscription` | POST | Confirm subscription after payment |
| `/api/stripe/cancel-subscription` | POST | Cancel subscription |
| `/api/stripe/reactivate-subscription` | POST | Reactivate canceled subscription |
| `/api/stripe/update-payment-method` | POST | Update payment method |
| `/api/stripe/portal` | POST | Get Stripe portal URL |
| `/api/stripe/billing` | GET | Get billing info |
| `/api/stripe/webhook` | POST | Stripe webhook handler |
| `/api/subscription` | GET | Get current subscription |
| `/api/voucher/redeem` | POST | Redeem subscription voucher |

#### Admin Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/announce` | POST | Send server announcement |
| `/api/admin/invites` | GET/POST | List/create invite codes |
| `/api/admin/players` | GET/POST | List/manage players |
| `/api/admin/subscriptions` | GET | List all subscriptions |
| `/api/admin/vouchers` | GET/POST | Manage vouchers |

#### Other
| Route | Method | Description |
|-------|--------|-------------|
| `/api/server/status` | GET | Get MC server status |
| `/api/mods` | GET | List server mods |
| `/api/modpack/versions` | GET | List modpack versions |
| `/api/modpack/new-version` | POST | Record new version |
| `/api/server-updates` | GET/POST | Server changelog |
| `/api/update-banner` | GET | Active update banner |

### Authentication Flow
1. User enters invite code at `/invite` → stored in cookie
2. User clicks "Sign in with Microsoft" → redirects to Microsoft login
3. On callback, `signIn` callback checks:
   - If user exists (by email or Microsoft ID) → sign in
   - If new user without invite code → redirect to `/invite?error=invite_required`
   - If new user with valid invite code → create user, increment invite usage
4. Session includes: `id`, `username`, `minecraftLinked`, `hasActiveSubscription`, `isAdmin`

### Subscription Tiers
```typescript
// From src/lib/stripe.ts
SUBSCRIPTION_TIERS = {
  member: {
    name: 'Member',
    price: 1000,  // $10.00
    priceId: process.env.STRIPE_MEMBER_PRICE_ID,
    features: [
      'Full server access',
      'Member role & perks',
      'Access to all worlds',
      'Community events',
    ],
  },
  ultra: {
    name: 'Ultra',
    price: 1500,   // $15.00 minimum
    minPrice: 1500,
    features: [
      'Everything in Member tier',
      'Ultra role & exclusive perks',
      'Priority support',
      'Vote on server decisions',
      'Early access to updates',
      'Special recognition',
    ],
  },
};

// Ultra has tiered pricing
ULTRA_PRICE_IDS = {
  15: process.env.STRIPE_ULTRA_15_PRICE_ID,
  20: process.env.STRIPE_ULTRA_20_PRICE_ID,
  25: process.env.STRIPE_ULTRA_25_PRICE_ID,
};
```

### Database Schema (Prisma)
```prisma
model User {
  id              String              @id @default(cuid())
  username        String              @unique
  email           String              @unique
  password        String?
  inviteCodeId    String?
  microsoftId     String?             @unique
  displayName     String?
  xboxGamertag    String?
  isAdmin         Boolean             @default(false)
  minecraftLink   MinecraftAccount?
  subscriptions   Subscription[]
  createdInvites  InviteCode[]
  createdVouchers SubscriptionVoucher[]
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
}

model MinecraftAccount {
  id         String   @id @default(cuid())
  userId     String   @unique
  mcUuid     String   @unique
  mcUsername String
  nickname   String?  // Custom nickname for Ultra members
  linkedAt   DateTime @default(now())
}

model Subscription {
  id                String    @id @default(cuid())
  userId            String
  stripeCustomerId  String?   @unique
  stripeSubId       String?   @unique
  status            String    // 'active', 'canceled', 'past_due', etc.
  tier              String    @default("member")  // 'member' or 'ultra'
  monthlyAmount     Int
  currentPeriodEnd  DateTime?
  cancelAtPeriodEnd Boolean   @default(false)
  voucherId         String?
  isLifetime        Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model SubscriptionVoucher {
  id            String       @id @default(cuid())
  code          String       @unique
  type          String       // 'time_limited' or 'lifetime'
  tier          String       // 'member' or 'ultra'
  durationDays  Int?         // null for lifetime
  maxUses       Int          @default(1)
  uses          Int          @default(0)
  active        Boolean      @default(true)
  note          String?
  expiresAt     DateTime?
  createdAt     DateTime     @default(now())
}

model InviteCode {
  id          String   @id @default(cuid())
  code        String   @unique
  maxUses     Int      @default(1)
  uses        Int      @default(0)
  active      Boolean  @default(true)
  note        String?
  createdAt   DateTime @default(now())
}

model ModpackVersion {
  id          String   @id @default(cuid())
  version     String   @unique
  commitSha   String
  releasedAt  DateTime @default(now())
  changelogMd String
}

model ServerUpdate {
  id          String   @id @default(cuid())
  title       String
  description String
  changes     String[]
  isHighlight Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

### Stripe Webhook Flow
The webhook at `/api/stripe/webhook` handles:
1. `checkout.session.completed` - Initial checkout complete
2. `invoice.paid` / `invoice.payment_succeeded` - Payment success
3. `customer.subscription.created` - New subscription
4. `customer.subscription.updated` - Status change
5. `customer.subscription.deleted` - Subscription canceled
6. `payment_intent.succeeded` - Embedded flow payment success

On subscription activation:
- Adds player to Minecraft whitelist via `mcControl.addToWhitelist()`
- Sets LuckPerms group via `mcControl.setPlayerGroup(username, tier)`

On subscription cancellation:
- Removes player from whitelist
- Clears LuckPerms subscription groups

### Dual RCON Architecture
The website has TWO ways to communicate with MC servers:

1. **mc-control.ts** (HTTP Client)
   - Connects to Velocity's custom Fastify API (port 3001)
   - Uses `x-api-secret` header for auth
   - Methods: `addToWhitelist`, `removeFromWhitelist`, `setPlayerGroup`, `executeOnAllBackends`
   - This is the PRIMARY method used by the webhook

2. **rcon.ts** (Direct RCON)
   - Direct RCON connections to each backend server
   - Uses rcon-client npm package
   - Configured for: Frontier, Spawn, ~~Crucible~~ (should remove)
   - Helper functions: `sendToAllServers`, `setNicknameOnAllServers`

**Note:** There's redundancy here. Consider consolidating to use only mc-control.ts.

### Nickname System (Ultra Members)
Ultra members can set custom nicknames with MiniMessage formatting:
- Endpoint: `POST /api/minecraft/nickname`
- Prefix: `<color:#61DAFB>[Ultra]</color> `
- Uses `styled-nicknames` mod command via RCON
- **ISSUE:** styled-nicknames is Fabric 1.21.1, need Forge 1.20.1 equivalent

### Static Mod Data Files
The website uses static JSON files for mod lists (enriched with Modrinth API data):

- [src/data/mods-base.json](nostalgia-ultra/src/data/mods-base.json) - Standard modpack (71 mods)
- [src/data/mods-ultra.json](nostalgia-ultra/src/data/mods-ultra.json) - Ultra modpack (102 mods)

**Ultra-Only Mods Include:**
- Sodium, Iris Shaders, Indium
- Camera Overhaul, Not Enough Animations
- Entity Culling, More Culling, ImmediatelyFast
- Nvidium, Particle Rain, Wakes, Wavey Capes
- CIT Resewn, Continuity, EMF/ETF
- BadOptimizations (Apple Silicon issue!)

### Known Website Issues

1. **CRITICAL: server.ts config is outdated** - [src/config/server.ts](nostalgia-ultra/src/config/server.ts)
   - `mcVersion: '1.21.1'` - **should be `1.20.1`**
   - `fabricVersion: '0.18.1'` - **should reference Forge**
   - `modCount: 40` / `modCountUltra: 74` - **outdated** (mods-base.json has 71, mods-ultra.json has 102)
   - `ip: 'n1429.pufferfish.host:19132'` - Uses Bedrock port, should be `:25565`
   - Status page & install guide use these wrong values!

2. **WORLDS config references unused servers** - [src/config/server.ts](nostalgia-ultra/src/config/server.ts)
   - Canvas and Crucible listed as "coming_soon" but may be removed

3. **Crucible in rcon.ts** - [src/lib/rcon.ts](nostalgia-ultra/src/lib/rcon.ts)
   - Has Crucible server config that should be removed

4. **MC verification is demo mode** - [src/app/api/minecraft/verify/route.ts](nostalgia-ultra/src/app/api/minecraft/verify/route.ts)
   - Currently just trusts username input, generates fake UUID
   - Comment says "For demo purposes" - should use Mojang API

5. **Install guide references Fabric** - [src/app/dashboard/install/page.tsx](nostalgia-ultra/src/app/dashboard/install/page.tsx)
   - Step 2: "install Fabric Loader" - **should be Forge**
   - Uses `SERVER_CONFIG.fabricVersion` - need to change config first

### Environment Variables Required
```env
# Database
DATABASE_URL=
POSTGRES_URL=

# Microsoft Auth
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# MC Control API (Velocity's Fastify service)
MC_CONTROL_URL=http://n1429.pufferfish.host:3001
MC_CONTROL_API_SECRET=4fd95f99626d29e52a8f4ca4c98629cfc78cab653d703b0c4b076e7a39b68f95

# Direct RCON (to backend servers)
RCON_HOST=n1429.pufferfish.host
FRONTIER_RCON_PORT=25149
FRONTIER_RCON_PASSWORD=NostalgiaUltraRcon2024Secret
SPAWN_RCON_PORT=25853
SPAWN_RCON_PASSWORD=NostalgiaUltraRcon2024Secret

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MEMBER_PRICE_ID=
STRIPE_ULTRA_15_PRICE_ID=
STRIPE_ULTRA_20_PRICE_ID=
STRIPE_ULTRA_25_PRICE_ID=

# Public config
NEXT_PUBLIC_SERVER_IP=n1429.pufferfish.host:19132
NEXT_PUBLIC_MC_VERSION=1.20.1
NEXT_PUBLIC_MODPACK_URL=https://noahsmiley.github.io/noahs-server-modpack/Noahs-Server.mrpack
```

---

## Modpacks (Packwiz) - Exhaustive Deep Dive

Both modpacks are **Forge 1.20.1** with Forge version **47.3.0**.

### Standard Modpack
- **Repo:** https://github.com/NoahSmiley/noahs-server-modpack
- **GitHub Pages:** https://noahsmiley.github.io/noahs-server-modpack/
- **Version:** 2.0.0
- **Mods:** 125 total (84 both-side, 39 client-only, 2 server-only)
- **Resourcepacks:** 2 (Fresh Animations, Fresh Animations Extensions)
- **Shaderpacks:** None

### Ultra Modpack (Premium Subscribers)
- **Repo:** https://github.com/NoahSmiley/noahs-server-modpack-ultra
- **GitHub Pages:** https://noahsmiley.github.io/noahs-server-modpack-ultra/
- **Version:** 2.0.0
- **Mods:** 125 total (same as Standard)
- **Resourcepacks:** 5 (Fresh Animations, Fresh Animations Extensions, Clear Glass, Entity Texture Features Translation, Fresh Moves)
- **Shaderpacks:** 4 (Bliss Shader, BSL Shaders, Complementary Reimagined, Complementary Unbound)

### Difference Between Standard and Ultra
The mods are **identical** between both packs. The difference is:
- Ultra has **4 shader packs** (Standard has none)
- Ultra has **3 extra resource packs** (Clear Glass, ETF Translation, Fresh Moves)

### Modpack Issues Found

#### CRITICAL: Corrupted Filename
```
/Users/noahsmile/Desktop/nu/noahs-server-modpack/mods && cp cUsersnoahsDesktopservermodpack-ultramodsserious-player-animations.pw.toml cUsersnoahsDesktopservermodpackmods
```
This is a file with a shell command as its name - from a failed copy operation. **Must be deleted.**

#### CRITICAL: README.md is Wrong
[noahs-server-modpack/README.md](noahs-server-modpack/README.md) says:
```
**Minecraft 1.21.1 | Fabric**
```
Should say:
```
**Minecraft 1.20.1 | Forge**
```

#### BUG: proxy-compatible-forge marked as server-only
In [mods/proxy-compatible-forge.pw.toml](noahs-server-modpack/mods/proxy-compatible-forge.pw.toml):
```toml
side = "server"
```
This mod is needed on the CLIENT for modern forwarding to work. Should be `side = "both"` or remove it from modpack (clients don't need it if using Velocity's built-in forwarding).

#### Version Mismatch: proxy-compatible-forge
- **Modpack version:** 1.2.1
- **Server version:** 1.1.7
Should update server to 1.2.1 or modpack to 1.1.7.

#### harvest-with-ease marked as server-only
In [mods/harvest-with-ease.pw.toml](noahs-server-modpack/mods/harvest-with-ease.pw.toml):
```toml
side = "server"
```
Clients won't download this mod, which may cause issues if server expects it.

### Key Mod Versions (for sync verification)
| Mod | Modpack Version | Server Version | Match? |
|-----|-----------------|----------------|--------|
| Particular | 1.2.7 | 1.2.7 | ✅ |
| TACZ | 1.1.7 | 1.1.7 | ✅ |
| Voice Chat | 2.6.7 | 2.6.7 | ✅ |
| proxy-compatible-forge | 1.2.1 | 1.1.7 | ❌ |

### Apple Silicon Compatibility (Dev Only)
**Note:** All players use Windows PCs. These mods only affect Noah's Mac dev/testing environment:
- Embeddium, Oculus, BadOptimizations, Physics Mod, Particle Rain, BiomeParticleWeather, EntityCulling, Distant Horizons, Canary

For local testing on Mac, disable these client-side mods manually in the Prism Launcher instance.

### GitHub Actions Workflow
Both modpacks use `.github/workflows/publish.yml`:
- Triggers on: tags (`v*`), main branch push, manual dispatch
- Uses packwiz to refresh and export `.mrpack`
- Deploys to GitHub Pages
- Notifies website API of new versions

### Packwiz File Structure
```
noahs-server-modpack/
├── pack.toml                    # Main config (version, MC/Forge version)
├── index.toml                   # File manifest with hashes
├── mods/                        # 125 .pw.toml files
│   ├── create.pw.toml
│   ├── mekanism.pw.toml
│   └── ...
├── resourcepacks/               # 2 .pw.toml files
├── Noahs-Server.mrpack          # Exported modpack
├── README.md                    # Installation guide (WRONG VERSION!)
└── .github/workflows/publish.yml
```

---

## Local Development

### Workspace
```
/Users/noahsmile/Desktop/nu/
├── claude.md                    # This file
├── nostalgia-ultra/             # Website repo
├── noahs-server-modpack/        # Standard modpack
└── noahs-server-modpack-ultra/  # Ultra modpack
```

### Prism Launcher Instance
- **Instance:** `/Users/noahsmile/Library/Application Support/PrismLauncher/instances/1.20.1/`
- **Mods:** `/Users/noahsmile/Library/Application Support/PrismLauncher/instances/1.20.1/minecraft/mods/`

### SFTP Quick Commands
```bash
# Connect to Frontier
sftp -P 2022 1xuip1uy.c61d4114@ash-gmp-1012.pufferfish.host

# Connect to Spawn
sftp -P 2022 1xuip1uy.b5a84873@ash-gmp-1012.pufferfish.host

# Connect to Velocity
sftp -P 2022 1xuip1uy.9a993ee5@ash-gmp-1012.pufferfish.host
```

---

## Known Issues

### macOS Apple Silicon (Dev Only)
These mods cause issues on M-series Macs. All players use Windows PCs, so this only affects Noah's local testing. Disable manually in Prism Launcher when testing on Mac:
- Embeddium, Oculus, Rubidium-extra, DistantHorizons, Physics-mod, Canary, BadOptimizations, BiomeParticleWeather, Particlerain, Entityculling, **Particular** (causes channel rejection disconnects)

### Frontier Mods (Forge 1.20.1) - Major Content
The server includes these major content mods:
- **Create** (19MB) - Mechanical contraptions and automation
- **Mekanism** (12.5MB) - Advanced tech and machinery
- **Applied Energistics 2** (8.5MB) - Storage and autocrafting
- **Tinkers' Construct** (19.8MB) - Tool customization
- **Botania** (12.2MB) - Nature magic
- **Quark** (15MB) - Vanilla+ additions
- **Farmers Delight** - Cooking and farming
- **CC: Tweaked** - ComputerCraft computers
- **Steam 'n Rails** (10MB) - Create addon for trains
- **TACZ** (52MB) - Tactical firearms mod
- **Supplementaries** (13.6MB) - Decoration and utility
- **Chipped/Chisel** - Building blocks
- **LR Tactical** (5.2MB) - Tactical gear
- **Waystones** - Fast travel
- **Sophisticated Backpacks** - Upgradeable backpacks
- **Iron Chests** - Storage expansion
- **Lootr** - Instanced loot chests
- **Voice Chat** (4.9MB) - Proximity voice

### Migration Notes
- Recently migrated from Fabric 1.21.1 to Forge 1.20.1
- Old Fabric mods still in Velocity's mods/ folder (including styled-nicknames source)
- Frontier has leftover `forge-1.21.11-61.0.2-shim.jar` file

### Connection Issues (Observed Dec 14, 2025)
Player `lucid111` experiencing repeated disconnections:
- Multiple "Connection reset by peer" errors in Velocity logs
- "Disconnected" within seconds of joining Frontier
- One instance: "Channels [particular:main] rejected their client side version number" - mod version mismatch
- Suggests possible client-server mod sync issues

### Historical Crash (Dec 13, 2025)
Old crash report from before GuideME/resourcefullib were added:
```
Mod chipped requires resourcefullib 2.1.20 or above - Currently not installed
Mod ae2 requires guideme 20.1.7 or above - Currently not installed
```
These have since been resolved (mods are now installed).

### Crucible in Backend Configs
Crucible server is still referenced in multiple places that need cleanup:
- Velocity `.env` file
- Velocity `plugins/whitelist-api/backends.properties`
- Website `src/lib/rcon.ts`

---

## Architecture Diagram

```
                    ┌─────────────────────────────────────────┐
                    │           Vercel (Website)              │
                    │  endlessmc.vercel.app                   │
                    │  - Next.js 16 + Prisma                  │
                    │  - Stripe payments                      │
                    │  - User/subscription management         │
                    └─────────────────┬───────────────────────┘
                                      │ RCON (direct to backends)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Pufferfish Host                                       │
│  n1429.pufferfish.host                                                       │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Velocity Proxy (:25565)                                              │   │
│  │  - Player routing (online-mode=true)                                 │   │
│  │  - LuckPerms (pluginmsg sync)                                        │   │
│  │  - whitelist-api plugin (:25989)                                     │   │
│  │  - Custom Fastify RCON API (:3001)                                   │   │
│  │  - RCON (:25440)                                                     │   │
│  └─────────────────────┬────────────────────────────────────────────────┘   │
│                        │ modern forwarding                                   │
│          ┌─────────────┴─────────────┐                                      │
│          ▼                           ▼                                      │
│  ┌───────────────┐           ┌─────────────────┐                            │
│  │ Spawn (:25782)│           │Frontier (:25211)│                            │
│  │ Hub/Lobby     │           │ Main Survival   │                            │
│  │ Peaceful      │           │ 85 mods         │                            │
│  │ RCON :25853   │           │ RCON :25149     │                            │
│  │               │           │ Voice :24454    │                            │
│  └───────────────┘           └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           GitHub Pages                   │
│  Packwiz Modpack Distribution           │
│  - noahs-server-modpack (standard)      │
│  - noahs-server-modpack-ultra (premium) │
└─────────────────────────────────────────┘
```

---

## TODO / Action Items

### CRITICAL - Fix Immediately

~~All CRITICAL items have been fixed and deployed (Dec 14, 2025)~~

1. ✅ **Fixed server.ts config** - mcVersion, forgeVersion, port, mod counts all corrected
2. ✅ **Fixed ALL hardcoded version references** - Changed 1.21.1 → 1.20.1 across all files
3. ✅ **Fixed ALL hardcoded mod count references** - Changed to 125+ across all files
4. ✅ **Fixed MC verification auto-whitelist bug** - Now only whitelists users with active subscription
5. ✅ **Deleted corrupted filename in modpack**
6. ✅ **Fixed modpack README.md** - Now says Minecraft 1.20.1 | Forge
7. ✅ **Fixed proxy-compatible-forge** - Removed from client modpacks (server-only mod)

### HIGH Priority

1. ✅ **Fixed Fabric references in install guide** - [src/app/dashboard/install/page.tsx](nostalgia-ultra/src/app/dashboard/install/page.tsx)
   - Now references Forge and SERVER_CONFIG.forgeVersion

2. ✅ **Fixed links.ts Fabric reference** - [src/config/links.ts](nostalgia-ultra/src/config/links.ts)
   - Changed to forgeInstaller with Forge download link

3. ✅ **Installed Fakename mod on Frontier & Spawn**
   - **Saro's Fakename Port** for Forge 1.20.1-1.20.6: https://modrinth.com/mod/saros-fakename-port
   - File: `fakename-1.20.1-saros-port-1.5.jar` (58 KB) - installed on both servers
   - Requires Forge 47.4.0-48 (compatible with server's Forge 47.4.10)
   - Commands: `/fakename set [player] <name>` (aliases: `/fn`, `/fname`)
   - Supports color codes with `&` (use quotes for names with spaces/colors)
   - Requires OP permissions
   - ✅ Website RCON commands updated to use `/fakename` instead of `/styled-nicknames`
   - ✅ Nickname API updated to use Minecraft `&` color codes instead of MiniMessage

4. ✅ **Removed Crucible references everywhere:**
   | Location | Status |
   |----------|--------|
   | Velocity `.env` | ✅ Fixed |
   | Velocity `velocity.toml` | ✅ Fixed |
   | Velocity `backends.properties` | ✅ Fixed |
   | Website [rcon.ts](nostalgia-ultra/src/lib/rcon.ts) | ✅ Fixed |

5. ✅ **Fixed map page** - [src/app/dashboard/map/page.tsx](nostalgia-ultra/src/app/dashboard/map/page.tsx)
   - Removed Crucible from SERVERS array

### MEDIUM Priority

1. ✅ **Fixed MC verification to use Mojang API** - [src/app/api/minecraft/verify/route.ts](nostalgia-ultra/src/app/api/minecraft/verify/route.ts)
   - Now fetches real UUID from Mojang API (`api.mojang.com/users/profiles/minecraft/`)
   - Returns proper error if username doesn't exist
   - Checks for duplicate accounts using UUID (more reliable than username)

2. ✅ **Updated WORLDS config** - [src/config/server.ts](nostalgia-ultra/src/config/server.ts)
   - Only Frontier is listed (Canvas/Crucible removed)

3. ✅ **Cleaned up old Fabric mods from Velocity** - Removed all 43 jar files from mods/ folder
   - styled-nicknames, styled-chat, DistantHorizons, Dynmap, FallingTree, LuckPerms-Fabric
   - fabric-api, fabric-language-kotlin, cloth-config, voicechat, polymer, etc.
   - mods/ folder now empty (Velocity is a proxy, doesn't need game mods)

4. ✅ **Cleaned up Frontier** - forge shim file already removed

5. ✅ **Added javarison_lamar as operator on Spawn**
   - Both lucid111 and javarison_lamar are now ops on Spawn server

6. ✅ **JVM args for Frontier**
   - Managed via Pufferfish hosting panel (not through SFTP)
   - `user_jvm_args.txt` exists but panel may not use it
   - Removed leftover `forge-1.21.11-61.0.2-shim.jar` file

7. ✅ **Updated mods-base.json / mods-ultra.json**
   - Now contains 87 Forge 1.20.1 mods matching Frontier server
   - Both files are identical (Ultra has same mods, just extra shaders/resourcepacks in packwiz)
   - Fixed Java version requirement: 17 (not 21)

8. ✅ **Fixed dual RCON architecture**
   - [mc-control.ts](nostalgia-ultra/src/lib/mc-control.ts) - HTTP client to Velocity API (updated to use Fakename)
   - [rcon.ts](nostalgia-ultra/src/lib/rcon.ts) - Direct RCON client (already uses Fakename)
   - Both now use `fakename` commands instead of `styled-nicknames`
   - Note: Keeping both - mc-control.ts is primary (used by webhook/APIs), rcon.ts as backup

9. **LuckPerms MySQL sync** (optional future improvement)
   - All servers currently use separate H2 databases with pluginmsg sync
   - Could improve permission sync with shared MySQL, but current setup works

### LOW Priority

1. ✅ **Welcome messages configured**
   - `welcomemessage.json` shows "Welcome to endless" styled message

2. **Add Dynmap or BlueMap** for web-based map viewing (optional)

3. ✅ **Fixed status page**
   - Already shows Forge (uses SERVER_CONFIG.forgeVersion)
   - Changed "Live Map (Dynmap)" to "Voice Chat" (actual feature)

4. **Enable RCON in Frontier server.properties** (optional)
   - Currently `enable-rcon=false` in server.properties
   - Using external RCON port 25149 via Pufferfish panel (works fine)

---

## Exhaustive File Inventory (4th Pass)

### Velocity Server Files

| File Path | Purpose | Key Contents |
|-----------|---------|--------------|
| `/.env` | Environment config | API secrets, RCON passwords for all servers |
| `/velocity.toml` | Main proxy config | Server routes, MOTD, forwarding mode |
| `/forwarding.secret` | Modern forwarding | `8A3bZHnV00pG` |
| `/plugins/luckperms/config.yml` | Permissions | H2 storage, pluginmsg sync |
| `/plugins/luckperms/luckperms-velocity.db` | H2 database | Permission data |
| `/plugins/whitelist-api/config.properties` | Whitelist plugin | Port 25989, API secret |
| `/plugins/whitelist-api/whitelist.txt` | Player whitelist | 9 players |
| `/plugins/whitelist-api/backends.properties` | Backend RCON | All server passwords |
| `/plugins/ambassador/config.toml` | Server switching | Disconnect handling |
| `/plugins/SignedVelocity/config.yml` | Signed chat | Disabled |
| `/config/fabric-tab.json` | Tab list | "endless" header (white bold) |
| `/config/welcomemessage.json` | Welcome messages | "Welcome to endless" styled message |
| `/config/biome_replacer.properties` | Biome changes | LOTR aesthetic (no desert/badlands/mushroom) |
| `/dist/index.js` | Fastify RCON API | HTTP endpoints for server control |
| `/mods/` | Server mods | Empty (Velocity proxy doesn't need game mods) |

### Frontier Server Files

| File Path | Purpose | Key Contents |
|-----------|---------|--------------|
| `/server.properties` | Server config | Port 25211, view-distance=16, online-mode=false |
| `/ops.json` | Operators | lucid111 + javarison_lamar (level 4) |
| `/whitelist.json` | Whitelist | Empty (handled by Velocity) |
| `/banned-players.json` | Bans | Empty |
| `/banned-ips.json` | IP bans | Empty |
| `/config/proxy-compatible-forge.toml` | Forwarding | Secret `8A3bZHnV00pG` |
| `/config/voicechat/voicechat-server.properties` | Voice chat | Port 24454, max 48 blocks |
| `/config/particular-common.toml` | Particles | Fireflies, falling leaves enabled |
| `/config/tacz-common.toml` | Guns mod | Tactical firearms config |
| `/mods/` | Server mods | 85 Forge mods |
| `/world/` | World data | Overworld, Nether, End, dimensions |
| `/logs/latest.log` | Server log | Shows disconnection issues |
| `/jvm.txt` | JVM args | Example config (not active) |

### Spawn Server Files

| File Path | Purpose | Key Contents |
|-----------|---------|--------------|
| `/server.properties` | Server config | Port 25782, difficulty=peaceful, spawn-monsters=false |
| `/ops.json` | Operators | lucid111 only (level 4) |
| `/mods/` | Server mods | proxy-compatible-forge + luckperms.disabled |
| `/config/proxy-compatible-forge.toml` | Forwarding | Secret `8A3bZHnV00pG` |

### Website Source Files (110 files)

**Pages:**
| File | Purpose | Issues Found |
|------|---------|--------------|
| `src/app/(landing)/page.tsx` | Homepage | Lines 127, 176: hardcoded "50+" and "1.21.1" |
| `src/app/(landing)/about/page.tsx` | About page | Lines 99-100, 107: "50+" mods, "1.21.1" |
| `src/app/(landing)/features/page.tsx` | Features | Line 103: "50+ Custom Mods" |
| `src/app/(landing)/pricing/page.tsx` | Pricing | Line 110: "50+ curated mods" |
| `src/app/dashboard/install/page.tsx` | Install guide | Lines 206-207: References Fabric |
| `src/app/dashboard/subscription/page.tsx` | Subscription | Line 679: "50+ curated mods" |
| `src/app/dashboard/map/page.tsx` | Map | Lines 28-35: Shows Crucible |
| `src/app/dashboard/updates/page.tsx` | Updates | Lines 171, 175: "1.21.1", "90+" mods |

**API Routes:**
| Route | Issue |
|-------|-------|
| `/api/minecraft/verify` | Lines 71-80: Auto-whitelists regardless of subscription |
| `/api/admin/players` | Line 24: Hardcoded admin email |

**Lib Files:**
| File | Issue |
|------|-------|
| `src/lib/auth.ts` | Lines 94, 137: Hardcoded admin email `noahsmiley123@outlook.com` |
| `src/lib/rcon.ts` | Lines 24-28, 71, 82: Crucible references |

**Config Files:**
| File | Issue |
|------|-------|
| `src/config/server.ts` | Lines 16-17, 22-23: Wrong version, Fabric refs, wrong mod counts |
| `src/config/links.ts` | Line 13: Fabric installer link |

**Components:**
| File | Issue |
|------|-------|
| `src/components/landing/hero.tsx` | Line 22: "Minecraft 1.21.1 Fabric Server" |
| `src/components/landing/pricing.tsx` | Line 19: "50+ curated mods" |

---

## Hardcoded Admin Email Locations

The email `noahsmiley123@outlook.com` is hardcoded as admin in:
1. [src/lib/auth.ts:94](nostalgia-ultra/src/lib/auth.ts#L94) - On user creation
2. [src/lib/auth.ts:137](nostalgia-ultra/src/lib/auth.ts#L137) - In session callback
3. [src/app/api/admin/players/route.ts:24](nostalgia-ultra/src/app/api/admin/players/route.ts#L24) - In isAdmin check
