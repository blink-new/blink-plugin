# AGENTS.md — blink-plugin

Blink plugin for Cursor, Claude Code, and Codex. Serverless cloud infrastructure for agentic coding.

**Public repo**: [github.com/blink-new/blink-plugin](https://github.com/blink-new/blink-plugin)

## Structure

```
.cursor-plugin/plugin.json    Cursor manifest
.claude-plugin/plugin.json    Claude Code manifest
.codex-plugin/plugin.json     Codex manifest
mcp.json                      MCP server config (STDIO: npx @blinkdotnew/mcp)
mcp/                          MCP server npm package (@blinkdotnew/mcp)
  src/index.ts                STDIO entry — registers all tools
  src/lib/api.ts              HTTP client (blink.new + core.blink.new)
  src/tools/                  Tool definitions by category
skills/                       8 SKILL.md files for agent domain knowledge
```

## npm Packages


| Package            | Version | Repo                     | Auto-publish                                    |
| ------------------ | ------- | ------------------------ | ----------------------------------------------- |
| `@blinkdotnew/mcp` | 1.0.x   | `blink-new/blink-plugin` | Push to main + bump `mcp/package.json`          |
| `@blinkdotnew/cli` | 0.6.x   | `blink-new/blink-sdk`    | Push to main + bump `packages/cli/package.json` |
| `@blinkdotnew/sdk` | 2.4.x   | `blink-new/blink-sdk`    | Push to main + bump `packages/sdk/package.json` |


## Publishing MCP

Automated via `.github/workflows/publish-mcp.yml`. Fires on push to `main` when `mcp/package.json` changes.

```bash
cd services/blink-plugin/mcp
# bump version in package.json
npm run build  # verify locally
cd ..
git add mcp/package.json && git commit -m "chore: bump MCP to vX.X.X"
git push origin main
# → GitHub Actions publishes to npm in ~20s
```

Auth: OIDC Trusted Publisher. Configured on npmjs.com for `blink-new/blink-plugin` + `publish-mcp.yml` + environment `npm`.

## MCP Tools (62)

18 tool categories, all STDIO transport:


| Category      | Tools                                                                                  |
| ------------- | -------------------------------------------------------------------------------------- |
| Project       | `blink_project_list`, `_create`, `_get`, `_update`, `_delete`                          |
| Env           | `blink_env_list`, `_set`, `_delete`                                                    |
| Backend       | `blink_backend_deploy`, `_status`, `_logs`                                             |
| Database      | `blink_db_query`, `_tables`                                                            |
| Auth          | `blink_auth_get_config`, `_set_config`                                                 |
| Hosting       | `blink_hosting_status`, `_activate`, `_deactivate`                                     |
| Domains       | `blink_domains_list`, `_add`, `_verify`, `_search`                                     |
| Queue         | `blink_queue_enqueue`, `_schedule`, `_list`, `_stats`, `_cancel`, `_schedules`, `_dlq` |
| Workspace     | `blink_workspace_list`, `_credits`, `_security_get`, `_security_set`, `_cors_set`      |
| AI Gateway    | `blink_ai_text`, `_image`, `_video`, `_speech`, `_transcribe`, `_call`                 |
| Storage       | `blink_storage_list`, `_url`, `_delete`                                                |
| Realtime      | `blink_realtime_publish`                                                               |
| RAG           | `blink_rag_search`, `_collections`                                                     |
| Notifications | `blink_notify_email`, `_sms_send`                                                      |
| Connectors    | `blink_connector_exec`, `_providers`, `_status`                                        |
| Web           | `blink_web_search`, `_fetch`, `_scrape`                                                |
| Agents        | `blink_agent_list`, `_status`, `_secrets_list`, `_secrets_set`, `_secrets_delete`       |
| Phone         | `blink_phone_list`, `_buy`, `_release`                                                 |


## Skills (14)


| Skill              | Covers                                                     |
| ------------------ | ---------------------------------------------------------- |
| `blink-full-stack` | End-to-end: create → auth → DB → backend → deploy → domain |
| `blink-database`   | SQL CRUD, schema, migrations, SDK methods                  |
| `blink-auth`       | Managed + headless modes, providers, BYOC                  |
| `blink-backend`    | Hono server, CF Workers, env vars, deployment              |
| `blink-storage`    | Upload/download, CDN URLs, SDK methods                     |
| `blink-queue`      | Background tasks, cron, DLQ, named queues                  |
| `blink-deploy`     | Build pipeline, preview vs production                      |
| `blink-domains`    | Custom domains, DNS, SSL, purchase                         |
| `blink-ai`         | AI Gateway — text, image, video, speech, transcription, calls |
| `blink-realtime`   | WebSocket pub/sub, channels, events                        |
| `blink-rag`        | Knowledge base, semantic search, document upload           |
| `blink-notifications` | Email, SMS, phone numbers                               |
| `blink-connectors` | OAuth integrations (38 providers), exec calls              |
| `blink-agents`     | Claw agent management, secrets, use cases                  |


## Auth

MCP tools authenticate via `BLINK_API_KEY` env var (workspace API key, `blnk_ak_*`). The API client in `mcp/src/lib/api.ts` sends it as `Authorization: Bearer` header. Routes on blink.new accept workspace keys via `verifyIdToken` wrapper in `adminUserService.ts`.

## Adding a New Tool

1. Create or edit a file in `mcp/src/tools/`
2. Export tools as `{ name: { description, inputSchema (Zod), execute } }`
3. Import and spread into `allTools` in `mcp/src/index.ts`
4. Bump version in `mcp/package.json`
5. `npm run build` to verify
6. Commit + push → auto-publishes

## Marketplace Submission

- **Cursor**: Submit repo URL at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish)
- **Claude Code**: Submit at [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit)
- **Codex**: Submit to official Codex plugin directory (coming soon)

