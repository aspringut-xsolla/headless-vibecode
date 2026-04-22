# Webhooks

Xsolla sends webhooks to notify your server about payment events, enabling real-time order fulfillment.

## Overview

Webhooks are HTTP POST requests sent to your configured endpoint. They notify you of:

- Successful payments
- Order cancellations/refunds
- Subscription events
- Fraud detection results

**Critical**: Webhook processing is how you know to deliver purchased items to users.

---

## Webhook Types

| Type | Code | Description |
|------|------|-------------|
| User Validation | `user_validation` | Verify user exists before payment |
| Payment | `payment` | Payment completed |
| Refund | `refund` | Payment refunded |
| Order Paid | `order_paid` | Order successfully paid (includes items) |
| Order Canceled | `order_canceled` | Order was canceled |
| Subscription Created | `create_subscription` | New subscription started |
| Subscription Updated | `update_subscription` | Subscription renewed/modified |
| Subscription Canceled | `cancel_subscription` | Subscription ended |
| AFS Reject | `afs_reject` | Declined by anti-fraud |
| Dispute | `dispute` | Chargeback/dispute opened |

### Which Webhooks to Process?

**For accounts created after January 22, 2025:**
- Process `order_paid` and `order_canceled` only
- These contain all payment and item information

**For older accounts:**
- Process `payment` and `refund` for payment data
- Process `order_paid` and `order_canceled` for item data

---

## Setup

### Configure Webhook URL

1. Go to Publisher Account → Project Settings → Webhooks
2. Enter your webhook URL (HTTPS required, format: `https://example.com/webhooks`)
3. Secret key auto-generates (click refresh icon to regenerate)
4. Click "Enable webhooks"

### Requirements

- **HTTPS only** - HTTP not supported
- **Public URL** - Must be reachable from internet
- **Fast response** - Recommended < 3 seconds for `order_paid`

### Testing

Use these services before production:
- https://webhook.site - Inspect webhook payloads
- ngrok - Expose local server temporarily

---

## Signature Verification

**Always verify webhook signatures to prevent fraud.**

### Verification Process

1. Extract signature from `Authorization` header: `Signature <signature_value>`
2. Concatenate raw JSON body + your secret key
3. SHA-1 hash the concatenated string
4. Compare (case-insensitive) with received signature

**Critical**: Use the JSON payload exactly as received. Do not parse and re-serialize.

### Node.js Example

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(rawBody, receivedSignature, secretKey) {
  const expectedSignature = crypto
    .createHash('sha1')
    .update(rawBody + secretKey)
    .digest('hex');
  
  // Timing-safe comparison
  return crypto.timingSafeEquals(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(receivedSignature.toLowerCase(), 'utf8')
  );
}

// Express middleware
app.post('/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
  const authHeader = req.headers['authorization'];
  const signature = authHeader?.replace('Signature ', '');
  
  if (!verifyWebhookSignature(req.body.toString(), signature, WEBHOOK_SECRET)) {
    return res.status(400).json({ error: { code: 'INVALID_SIGNATURE' } });
  }
  
  const webhook = JSON.parse(req.body);
  // Process webhook...
  
  res.status(200).send();
});
```

### PHP Example

```php
function verifySignature($rawBody, $receivedSignature, $secretKey) {
    $expectedSignature = sha1($rawBody . $secretKey);
    return hash_equals($expectedSignature, strtolower($receivedSignature));
}

$rawBody = file_get_contents('php://input');
$headers = getallheaders();
$signature = str_replace('Signature ', '', $headers['Authorization'] ?? '');

if (!verifySignature($rawBody, $signature, WEBHOOK_SECRET)) {
    http_response_code(400);
    echo json_encode(['error' => ['code' => 'INVALID_SIGNATURE']]);
    exit;
}

$webhook = json_decode($rawBody, true);
// Process webhook...

