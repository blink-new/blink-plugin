---
name: blink-notifications
description: Send emails (HTML/text, attachments, cc/bcc), SMS messages, and manage phone numbers for AI calling. Platform-provided — no API keys needed.
---

## Getting Started

```bash
# Send email
blink notify email user@example.com --subject "Welcome!" --html "<h1>Hello</h1>"

# Send SMS
blink sms send +15551234567 "Your code is 123456"

# List phone numbers
blink phone list

# Buy a phone number
blink phone buy --area-code 415
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `blink_notify_email` | Send email with HTML/text, attachments, cc/bcc |
| `blink_sms_send` | Send SMS message |
| `blink_phone_list` | List owned phone numbers |
| `blink_phone_buy` | Purchase a phone number |
| `blink_phone_release` | Release a phone number permanently (stops billing) |

## Email

No setup required — built into Blink. From address auto-generated as `noreply@{projectId}.blink-email.com`.

```typescript
const { success, messageId } = await blink.notifications.email({
  to: 'customer@example.com',
  subject: 'Order shipped!',
  html: '<h1>Your order is on the way</h1>',
  text: 'Your order is on the way',
})
```

### Full Options

```typescript
await blink.notifications.email({
  to: ['team@example.com', 'manager@example.com'],
  replyTo: 'support@mycompany.com',
  cc: 'accounting@mycompany.com',
  bcc: 'archive@mycompany.com',
  subject: 'Invoice #12345',
  html: '<h2>Invoice Ready</h2><p>See attached.</p>',
  text: 'Invoice Ready. See attached.',
  attachments: [{
    url: 'https://storage.example.com/invoices/12345.pdf',
    filename: 'Invoice-12345.pdf',
    type: 'application/pdf'
  }]
})
```

### Email Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `to` | string \| string[] | Yes | Recipient(s) |
| `subject` | string | Yes | Subject line |
| `html` | string | Yes* | HTML content |
| `text` | string | Yes* | Plain text fallback |
| `replyTo` | string | No | Reply-to address |
| `cc` | string \| string[] | No | CC recipients |
| `bcc` | string \| string[] | No | BCC recipients |
| `attachments` | array | No | File attachments (url + filename) |

*Either `html` or `text` required (both recommended for deliverability)

## SMS

```bash
blink sms send +15551234567 "Your verification code is 847291"
```

```typescript
await blink.notifications.sms({
  to: '+15551234567',
  body: 'Your verification code is 847291'
})
```

## Phone Numbers

Phone numbers are required for AI calling (see `blink-ai` skill) and SMS.

```bash
# List available numbers
blink phone list

# Buy a number in a specific area code
blink phone buy --area-code 415

# Buy any available number
blink phone buy
```

## Best Practices

1. **Always include both HTML and text** for email deliverability
2. **Use `replyTo`** instead of custom `from` address
3. **Validate email format** before sending
4. **Phone numbers use E.164 format** — `+1` prefix for US numbers
