---
name: blink-domains
description: Custom domain management. Add domains, DNS setup, SSL verification, domain search, and domain purchase via CLI.
---

## MCP Tools

`blink_domains_add` · `blink_domains_list` · `blink_domains_verify` · `blink_domains_remove` · `blink_domains_search` · `blink_domains_purchase`

## Getting Started

```bash
# Add a custom domain to your project
blink domains add myapp.com

# Check domain status and DNS instructions
blink domains list

# Verify DNS is configured (domain_id from `blink domains list` or `blink domains add`)
blink domains verify <domain_id>
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

After configuring DNS, run: blink domains verify <domain_id>
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
# domain_id comes from `blink domains list` or `blink domains add` response
blink domains verify <domain_id>
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

# Remove a domain (use domain_id, not domain name)
blink domains remove <domain_id>
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

# 4. Verify (use domain_id from step 2)
blink domains verify <domain_id>

# 5. Done — site is live at myapp.com with SSL
```

## Common Issues

| Issue | Fix |
|-------|-----|
| SSL pending | Wait for DNS propagation (up to 48h) |
| CNAME conflict | Remove existing A/AAAA records for the same name |
| Apex CNAME not supported | Use A record or enable www redirect |
| Domain not resolving | Verify records with `dig myapp.com` |
