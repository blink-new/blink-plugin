---
name: blink-connectors
description: OAuth connector system for 38+ third-party services. Execute API calls to Google, Notion, Slack, Discord, GitHub, Stripe, Jira, HubSpot, Salesforce, LinkedIn, and more.
---

## Getting Started

```bash
# List available providers
blink connector providers

# Check connection status
blink connector status slack

# Execute an API call
blink connector exec slack /conversations GET
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `blink_connector_exec` | Execute API call through a connected provider |
| `blink_connector_providers` | List all available connector providers |
| `blink_connector_status` | Check if a provider is connected |

## Prerequisites

**Initial OAuth connection must be done in the browser** at `blink.new/settings?tab=connectors`. Users authorize each provider once, then CLI/MCP/SDK can make API calls.

## SDK Usage

```typescript
// Check status
const status = await blink.connectors.status('slack')

// GET request
const channels = await blink.connectors.execute('slack', {
  method: '/conversations',
  http_method: 'GET',
  params: { types: 'public_channel,private_channel' }
})

// POST request
await blink.connectors.execute('slack', {
  method: '/chat/postMessage',
  http_method: 'POST',
  params: { channel: 'C1234', text: 'Hello from Blink!' }
})
```

## Available Providers

| Provider | ID | Common Endpoints |
|----------|-----|-----------------|
| **Slack** | `slack` | `/conversations`, `/chat/postMessage`, `/users` |
| **Discord** | `discord` | `/user`, `/guilds`, `/channels/{id}/messages` |
| **Notion** | `notion` | `/search`, `/databases`, `/pages` |
| **Google Drive** | `google_drive` | `/files` |
| **Google Calendar** | `google_calendar` | `/events` |
| **Google Sheets** | `google_sheets` | `/spreadsheets/{id}/values/{range}` |
| **Google Docs** | `google_docs` | `/documents` |
| **Google Slides** | `google_slides` | `/presentations` |
| **LinkedIn** | `linkedin` | `/userinfo`, `/ugcPosts` |
| **HubSpot** | `hubspot` | `/contacts`, `/companies`, `/deals` |
| **Salesforce** | `salesforce` | `/query`, `/sobjects/{type}` |
| **GitHub** | `github` | `/user`, `/repos`, `/issues` |
| **Stripe** | `stripe` | `/customers`, `/charges`, `/subscriptions` |
| **Jira** | `jira` | `/search`, `/issue`, `/project` |
| **Microsoft** | `microsoft` | `/me`, `/messages`, `/events` |
| **Airtable** | `airtable` | `/bases`, `/records` |

Plus 20+ more — run `blink connector providers` for the full list.

## CLI Examples

```bash
# Slack: list channels
blink connector exec slack /conversations GET

# Notion: search pages
blink connector exec notion /search POST '{"query":"meeting notes"}'

# Google Sheets: read data
blink connector exec google_sheets "/spreadsheets/SHEET_ID/values/Sheet1!A1:D10" GET

# HubSpot: list contacts
blink connector exec hubspot /contacts GET '{"limit":50}'

# Salesforce: SOQL query
blink connector exec salesforce /query GET '{"q":"SELECT Id,Name FROM Account LIMIT 10"}'
```

**CLI syntax**: `blink connector exec <provider> <endpoint> [method] [params]`

## Method Path Rules

1. **Paths start with `/`** — `/conversations` not `conversations`
2. **Dynamic IDs go in the path** — `/channels/${channelId}/messages`
3. **Provider IDs use underscores** — `google_drive`, `google_calendar`, `google_sheets`
4. **GET params** become query parameters; **POST params** become JSON body

## Error Codes

| Code | Meaning |
|------|---------|
| `CONNECTOR_NOT_CONNECTED` | User hasn't authorized this provider |
| `CONNECTOR_DISABLED` | Provider disabled for this project |
| `MISSING_SCOPE` | Reconnect with additional permissions |
| `*_API_ERROR` | Upstream API error (e.g. `SLACK_API_ERROR`) |

Token refresh is handled automatically by Blink backend.
