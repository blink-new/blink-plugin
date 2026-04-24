# Blink Plugin for Cursor, Claude Code, and Codex

Build and host full-stack apps with managed database, auth, storage, backend, queue, and custom domains — all from your editor.

By [Blink.new](https://blink.new) · [Documentation](https://blink.new/docs) · [CLI](https://www.npmjs.com/package/@blinkdotnew/cli) · [SDK](https://www.npmjs.com/package/@blinkdotnew/sdk) · [MCP Package](https://www.npmjs.com/package/@blinkdotnew/mcp)

## What You Get

| Capability | What It Does |
|------------|-------------|
| **Database** | SQLite (libSQL) per project — create tables, query, migrate |
| **Auth** | Google, GitHub, Apple, Microsoft, email/password — toggle on with one command |
| **Storage** | S3-backed file uploads with CDN URLs |
| **Backend** | Hono server on Cloudflare Workers — serverless, globally distributed |
| **Hosting** | Static site hosting with SSL on `*.sites.blink.new` |
| **Queue** | Background tasks + cron scheduling — built-in job processing |
| **Domains** | Search, purchase, and connect custom domains |
| **AI Gateway** | Multi-model AI access (OpenAI, Anthropic, Google, Fal, ElevenLabs) |
| **Realtime** | WebSocket pub/sub for live updates |
| **RAG** | Knowledge base with semantic search |
| **Connectors** | 40+ OAuth integrations (Notion, Slack, Discord, Google, GitHub, Stripe, etc.) |
| **Notifications** | Email and SMS delivery |

## Quick Setup

### 1. Get Your API Key

Sign up at [blink.new](https://blink.new), then go to [Settings → API Keys](https://blink.new/settings?tab=api-keys).

### 2. Add to Your Editor

**Cursor** — Install from the Cursor Marketplace, or add to your project `mcp.json`:

```json
{
  "mcpServers": {
    "blink": {
      "command": "npx",
      "args": ["-y", "@blinkdotnew/mcp"],
      "env": { "BLINK_API_KEY": "blnk_ak_..." }
    }
  }
}
```

**Claude Code** — Add to `.mcp.json` at your project root (same config).

**Codex** — Add to `.mcp.json` at your project root (same config).

### 3. Start Building

Ask your agent:

> "Create a new Blink project called my-app with Google auth, a users table, and deploy it"

The agent will use the MCP tools to create the project, configure auth, set up the database, and deploy — all automatically.

## What's Included

### Skills (15)

Skills teach your agent how to use each Blink feature end-to-end:

- **blink-full-stack** — End-to-end guide: scaffold → auth → DB → backend → deploy → domain
- **blink-database** — SQL database operations, schema design, migrations
- **blink-auth** — Authentication providers, managed and headless modes
- **blink-backend** — Hono server patterns, environment variables, deployment
- **blink-storage** — File uploads, CDN URLs, public/private files
- **blink-queue** — Background tasks, cron schedules, dead letter queue
- **blink-deploy** — Build and deploy pipeline, preview vs production
- **blink-domains** — Custom domains, DNS setup, SSL, domain purchase
- **blink-ai** — AI Gateway: text, image, video, speech, transcription
- **blink-realtime** — WebSocket pub/sub, channels, presence
- **blink-rag** — Knowledge base, semantic search, document upload
- **blink-notifications** — Email and SMS delivery
- **blink-connectors** — OAuth integrations (40+ providers)
- **blink-agents** — Cloud agent management and secrets
- **blink-github** — GitHub operations via Blink GitHub App (clone, push, PR, issues)

### Agents (4)

Specialized subagents that can be delegated to for focused work (Claude Code + Cursor):

- **full-stack-builder** — Builds complete apps end-to-end on Blink
- **frontend-developer** — UI components, layouts, styling, routing
- **backend-developer** — Database schema, edge functions, auth, queues, integrations
- **verifier** — Code review: bugs, imports, types, security, deploy readiness

### Rules

Persistent coding rules that ensure correct Blink SDK usage, database patterns, and deployment practices. Applied automatically when building on Blink.

### MCP Tools (62)

62 tools across 18 categories for programmatic platform management:

| Category | Tools |
|----------|-------|
| Project | create, list, get, update, delete |
| Database | query (SQL), list tables |
| Auth | get config, set config (providers, BYOC) |
| Backend | deploy, status, logs |
| Environment | list, set, delete secrets |
| Hosting | status, activate, deactivate |
| Domains | list, add, verify, search |
| Queue | enqueue, schedule, list, stats, cancel, schedules, DLQ |
| Workspace | list, credits, security, CORS |
| AI Gateway | text, image, video, speech, transcribe, call |
| Storage | list, get URL, delete |
| Realtime | publish to channel |
| RAG | search, list collections |
| Notifications | send email, send SMS |
| Connectors | execute, list linked, check status |
| Web | search, fetch URL |
| Agents | list, status, secrets CRUD |
| Phone | list numbers, buy, release |

## Companion CLI

For terminal use alongside the MCP tools:

```bash
npm install -g @blinkdotnew/cli
blink login
blink init --name "my-app"
blink deploy ./dist --prod
```

See [@blinkdotnew/cli on npm](https://www.npmjs.com/package/@blinkdotnew/cli).

## Links

- [blink.new](https://blink.new) — Sign up and build
- [Documentation](https://blink.new/docs)
- [MCP Package](https://www.npmjs.com/package/@blinkdotnew/mcp)
- [CLI Package](https://www.npmjs.com/package/@blinkdotnew/cli)
- [SDK Package](https://www.npmjs.com/package/@blinkdotnew/sdk)

## License

MIT
