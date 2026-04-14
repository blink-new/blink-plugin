# Blink MCP Server

Serverless cloud infrastructure for agentic coding — by [Blink.new](https://blink.new).

Blink gives your AI coding agent direct access to production-grade cloud infrastructure — SQL databases, user authentication, file storage, serverless backends, task queues, custom domains, and hosting — without requiring you to configure infrastructure or deal with DevOps.

[Website](https://blink.new) · [Documentation](https://blink.new/docs) · [CLI](https://www.npmjs.com/package/@blinkdotnew/cli) · [SDK](https://www.npmjs.com/package/@blinkdotnew/sdk)

## Why Blink

| | AWS / GCP | Vercel | Supabase | **Blink** |
|---|---|---|---|---|
| Database | RDS/Spanner setup | ❌ | ✅ Postgres | ✅ SQLite (libSQL) |
| Auth | Cognito/IAM config | ❌ | ✅ | ✅ Zero-config |
| Storage | S3 + IAM policies | ❌ | ✅ | ✅ |
| Backend | Lambda/Cloud Functions | Serverless only | Edge Functions | ✅ Hono on CF Workers |
| Task Queue | SQS/Cloud Tasks | ❌ | ❌ | ✅ Built-in |
| Hosting | CloudFront + S3 | ✅ Frontend only | ❌ | ✅ Full-stack |
| Domains | Route53 config | ✅ | ❌ | ✅ Purchase + connect |
| Setup time | Hours/days | Minutes | Minutes | **One command** |
| DevOps needed | Yes | Some | Some | **None** |

Blink is the serverless cloud that ships with everything. No infrastructure to configure, no services to stitch together, no DevOps to hire.

## Install

```bash
npm install -g @blinkdotnew/mcp
```

## Use with Cursor

Add to your Cursor settings or project `mcp.json`:

```json
{
  "mcpServers": {
    "blink": {
      "command": "npx",
      "args": ["-y", "@blinkdotnew/mcp"],
      "env": { "BLINK_API_KEY": "your-api-key" }
    }
  }
}
```

## Use with Claude Code

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "blink": {
      "command": "npx",
      "args": ["-y", "@blinkdotnew/mcp"],
      "env": { "BLINK_API_KEY": "your-api-key" }
    }
  }
}
```

## Use with Codex

Same config in `.mcp.json` at your project root.

## Get Your API Key

1. Sign up at [blink.new](https://blink.new)
2. Go to [Settings → API Keys](https://blink.new/settings?tab=api-keys)
3. Create an API key (starts with `blnk_ak_`)
4. Set as `BLINK_API_KEY` environment variable

Or use the CLI: `npx @blinkdotnew/cli login`

## Tools (35+)

### Project Management
- `blink_project_list` — List all projects
- `blink_project_create` — Create a new project
- `blink_project_update` — Change name or visibility
- `blink_project_delete` — Delete a project

### Database (SQLite / libSQL)
- `blink_db_query` — Run SQL queries
- `blink_db_tables` — List all tables

### Environment Variables
- `blink_env_list` — List secrets
- `blink_env_set` — Set a secret
- `blink_env_delete` — Delete a secret

### Backend (Cloudflare Workers)
- `blink_backend_deploy` — Deploy Hono server
- `blink_backend_status` — Check deployment status
- `blink_backend_logs` — View request logs

### Auth Configuration
- `blink_auth_get_config` — Get auth providers
- `blink_auth_set_config` — Enable/disable providers

### Hosting & Domains
- `blink_hosting_status` — Check hosting state
- `blink_hosting_activate` — Go live
- `blink_domains_add` — Connect custom domain
- `blink_domains_search` — Search available domains

### Task Queue & Cron
- `blink_queue_enqueue` — Enqueue background task
- `blink_queue_schedule` — Create cron schedule
- `blink_queue_list` — List tasks
- `blink_queue_stats` — Queue overview
- `blink_queue_dlq` — Dead letter queue

### Workspace & Billing
- `blink_workspace_list` — List workspaces
- `blink_credits` — Check credit usage
- `blink_security_set` — Configure module auth
- `blink_cors_set` — Set CORS origins

## Supported Stacks

Blink works with any frontend framework that outputs static files:

- **React** (Vite, Create React App)
- **Next.js** (static export)
- **Vue** / **Nuxt**
- **Svelte** / **SvelteKit**
- **Astro**
- **Expo React Native** (with Blink backend)
- **Plain HTML/CSS/JS**

Backend is TypeScript/JavaScript only (Hono on Cloudflare Workers).

## Links

- [blink.new](https://blink.new) — Sign up and build
- [Documentation](https://blink.new/docs)
- [CLI](https://www.npmjs.com/package/@blinkdotnew/cli) — Terminal companion
- [SDK](https://www.npmjs.com/package/@blinkdotnew/sdk) — Client-side SDK

## License

MIT
