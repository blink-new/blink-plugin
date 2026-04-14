---
name: blink-agents
description: Blink Claw agent management — managed AI agent hosting on Fly.io. List agents, check status, manage secrets. For autonomous agents, Telegram/Discord bots, and scheduled workflows.
---

## What is Blink Claw?

Blink Claw provides **managed AI agent hosting** on Fly.io. Each agent runs in its own isolated Fly machine with persistent storage, pre-installed tools (browser, file system, CLI), and always-on connectivity for platforms like Telegram, Discord, and Slack.

## Getting Started

```bash
# List all agents in the workspace
blink agent list

# Check agent status
blink agent status <agent-id>

# Manage agent secrets
blink secrets list <agent-id>
blink secrets set <agent-id> MY_API_KEY=sk-123
blink secrets delete <agent-id> MY_API_KEY
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `blink_agent_list` | List all Claw agents in the workspace |
| `blink_agent_status` | Get agent status, machine info, and health |
| `blink_secrets_list` | List secret names for an agent |
| `blink_secrets_set` | Set a secret on an agent |
| `blink_secrets_delete` | Delete a secret from an agent |

## Agent Lifecycle

Agents are created and configured via the Blink dashboard at `blink.new`. Once created:

1. **Running** — Agent machine is active, processing tasks
2. **Stopped** — Machine paused, can be resumed
3. **Error** — Machine crashed, check logs

## CLI Usage

```bash
# List agents with status
blink agent list
# Output:
# ID              Name            Status    Platform    Created
# ag_a1b2c3d4     Support Bot     running   telegram    2026-03-15
# ag_e5f6g7h8     Data Scraper    stopped   none        2026-04-01

# Get detailed status
blink agent status ag_a1b2c3d4
# Output:
# Name: Support Bot
# Status: running
# Platform: telegram
# Machine: blink-claw-a1b2c3d4 (iad)
# Uptime: 3d 14h 22m
# Memory: 512MB / 1GB

# Set environment secrets
blink secrets set ag_a1b2c3d4 OPENAI_API_KEY=sk-abc123
blink secrets set ag_a1b2c3d4 TELEGRAM_BOT_TOKEN=123456:ABC

# List secrets (values hidden)
blink secrets list ag_a1b2c3d4
# Output:
# OPENAI_API_KEY     ****abc123
# TELEGRAM_BOT_TOKEN ****ET:ABC

# Remove a secret
blink secrets delete ag_a1b2c3d4 OPENAI_API_KEY
```

## Use Cases

- **Telegram/Discord/Slack bots** — always-on agents connected to messaging platforms
- **Autonomous research agents** — web browsing, data collection, report generation
- **Scheduled workflows** — periodic data processing, monitoring, alerts
- **Customer support** — AI-powered ticket triage and response
- **DevOps automation** — deployment monitoring, incident response

## Agent Architecture

Each Claw agent runs on a dedicated Fly.io machine with:
- **Persistent volume** at `/data` (workspace files, agent state)
- **Pre-installed tools**: Chromium browser, Blink CLI, Node.js
- **Networking**: public HTTPS endpoint + WebSocket gateway
- **Skills**: bundled in Docker image at `/app/skills/`

## Notes

- Agent creation/configuration is done via the Blink dashboard, not CLI
- Secrets are stored in the Fly machine's `env` config — not Fly app secrets
- Agents are billed per-hour of machine uptime
- Each agent gets its own Fly app: `blink-claw-{last8ofAgentId}`