http_response_code(200);
```

---

## Webhook Payloads

### order_paid

```json
{
  "notification_type": "order_paid",
  "order": {
    "id": 123456,
    "status": "done",
    "content": {
      "items": [
        {
          "sku": "sword_legendary",
          "quantity": 1,
          "amount": "9.99",
          "type": "virtual_item"
        }
      ],
      "price": {
        "amount": "9.99",
        "currency": "USD"
      }
    }
  },
  "user": {
    "id": "user_12345",
    "email": "user@example.com",
    "name": "John Doe",
    "country": "US"
  },
  "transaction": {
    "id": 789012,
    "payment_date": "2024-01-15T10:30:00Z",
    "payment_method": 1234,
    "payment_method_name": "Visa"
  }
}
```

### order_canceled

```json
{
  "notification_type": "order_canceled",
  "order": {
    "id": 123456,
    "status": "canceled"
  },
  "user": {
    "id": "user_12345"
  }
}
```

### payment (Legacy)

```json
{
  "notification_type": "payment",
  "purchase": {
    "virtual_items": {
      "items": [
        {"sku": "sword_legendary", "amount": 1}
      ]
    },
    "total": {
      "amount": "9.99",
      "currency": "USD"
    }
  },
  "user": {
    "id": "user_12345",
    "email": "user@example.com"
  },
  "transaction": {
    "id": 789012,
    "external_id": "your_order_id_123",
    "dry_run": false
  }
}
```

### user_validation

```json
{
  "notification_type": "user_validation",
  "user": {
    "id": "user_12345",
    "ip": "192.168.1.1",
    "email": "user@example.com"
  }
}
```

---

## Response Requirements

### Success Responses

Return one of these HTTP codes:
- `200 OK`
- `201 Created`
- `204 No Content`

### Error Responses

Return `400 Bad Request` with error details:

```json
{
  "error": {
    "code": "INVALID_USER",
    "message": "User not found in system"
  }
}
```

### Error Codes

| Code | When to Use |
|------|-------------|
| `INVALID_USER` | User doesn't exist in your system |
| `INVALID_SIGNATURE` | Signature verification failed |
| `INVALID_PARAMETER` | Malformed webhook data |
| `INCORRECT_AMOUNT` | Amount mismatch |
| `INCORRECT_INVOICE` | Invoice/order ID mismatch |

### Server Errors

Return `5xx` for temporary issues. Xsolla will retry.

---

## Retry Policy

For `order_paid` and `order_canceled`:

| Phase | Attempts | Interval |
|-------|----------|----------|
| 1 | 2 | 5 minutes |
| 2 | 7 | 15 minutes |
| 3 | 10 | 60 minutes |

**Maximum**: 20 attempts within 12 hours

---

## Idempotency

Webhooks may be delivered multiple times. Implement idempotency:

```javascript
async function processOrderPaid(webhook) {
  const orderId = webhook.order.id;
  
  // Check if already processed
  const existing = await db.getOrder(orderId);
  if (existing && existing.fulfilled) {
    // Already processed, return success
    return { status: 'already_processed' };
  }
  
  // Process new order
  await fulfillOrder(webhook);
  await db.markOrderFulfilled(orderId);
  
  return { status: 'fulfilled' };
}
```

---

## IP Whitelist

Authorize requests only from Xsolla IPs:

```
185.30.20.0/24
185.30.21.0/24
185.30.22.0/24
185.30.23.0/24
34.102.38.178
34.94.43.207
35.236.73.234
```

Additional IPs for Login webhooks:
```
34.94.0.85
34.94.14.95
34.94.25.33
34.94.115.185
34.94.154.26
34.94.173.132
34.102.48.30
35.235.99.248
35.236.32.131
35.236.35.100
35.236.117.164
```

---

## Processing Best Practices

1. **Verify signature first** - Reject invalid signatures immediately
2. **Respond quickly** - Process async if needed, respond fast
3. **Implement idempotency** - Handle duplicate deliveries
4. **Log everything** - Keep records for debugging
5. **Use IP whitelist** - Extra security layer
6. **Test in sandbox** - Verify flow before production

### Example Order Fulfillment

```javascript
async function handleOrderPaid(webhook) {
  const { order, user } = webhook;
  
  // 1. Verify user exists
  const dbUser = await db.findUser(user.id);
  if (!dbUser) {
    throw { code: 'INVALID_USER' };
  }
  
  // 2. Check idempotency
  const existingOrder = await db.findOrder(order.id);
  if (existingOrder?.fulfilled) {
    return; // Already done
  }
  
  // 3. Grant items
  for (const item of order.content.items) {
    await inventory.grantItem(user.id, item.sku, item.quantity);
  }
  
  // 4. Record order
  await db.createOrder({
    orderId: order.id,
    userId: user.id,
    items: order.content.items,
    amount: order.content.price.amount,
    currency: order.content.price.currency,
    fulfilled: true,
    fulfilledAt: new Date()
  });
  
  // 5. Optional: Send confirmation email
  await email.sendOrderConfirmation(user.email, order);
}
```
