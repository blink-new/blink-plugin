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

# Deploy to production
blink deploy ./dist --prod

# Preview deploy (temporary URL)
blink deploy ./dist

# List deployments
blink deployments

# List saved version snapshots
blink versions list

# Restore a version snapshot (version rollback)
blink versions restore <version_id>
```

## Deploy Pipeline

```
1. npm run build          → generates ./dist (or .next, out/, build/)
2. blink deploy ./dist    → uploads to Blink hosting
3. URL printed            → {projectId}.sites.blink.new (or custom domain)
```

## Preview vs Production

| Flag | Behavior | URL |
|------|----------|-----|
| (none) | Preview deploy | Temporary preview URL |
| `--prod` | Production deploy | `{projectId}.sites.blink.new` + custom domains |

```bash
# Preview — test before going live
blink deploy ./dist
# → https://preview-abc123.sites.blink.new

# Production — replaces live site
blink deploy ./dist --prod
# → https://{projectId}.sites.blink.new
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
