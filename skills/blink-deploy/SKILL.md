---
name: blink-deploy
description: Build and deploy Blink apps to production. Preview vs production deploys, deploy pipeline, static site hosting.
---

## MCP Tools

`blink_rollback` — Restore a project to a previously saved version snapshot (use `blink_versions_list` to find version IDs).

**Frontend deployment is done via CLI** — `blink deploy ./dist --prod`. The MCP has no deploy tool because agents deploy using the CLI after building.

## Getting Started

```bash
# Build your app
npm run build

# Deploy to production — always pass project ID explicitly to avoid "No project context" errors
blink deploy <project_id> ./dist --prod

# OR: link the project first, then deploy without ID
blink link <project_id>
blink deploy ./dist --prod

# After deploying, activate hosting (required to get a live URL)
# Use blink_hosting_activate MCP tool, or:
blink hosting activate <project_id>   # if CLI has this command

# Preview deploy — publishes to the project's own blinkusercontent.com URL (no activation
# needed, but this IS the project's default live site, not a throwaway — see below)
blink deploy <project_id> ./dist

# List saved version snapshots
blink versions list

# Restore a version snapshot (version rollback)
blink versions restore <version_id>
```

## Two hosting systems — do NOT mix them

Blink has two separate hosting paths. **Never call `blink_hosting_activate` after `blink deploy`.**

### Path A — CLI deploy (for externally-built apps)
```bash
blink deploy <project_id> ./dist --prod
# → live immediately at https://{project_slug}.blinkpowered.com
# → NO further steps needed. DO NOT call blink_hosting_activate.
```
The URL is printed by the CLI after deploy. `blink_hosting_status` may still show `inactive` — this is a display lag, the site IS live.

### Path B — Blink sandbox activation (for projects built in the Blink AI editor)
```bash
blink_hosting_activate  # only for sandbox-based projects
# → triggers a fresh build from the Blink sandbox and deploys
```

**Why you must not mix them:**  
`blink_hosting_activate` rebuilds from the Blink sandbox and **overwrites** the S3 files that `blink deploy` uploaded. Calling activate after a CLI deploy replaces your app with the Blink AI template.

### Summary
| Scenario | Command | URL |
|----------|---------|-----|
| App built externally (Vite/Next/React) | `blink deploy <id> ./dist --prod` | `{slug}.blinkpowered.com` |
| App built in Blink AI editor | `blink_hosting_activate` | `{slug}.blinkpowered.com` |
| Preview / default URL | `blink deploy <id> ./dist` (no --prod) | `{projectId}.blinkusercontent.com` |

## Deploy Pipeline

```
1. npm run build          → generates ./dist (or .next, out/, build/)
2. blink deploy ./dist    → uploads to Blink hosting
3. URL printed            → {projectId}.blinkusercontent.com (preview), or {slug}.blinkpowered.com with --prod (or custom domain)
```

## Preview vs Production

**Neither flag is a safe/isolated sandbox — both overwrite a real, live URL.** A preview deploy
publishes to the SAME `blinkusercontent.com` URL the Blink AI editor's own publish path writes to
(and the UI shows as the project's default domain) — running `blink deploy ./dist` without
`--prod` replaces whatever is live there right now.

| Flag | Behavior | URL |
|------|----------|-----|
| (none) | Publishes to the project's default URL — no activation, but not throwaway either | `{projectId}.blinkusercontent.com` |
| `--prod` | Also publishes to the production/custom-domain URL | `{slug}.blinkpowered.com` + custom domains |

```bash
# Publishes to the project's blinkusercontent.com URL — this replaces what's live there now
blink deploy ./dist
# → https://{projectId}.blinkusercontent.com

# Production — replaces live site
blink deploy ./dist --prod
# → https://{slug}.blinkpowered.com
```

## Framework Build Outputs

| Framework | Build Command | Output Dir |
|-----------|--------------|------------|
| React (Vite) | `vite build` | `./dist` |
| Next.js (`output: 'export'`) | `next build` | `./out` |
| Vue | `vite build` | `./dist` |
| Svelte | `vite build` | `./build` |
| Astro | `astro build` | `./dist` |
| Plain HTML/CSS/JS | — | `./` |

For Next.js static export, ensure `next.config.ts` has `output: 'export'`.

## Backend Deploy

Backend (Hono on CF Workers) has its own deploy command — see `blink-backend` skill.

```bash
blink backend deploy
```

## Full Production Checklist

```bash
# 1. Ensure env vars are set
# 2. Build
npm run build

# 3. Deploy frontend
blink deploy ./dist --prod

# 4. Deploy backend (if applicable)
blink backend deploy

# 5. Set up custom domain (optional)
blink domains add myapp.com
```

## Common Issues

| Issue | Fix |
|-------|-----|
| Empty deploy | Check build output directory exists and has files |
| 404 after deploy | Verify correct output dir (`dist/`, `out/`, `build/`) |
| Env vars missing | Set secrets in project settings before build |
| Stale deploy | Ensure `--prod` flag for production updates |
