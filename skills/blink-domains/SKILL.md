---
name: blink-domains
description: Custom domain management. Add domains, DNS setup, SSL verification, domain search, and domain purchase via CLI.
---

## Getting Started

```bash
# Add a custom domain to your project
blink domains add myapp.com

# Check domain status and DNS instructions
blink domains list

# Verify DNS is configured
blink domains verify myapp.com
```

## Adding a Custom Domain

```bash
blink domains add myapp.com
```

The CLI outputs DNS records you need to configure:

```
Configure these DNS records at your registrar:

  Type   Name    Value
  CNAME  @       cname.blink.new
  CNAME  www     cname.blink.new

After configuring DNS, run: blink domains verify myapp.com
```

## DNS Configuration

| Domain Type | Record Type | Name | Value |
|-------------|-------------|------|-------|
| Apex (`myapp.com`) | CNAME or A | `@` | `cname.blink.new` |
| Subdomain (`www`) | CNAME | `www` | `cname.blink.new` |
| Wildcard | CNAME | `*` | `cname.blink.new` |

**Apex + www**: Add both records. Blink auto-configures SSL for both.

## SSL Verification

SSL certificates are provisioned automatically after DNS propagation. Verify status:

```bash
blink domains verify myapp.com
# → SSL: active | pending | error
```

DNS propagation can take 1–48 hours. Most providers propagate within 10 minutes.

## Domain Search & Purchase

```bash
# Search for available domains
blink domains search myapp

# Purchase a domain (if available)
blink domains purchase myapp.com
```

Purchased domains are auto-configured — no manual DNS needed.

## Managing Domains

```bash
# List all domains on current project
blink domains list

# Remove a domain
blink domains remove myapp.com
```

## Apex → www Redirect

For apex domains that can't use CNAME records (some registrars), Blink supports automatic apex-to-www redirects:

```bash
blink domains add myapp.com --redirect-www
```

This stores a redirect rule so `myapp.com` → `www.myapp.com` via 301.

## Full Setup Flow

```bash
# 1. Deploy your app first
blink deploy ./dist --prod

# 2. Add domain
blink domains add myapp.com

# 3. Configure DNS at registrar (follow output instructions)

# 4. Verify
blink domains verify myapp.com

# 5. Done — site is live at myapp.com with SSL
```

## Common Issues

| Issue | Fix |
|-------|-----|
| SSL pending | Wait for DNS propagation (up to 48h) |
| CNAME conflict | Remove existing A/AAAA records for the same name |
| Apex CNAME not supported | Use A record or enable www redirect |
| Domain not resolving | Verify records with `dig myapp.com` |
