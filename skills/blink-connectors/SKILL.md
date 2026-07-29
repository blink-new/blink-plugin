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

## Google Ads (`composio_googleads`) — reading data

**Every path must start with the API version, and the customer id goes in the PATH, never in the body.** There is no top-level `/search` resource — `/search`, `/googleads/search` and `/searchStream` all 404.

```bash
# Find the customer id
blink connector exec composio_googleads /v23/customers:listAccessibleCustomers GET

# Run a report (GAQL)
blink connector exec composio_googleads /v23/customers/CUSTOMER_ID/googleAds:search POST \
  '{"query":"SELECT campaign.name, metrics.clicks FROM campaign WHERE segments.date DURING LAST_14_DAYS"}'
```

`googleAds:searchStream` works the same way but returns its payload — errors included — wrapped in an array.

### Quota (`RESOURCE_EXHAUSTED`, scope `DEVELOPER`)

A 429 with `rateScope: DEVELOPER` is a cap on Composio's **shared developer token** — pooled across tenants — not on the user's Google Ads account. Nothing the user does to their account fixes it. Honour the `retryDelay` (often 10h+) and surface it to the user rather than retrying into it.

`rateScope: ACCOUNT` means the opposite: that one *is* the user's own account rate limit, and the delay is usually short.

## Google Ads (`composio_googleads`) — writing campaigns

> **The old falsy-stripping workarounds are retired.** Composio's proxy used to
> drop `false`, `0`, `{}` and `[]` from POST bodies
> ([#3324](https://github.com/ComposioHQ/composio/issues/3324)). That was fixed
> upstream on **2026-07-24** and re-verified against the live proxy on
> 2026-07-29. **Send falsy values normally.** Do not build portfolio bidding
> strategies just to avoid `manualCpc: {}`, and do not omit a network setting
> you want off — omitting it means "use account defaults", which is not the same
> as `false`.

1. **Dry-run first with `partialFailure: true` + `validateOnly: true`.** Google
   returns 200 with a `partialFailureError` carrying the full `fieldPathElements`
   list, so you see every bad field at once instead of one error per round trip.
   Flip `validateOnly` to `false` only once the dry-run is clean.

2. **Empty proto markers work inline.** `{ "manualCpc": {} }` satisfies
   `campaign_bidding_strategy` — verified. Portfolio strategies are still the
   right choice when you actually want shared bidding across campaigns, but
   they're no longer a workaround.

3. **`finalUrls` goes at the Asset top level, NOT inside `sitelinkAsset`.** This
   one still holds, but it's plain Google schema, not a proxy quirk:
   `SitelinkAsset` has no `finalUrls` field, so nesting it returns
   `Invalid JSON payload ... Unknown name "finalUrls"`.

4. **v23 requires `containsEuPoliticalAdvertising` on campaign create.** Use the
   string enum: `"containsEuPoliticalAdvertising": "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING"`.
   Omitting it returns `contains_eu_political_advertising: REQUIRED`.

5. **`networkSettings` booleans are real booleans.** Set them `true` or `false`
   as you mean them. Note Google rejects `targetGoogleSearch: false` on a Search
   campaign with `OPERATION_NOT_PERMITTED_FOR_CONTEXT` — that's Google's rule,
   not a stripped field.

### Debugging recipe

```bash
# Dry-run and read the full error list
blink connector exec composio_googleads /v23/customers/CUSTOMER_ID/campaigns:mutate POST \
  '{"operations":[...],"partialFailure":true,"validateOnly":true}'

# Then: read partialFailureError.details[].errors[].location.fieldPathElements
# to see exactly which field Google rejected, fix it, re-run with validateOnly:false
```

> Prefer `connector exec` (the proxy) over `connector tool-execute` (the native
> tool catalog) for Google Ads. The native path collapses Google's error into an
> opaque `Error executing the tool GOOGLEADS_*` with no field detail.

## Error Codes

| Code | Meaning |
|------|---------|
| `CONNECTOR_NOT_CONNECTED` | User hasn't authorized this provider |
| `CONNECTOR_DISABLED` | Provider disabled for this project |
| `MISSING_SCOPE` | Reconnect with additional permissions |
| `*_API_ERROR` | Upstream API error (e.g. `SLACK_API_ERROR`) |

Token refresh is handled automatically by Blink backend.
