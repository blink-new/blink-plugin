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
| `blink_connector_linked` | List all OAuth providers currently connected for a project |
| `blink_connector_status` | Check connection status for a specific provider |

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
| **GitHub** | `github` | `/user`, `/repos`, `/issues` — see `blink-github` skill for clone/push/PR |
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
5. **Invalid JSON in CLI params hard-fails (exit 1)** — bad JSON used to silently send `{}`. If you see `Invalid JSON for params: ...`, fix the quoting (shell-escape inner double quotes or use `--input @file.json`).

## Google Ads (`composio_googleads`) — known upstream bug

**Composio's server strips `false`, `0`, `{}`, `[]` from POST bodies before forwarding to Google Ads.** This breaks any call that requires explicit booleans, empty proto messages, or `0` enum values. Tracked at [ComposioHQ/composio#3324](https://github.com/ComposioHQ/composio/issues/3324). Until fixed upstream, follow these patterns:

### Required workarounds

1. **Always set `partialFailure: true` and `validateOnly: true` first.** This converts 400 errors into 200-OK responses with a `partialFailureError` field that ISN'T truncated by Composio's error wrapper — you'll see Google's full `fieldPathElements` and learn which fields were stripped. Switch to `validateOnly: false` only after the dry-run succeeds.

2. **Use portfolio bidding strategies, not inline `{}` markers.**
   - ❌ `{ campaign: { manualCpc: {} } }` — `{}` is stripped, Google returns `REQUIRED`.
   - ✅ Create a portfolio first via `biddingStrategies:mutate` with `type: "TARGET_SPEND"`, then reference the resource name as a string: `{ campaign: { biddingStrategy: "customers/123/biddingStrategies/456" } }`. Strings are never stripped.

3. **Place `finalUrls` at the Asset top level, NOT inside `sitelinkAsset`.** Composio's schema validation drops it from inside the sub-object. Top-level survives.

4. **Include all v23 required enum fields explicitly:**
   - `containsEuPoliticalAdvertising: 2` (NOT_EU_POLITICAL_ADVERTISING) — newly required.
   - `networkSettings.targetGoogleSearch`, `targetSearchNetwork`, `targetContentNetwork`, `targetPartnerSearchNetwork` — set to `true` for Search campaigns. **NEVER pass `false`** — Composio strips it. If you need to exclude a network, omit the field (Google defaults to your account preferences).

### Debugging recipe

When a Google Ads call fails with cryptic `REQUIRED` errors:
```bash
# 1. Add partialFailure + validateOnly to dry-run with full errors
blink connector exec composio_googleads /v23/customers/CUSTOMER_ID/campaigns:mutate POST \
  '{"operations":[...],"partialFailure":true,"validateOnly":true}'

# 2. Read the partialFailureError.details for fieldPathElements
# 3. Replace any { manualCpc: {} } with portfolio bidding string references
# 4. Re-run with validateOnly: false
```

## Error Codes

| Code | Meaning |
|------|---------|
| `CONNECTOR_NOT_CONNECTED` | User hasn't authorized this provider |
| `CONNECTOR_DISABLED` | Provider disabled for this project |
| `MISSING_SCOPE` | Reconnect with additional permissions |
| `*_API_ERROR` | Upstream API error (e.g. `SLACK_API_ERROR`) |

Token refresh is handled automatically by Blink backend.
