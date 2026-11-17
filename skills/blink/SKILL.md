---
name: blink
description: Start here for any Blink Cloud task (blink.new). Says how to connect (CLI, SDK, MCP), which Blink skill covers database, auth, storage, AI, backend, queue, deploy or domains, and how to recover from a Blink error. Use when a project uses @blinkdotnew/sdk, the blink CLI, a blnk_ key, or core.blink.new.
---

# Blink

Blink Cloud is one backend for an app: SQL database, auth, file storage, AI gateway, realtime, queue, serverless backend, hosting and custom domains, all under one project and one key. This skill only routes you; load the specific skill before writing code.

## Connect

- **CLI** (deploys, SQL, secrets, domains): `npm install -g @blinkdotnew/cli`, then `blink login`. Add `--json` for machine-readable output.
- **SDK** (app code): `npm install @blinkdotnew/sdk`, then `createClient({ projectId, publishableKey })` in the browser or `createClient({ projectId, secretKey })` on a server.
- **MCP**: remote `https://blink.new/mcp` (OAuth), or local `npx -y @blinkdotnew/mcp@latest`. Discovery: https://blink.new/.well-known/mcp.json.
- **Skills**: `npx skills add blink-new/blink-plugin` installs the Blink skills locally.

## Keys

| Key | Where it goes | What it can do |
|---|---|---|
| `blnk_pk_...` publishable | browser and mobile code | what the project's security policy allows the signed-in user |
| `blnk_sk_...` project secret | server code only | full access to one project |
| `blnk_ak_...` workspace API key | CLI and `blink.new/api/v1` | manage every project in the workspace |

Never put `blnk_sk_` or `blnk_ak_` in code that ships to a browser.

## When something fails

1. Read the error's `code` and `hint` and do what the hint says. The hint is written for you.
2. If it isn't enough, fetch the `docs` URL in the error (markdown).
3. Retry only if the error says it's retryable. Report `request_id` if it keeps failing.
4. If the fix needs money, a plan change or weaker security, tell the user instead of doing it.

All codes, one page: https://blink.new/docs/errors.md. Docs index for agents: https://blink.new/docs/llms.txt.

## Which skill

