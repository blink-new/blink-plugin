---
name: blink-github
description: >
  GitHub operations via the Blink GitHub App — clone repos, push code, open
  pull requests, create issues, check CI, and call the GitHub REST API. No PAT
  needed. Connect once at blink.new/settings?tab=connectors and every surface
  (CLI, MCP, Claw agents) works automatically.
---

# Blink GitHub

Full GitHub access backed by a workspace GitHub App installation. Tokens are
short-lived (1h), minted just-in-time server-side — no personal access token,
no `gh auth login`, no secrets on disk.

## CLI

```bash
# Show all connected GitHub accounts (workspaces can link multiple)
blink github status

# Clone a repo (token is used for auth, stripped from .git/config after)
blink github clone owner/repo
blink github clone https://github.com/owner/repo.git --branch feat/x

# Print a short-lived token for scripting
blink github token --json | jq -r .token

# Multi-account: pick a specific installation
blink github clone owner/repo --account blink-new
blink github token --account my-employer-org
```

## REST API (connector exec)

```bash
# List repos
blink connector exec github /user/repos GET

# Get a specific repo
blink connector exec github /repos/owner/repo GET

# Create an issue
blink connector exec github /repos/owner/repo/issues POST \
  '{"title":"Bug report","body":"Steps to reproduce..."}'

# List open PRs
blink connector exec github /repos/owner/repo/pulls GET '{"state":"open"}'

# CI status (last 5 runs)
blink connector exec github /repos/owner/repo/actions/runs GET '{"per_page":5}'

# Read a file (returns base64-encoded content)
blink connector exec github /repos/owner/repo/contents/README.md GET
```

## MCP Tools

Use the `blink_connector_exec` tool with `provider: "github"`:

```json
{
  "tool": "blink_connector_exec",
  "provider": "github",
  "method": "/repos/owner/repo/issues",
  "http_method": "POST",
  "params": { "title": "Bug", "body": "Details..." }
}
```

## Prerequisites

Connect GitHub once at **blink.new/settings?tab=connectors**.

The workspace links a GitHub App installation — not a personal OAuth token.
This means:
- Works on SSO/SAML-enforced orgs (no per-token SSO dance)
- Short-lived 1h tokens — no long-lived secrets
- Revoke by uninstalling the App; no keys to rotate manually
- Multi-account: link your personal account + work orgs independently

## On Blink Claw agents

`git clone`, `git push`, `gh pr create` work with zero setup — the Claw
image ships a system-level git credential helper that mints tokens
automatically. No `gh auth login`, no PAT.
