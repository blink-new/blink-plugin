# Blink Plugin for Cursor, Claude Code, and Codex

Serverless cloud infrastructure for agentic coding.

Blink is the cloud platform built for AI coding agents. It provides everything your app needs to go from idea to production — SQL databases, user authentication, file storage, serverless backends, task queues, custom domains, and hosting — all fully managed so you never have to configure infrastructure or deal with DevOps.

## What You Get

| Capability | What It Does |
|------------|-------------|
| **Database** | SQLite (libSQL) per project — create tables, query, migrate |
| **Auth** | Google, GitHub, Apple, Microsoft, email/password — toggle on with one command |
| **Storage** | S3-backed file uploads with CDN URLs |
| **Backend** | Hono server on Cloudflare Workers — serverless, globally distributed |
| **Hosting** | Static site hosting with SSL on `*.blinkpowered.com` |
| **Queue** | Background tasks + cron scheduling — built-in job processing |
| **Domains** | Search, purchase, and connect custom domains |
| **AI Gateway** | Multi-model AI access (OpenAI, Anthropic, Google, Fal, ElevenLabs) |

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

## Skills Included

This plugin includes skills that teach your coding agent how to use each Blink feature:

- **blink-full-stack** — End-to-end guide: scaffold → auth → DB → backend → deploy → domain
- **blink-database** — SQL database operations, schema design, migrations
- **blink-auth** — Authentication providers, managed and headless modes
- **blink-backend** — Hono server patterns, environment variables, deployment
- **blink-storage** — File uploads, CDN URLs, public/private files
- **blink-queue** — Background tasks, cron schedules, dead letter queue
- **blink-deploy** — Build and deploy pipeline, preview vs production
- **blink-domains** — Custom domains, DNS setup, SSL, domain purchase

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