<!-- BEGIN GENERATED: skill-index (bun scripts/agent-docs/sync-skill-docs.ts; do not edit by hand) -->
- **blink-agents**: Blink Claw agent management — managed AI agent hosting on Fly.io. List agents, check status, manage secrets. For autonomous agents, Telegram/Discord bots, and scheduled workflows. (https://blink.new/.well-known/agent-skills/blink-agents/SKILL.md)
- **blink-ai**: AI Gateway for text generation, image generation/editing, video generation, text-to-speech, audio transcription, and AI phone calls. Unified access to 50+ models. (https://blink.new/.well-known/agent-skills/blink-ai/SKILL.md)
- **blink-auth**: Authentication with managed and headless modes. Social providers, email/password, magic links, RBAC. (https://blink.new/.well-known/agent-skills/blink-auth/SKILL.md)
- **blink-backend**: Blink Backend — Hono server on CF Workers for webhooks, server-side secrets, custom APIs. Pro+ only. Deploy via CLI. (https://blink.new/.well-known/agent-skills/blink-backend/SKILL.md)
- **blink-connectors**: OAuth connector system for 38+ third-party services. Execute API calls to Google, Notion, Slack, Discord, GitHub, Stripe, Jira, HubSpot, Salesforce, LinkedIn, and more. (https://blink.new/.well-known/agent-skills/blink-connectors/SKILL.md)
- **blink-database**: Database CRUD with automatic camelCase conversion. Create, list, update, delete, upsert, count, exists. Raw SQL via CLI. Boolean handling for SQLite. (https://blink.new/.well-known/agent-skills/blink-database/SKILL.md)
- **blink-deploy**: Build and deploy Blink apps to production. Preview vs production deploys, deploy pipeline, static site hosting. (https://blink.new/.well-known/agent-skills/blink-deploy/SKILL.md)
- **blink-domains**: Custom domain management. Add domains, DNS setup, SSL verification, domain search, and domain purchase via CLI. (https://blink.new/.well-known/agent-skills/blink-domains/SKILL.md)
- **blink-full-stack**: End-to-end guide for building and shipping a Blink app. Project setup, SDK init, auth, database, backend, deploy, and custom domains. Index to all other skills. (https://blink.new/.well-known/agent-skills/blink-full-stack/SKILL.md)
- **blink-github**: GitHub operations via the Blink GitHub App — clone repos, push code, open pull requests, create issues, check CI, and call the GitHub REST API. No PAT needed. Connect once at blink.new/settings?tab=connectors and every surface (CLI, MCP, Claw agents) works automatically. (https://blink.new/.well-known/agent-skills/blink-github/SKILL.md)
- **blink-notifications**: Send emails (HTML/text, attachments, cc/bcc), SMS messages, and manage phone numbers for AI calling. Platform-provided — no API keys needed. (https://blink.new/.well-known/agent-skills/blink-notifications/SKILL.md)
- **blink-queue**: Background task queue and cron schedules. Enqueue tasks, named FIFO queues with parallelism, auto-retry. Requires Blink Backend (Pro+). (https://blink.new/.well-known/agent-skills/blink-queue/SKILL.md)
- **blink-rag**: Knowledge base with vector search, document upload, collections, and AI-powered Q&A with citations. Semantic search over uploaded documents. (https://blink.new/.well-known/agent-skills/blink-rag/SKILL.md)
- **blink-realtime**: WebSocket pub/sub messaging with channels, presence tracking, and message history. Real-time communication for chat, collaboration, and live updates. (https://blink.new/.well-known/agent-skills/blink-realtime/SKILL.md)
- **blink-storage**: File upload with progress tracking and public URLs. Download, remove files. CLI for management. Extension auto-detection. (https://blink.new/.well-known/agent-skills/blink-storage/SKILL.md)
<!-- END GENERATED: skill-index -->

<!-- BEGIN GENERATED: troubleshooting (bun scripts/agent-docs/sync-skill-docs.ts; do not edit by hand) -->
## Troubleshooting

Blink Cloud error bodies carry `code`, `hint`, `docs`, `retryable` and `request_id` beside the `error` text. Do what `hint` says first; fetch `docs` (markdown) for the full fix. Every code: https://blink.new/docs/errors.md

- **`PROJECT_SERVER_KEY_REQUIRED`** (HTTP 403, don't retry as is): Call it from your server or Blink backend with the project's secret key (createClient({ projectId, secretKey })). A signed-in app user, a publishable key or no credential is refused. Retrying with the same credential will not help. [Details](https://core.blink.new/errors/PROJECT_SERVER_KEY_REQUIRED.md)
- **`CONNECTOR_SERVER_KEY_REQUIRED`** (HTTP 403, don't retry as is): Move this blink.connectors call to your Blink backend: createClient({ projectId, secretKey: env.BLINK_SECRET_KEY }). Browser code calls your backend route instead. App users, publishable keys and no credential are refused; retrying will not help. [Details](https://core.blink.new/errors/CONNECTOR_SERVER_KEY_REQUIRED.md)
- **`AGENT_WEBHOOK_URL_FORBIDDEN`** (HTTP 403, don't retry as is): An app user's agent call may only use webhook_tools on https://<last 8 of project id>.backend.blink.new. To call another URL, run the agent from your server with the project's secret key (blnk_sk_...). Retrying unchanged will not help. [Details](https://core.blink.new/errors/AGENT_WEBHOOK_URL_FORBIDDEN.md)
- **`INVALID_PROJECT_ID_FORMAT`** (HTTP 400, don't retry as is): The project id in the URL has characters a project id never has. Use the exact id from blink.new or `blink status --json`; retrying the same URL will not help. [Details](https://core.blink.new/errors/INVALID_PROJECT_ID_FORMAT.md)
- **`ACCESS_DENIED`** (HTTP 403, don't retry as is): Blink refused this request. Retrying will not help. Tell the user and stop; they can quote the request_id to Blink support. [Details](https://core.blink.new/errors/ACCESS_DENIED.md)
- **`PROJECT_NOT_FOUND`** (HTTP 404, don't retry as is): No Blink project has this id, or it was deleted. Check the id (blink.new, or `blink status --json` in the project folder) and use it exactly; retrying the same id will not help. [Details](https://core.blink.new/errors/PROJECT_NOT_FOUND.md)
- **`CREDIT_CHECK_UNAVAILABLE`** (HTTP 402, retry may help): Blink could not check this workspace's credits right now; the credits themselves may be fine. Retry in a few seconds. If it keeps failing, report the request_id. [Details](https://core.blink.new/errors/CREDIT_CHECK_UNAVAILABLE.md)
- **`INSUFFICIENT_CREDITS`** (HTTP 402, don't retry as is): The project owner's workspace has no Blink credits left. Retrying will not help. Tell the user to upgrade at https://blink.new/pricing or turn on auto-reload, then stop. [Details](https://core.blink.new/errors/INSUFFICIENT_CREDITS.md)
- **`MODEL_TIER_RESTRICTED`** (HTTP 403, don't retry as is): The requested model needs a higher plan than this workspace has. Retry without `model` (the default model) or with a model the plan includes, or ask the user to upgrade at https://blink.new/pricing. [Details](https://core.blink.new/errors/MODEL_TIER_RESTRICTED.md)
- **`QUEUE_TIER_RESTRICTED`** (HTTP 403, don't retry as is): Blink Queue needs a Pro plan or higher, and this workspace is below it. Retrying will not help. Tell the user to upgrade at https://blink.new/pricing, or do the work without a queue. [Details](https://core.blink.new/errors/QUEUE_TIER_RESTRICTED.md)
- **`INTERNAL`** (HTTP 500, retry may help): Blink hit an internal error. Retry once. If it fails again, stop and report the request_id to the user. [Details](https://core.blink.new/errors/INTERNAL.md)
<!-- END GENERATED: troubleshooting -->
