# AGENTS.md — blink-plugin

Blink plugin for Cursor, Claude Code, and Codex. Build and host full-stack apps with managed database, auth, storage, backend, queue, and custom domains.

**Public repo**: [github.com/blink-new/blink-plugin](https://github.com/blink-new/blink-plugin)

## Structure

```
.cursor-plugin/plugin.json    Cursor manifest (skills + rules + MCP)
.claude-plugin/plugin.json    Claude Code manifest (skills + agents + MCP)
.codex-plugin/plugin.json     Codex manifest (skills + MCP)
mcp.json                      MCP server config (STDIO: npx @blinkdotnew/mcp)
mcp/                          MCP server npm package (@blinkdotnew/mcp)
  src/index.ts                STDIO entry — registers all tools
  src/lib/api.ts              HTTP client (blink.new + core.blink.new)
  src/tools/                  Tool definitions by category (18 files)
skills/                       14 SKILL.md files for agent domain knowledge
agents/                       4 agent personas (Claude Code subagents, also works in Cursor)
rules/                        Persistent coding rules (.mdc for Cursor)
.claude/rules/                Same rules as .md for Claude Code
assets/                       logo.svg
```

## npm Packages

| Package            | Version | Repo                     | Auto-publish                                    |
| ------------------ | ------- | ------------------------ | ----------------------------------------------- |
| `@blinkdotnew/mcp` | 1.2.x   | `blink-new/blink-plugin` | Push to main + bump `mcp/package.json`          |
| `@blinkdotnew/cli` | 0.6.x   | `blink-new/blink-sdk`    | Push to main + bump `packages/cli/package.json` |
| `@blinkdotnew/sdk` | 2.4.x   | `blink-new/blink-sdk`    | Push to main + bump `packages/sdk/package.json` |

## Publishing MCP

Automated via `.github/workflows/publish-mcp.yml`. Fires on push to `main` when `mcp/package.json` changes.

Auth: OIDC Trusted Publisher. Configured on npmjs.com for `blink-new/blink-plugin` + `publish-mcp.yml` + environment `npm`.

## MCP Tools (70+)

20 tool categories, all STDIO transport:

| Category      | Tools                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Project       | `blink_project_list`, `_create`, `_get`, `_update`, `_delete`                                                                             |
| Env           | `blink_env_list`, `_set`, `_delete`                                                                                                       |
| Backend       | `blink_backend_deploy`, `_status`, `_logs`                                                                                                |
| Database      | `blink_db_query`, `_schema`                                                                                                               |
| Auth          | `blink_auth_get_config`, `_set_config`                                                                                                    |
| Hosting       | `blink_hosting_status`, `_activate`, `_deactivate`, `_reactivate`                                                                         |
| Domains       | `blink_domains_list`, `_add`, `_verify`, `_remove`, `_search`, `_purchase`, `_connect`, `_my`                                             |
| Queue         | `blink_queue_enqueue`, `_schedule`, `_list`, `_stats`, `_cancel`, `_get`, `_schedules`, `_dlq`, `_create_queue`, `_list_queues`, `_delete_queue`, `_schedule_pause`, `_schedule_resume`, `_schedule_delete`, `_dlq_retry` |
| Workspace     | `blink_workspace_list`, `_create`, `_switch`, `_members`, `_invite`, `blink_credits`, `blink_usage`, `blink_security_get`, `_set`, `blink_cors_get`, `_set` |
| AI Gateway    | `blink_ai_text`, `_image`, `_image_edit`, `_video`, `_animate`, `_speech`, `_transcribe`, `_call`, `_call_status`                         |
| Storage       | `blink_storage_list`, `_url`, `_delete`                                                                                                   |
| Realtime      | `blink_realtime_publish`                                                                                                                  |
| RAG           | `blink_rag_search`, `_collections`                                                                                                        |
| Notifications | `blink_notify_email`, `blink_sms_send`                                                                                                    |
| Connectors    | `blink_connector_exec`, `_linked`, `_status`                                                                                              |
| Web           | `blink_web_search`, `_fetch`                                                                                                              |
| Agents        | `blink_agent_list`, `_status`, `_secrets_list`, `_secrets_set`, `_secrets_delete`                                                         |
| Phone         | `blink_phone_list`, `_buy`, `_release`                                                                                                    |
| Functions     | `blink_functions_list`, `_get`, `_delete`, `_logs`                                                                                        |
| Versions      | `blink_versions_list`, `_save`, `_restore`, `blink_rollback`                                                                              |

## Skills (15)

| Skill              | Covers                                                       |
| ------------------ | ------------------------------------------------------------ |
| `blink-full-stack` | End-to-end: create → auth → DB → backend → deploy → domain  |
| `blink-database`   | SQL CRUD, schema, migrations, SDK methods                    |
| `blink-auth`       | Managed + headless modes, providers, BYOC                    |
| `blink-backend`    | Hono server, CF Workers, env vars, deployment                |
| `blink-storage`    | Upload/download, CDN URLs, SDK methods                       |
| `blink-queue`      | Background tasks, cron, DLQ, named queues                    |
| `blink-deploy`     | Build pipeline, preview vs production, rollback              |
| `blink-domains`    | Custom domains, DNS, SSL, purchase                           |
| `blink-ai`         | AI Gateway — text, image, video, speech, transcription       |
| `blink-realtime`   | WebSocket pub/sub, channels, events                          |
| `blink-rag`        | Knowledge base, semantic search, document upload             |
| `blink-notifications` | Email, SMS, phone numbers                                 |
| `blink-connectors` | OAuth integrations (40+ providers), exec calls               |
| `blink-agents`     | Claw agent management, secrets, use cases                    |
| `blink-github`     | GitHub clone, push, PR, issues via Blink GitHub App          |

## Agents (4)

| Agent               | Role                                                         |
| ------------------- | ------------------------------------------------------------ |
| `full-stack-builder`| Complete app build: project → auth → DB → backend → deploy   |
| `frontend-developer`| UI, components, layouts, routing, styling                    |
| `backend-developer` | Database, edge functions, auth config, queues, integrations  |
| `verifier`          | Code review: bugs, imports, types, security, deploy readiness|

## Rules (1)

`blink-project.mdc` — Persistent coding rules for SDK init, database patterns, backend conventions, secret management. Same content in `.claude/rules/blink-project.md` for Claude Code.

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
