# Order Management

Track order status, handle fulfillment, and manage the complete order lifecycle.

## Order Status Flow

```
created → processing → done
              │
              └──► canceled/error
```

| Status | Description |
|--------|-------------|
| `new` | Order created, pending payment |
| `paid` | Payment received, processing |
| `done` | Order completed successfully |
| `canceled` | Order was canceled |
| `error` | Payment failed |

---

## Tracking Order Status

Two approaches: **Webhooks** (recommended) or **Polling**.

### Method 1: Webhooks (Recommended)

See [Webhooks documentation](10-webhooks.md). Process `order_paid` to know when to fulfill.

### Method 2: Polling

Check order status periodically after payment UI closes.

```http
GET /v2/project/{project_id}/order/{order_id} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

Response:
```json
{
  "order_id": 123456,
  "status": "done",
  "content": {
    "items": [
      {
        "sku": "sword_legendary",
        "quantity": 1,
        "is_free": false,
        "price": {
          "amount": "9.99",
          "currency": "USD"
        }
      }
    ],
    "price": {
      "amount": "9.99",
      "currency": "USD",
      "amount_without_discount": "12.99"
    }
  }
}
```

### Polling Implementation

```javascript
async function pollOrderStatus(orderId, maxAttempts = 20, intervalMs = 3000) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(
      `https://store.xsolla.com/api/v2/project/${PROJECT_ID}/order/${orderId}`,
      {
        headers: { 'Authorization': `Bearer ${userToken}` }
      }
    );
    
    const order = await response.json();
    
    switch (order.status) {
      case 'done':
        return { success: true, order };
      case 'canceled':
      case 'error':
        return { success: false, order };
      default:
        // Still processing, wait and retry
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  return { success: false, error: 'timeout' };
}

// Usage after payment UI closes
const result = await pollOrderStatus(orderId);
if (result.success) {
  showSuccessScreen(result.order);
} else {
  showErrorScreen();
}
```

---

## Order Search (Admin)

Search orders server-side for reporting and customer support.

```http
POST /v3/project/{project_id}/admin/order/search HTTP/1.1
Host: store.xsolla.com
Authorization: Basic <credentials>
Content-Type: application/json

{
  "user_id": "user_12345",
  "status": "done",
  "datetime_from": "2024-01-01T00:00:00Z",
  "datetime_to": "2024-01-31T23:59:59Z",
  "limit": 50,
  "offset": 0
}
```

Response:
```json
{
  "orders": [
    {
      "order_id": 123456,
      "status": "done",
      "created_at": "2024-01-15T10:30:00Z",
      "user_id": "user_12345",
      "content": {
        "items": [...],
        "price": {...}
      }
    }
  ],
  "has_more": false,
  "total_count": 3
}
```

---

## Transaction Reports

Get detailed transaction data from Pay Station API.

### Search Transactions

```http
GET /merchants/{merchant_id}/reports/transactions/search.json HTTP/1.1
Host: api.xsolla.com
Authorization: Basic <credentials>

Query parameters:
- datetime_from: Start date (ISO 8601)
- datetime_to: End date (ISO 8601)
- status: Transaction status filter
- limit: Results per page
- offset: Pagination offset
```

### Get Single Transaction

```http
GET /merchants/{merchant_id}/reports/transactions/{transaction_id} HTTP/1.1
Host: api.xsolla.com
Authorization: Basic <credentials>
```

---

## Refunds

### Request Full Refund

```http
PUT /merchants/{merchant_id}/reports/transactions/{transaction_id}/refund HTTP/1.1
Host: api.xsolla.com
Authorization: Basic <credentials>
Content-Type: application/json

{
  "description": "Customer requested refund"
}
```

### Request Partial Refund

```http
PUT /merchants/{merchant_id}/reports/transactions/{transaction_id}/partial_refund HTTP/1.1
Host: api.xsolla.com
Authorization: Basic <credentials>
Content-Type: application/json

{
  "amount": 5.00,
  "description": "Partial refund for one item"
}
```

### Handle Refund Webhook

When a refund is processed, you receive `order_canceled` or `refund` webhook:

```javascript
async function handleRefund(webhook) {
  const { order, user } = webhook;
  
  // 1. Find the original order
  const originalOrder = await db.findOrder(order.id);
  if (!originalOrder) return;
  
  // 2. Revoke granted items
  for (const item of originalOrder.items) {
    await inventory.revokeItem(user.id, item.sku, item.quantity);
  }
  
  // 3. Update order status
  await db.updateOrder(order.id, { status: 'refunded' });
  
  // 4. Notify user
  await email.sendRefundConfirmation(user.email, order);
}
```

---

## Fulfillment Patterns

### Immediate Fulfillment (Virtual Items)

Grant items immediately upon `order_paid`:

```javascript
async function fulfillVirtualItems(webhook) {
  const { order, user } = webhook;
  
  for (const item of order.content.items) {
    switch (item.type) {
      case 'virtual_item':
        await inventory.addItem(user.id, item.sku, item.quantity);
        break;
      case 'virtual_currency':
        await wallet.addCurrency(user.id, item.sku, item.quantity);
        break;
      case 'bundle':
        await fulfillBundle(user.id, item.sku);
        break;
    }
  }
}
```

### Deferred Fulfillment (Game Keys)

For game keys that need to be retrieved:

```javascript
async function fulfillGameKey(webhook) {
  const { order, user } = webhook;
  
  for (const item of order.content.items) {
    if (item.type === 'game_key') {
      // Key is included in webhook for some configurations
      const key = item.key || await fetchKeyFromXsolla(order.id, item.sku);
      
      // Store key for user
      await db.saveGameKey(user.id, {
        orderId: order.id,
        sku: item.sku,
        key: key,
        platform: item.drm
      });
      
      // Email key to user
      await email.sendGameKey(user.email, key, item);
    }
  }
}
```

### Subscription Fulfillment

Handle subscription lifecycle:

```javascript
async function handleSubscription(webhook) {
  switch (webhook.notification_type) {
    case 'create_subscription':
      await db.createSubscription({
        userId: webhook.user.id,
        planId: webhook.subscription.plan_id,
        status: 'active',
        expiresAt: webhook.subscription.date_next_charge
      });
      await grantSubscriptionBenefits(webhook.user.id, webhook.subscription.plan_id);
      break;
      
    case 'update_subscription':
      await db.updateSubscription(webhook.subscription.id, {
        status: 'active',
        expiresAt: webhook.subscription.date_next_charge
      });
      break;
      
    case 'cancel_subscription':
      await db.updateSubscription(webhook.subscription.id, {
        status: 'canceled'
      });
      await revokeSubscriptionBenefits(webhook.user.id);
      break;
  }
}
```

---

## User Entitlements

Track what users own using the Entitlements API.

### Get User Entitlements

```http
GET /v2/project/{project_id}/entitlement HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

Response:
```json
{
  "items": [
    {
      "sku": "sword_legendary",
      "quantity": 1,
      "granted_at": "2024-01-15T10:30:00Z"
    },
    {
      "sku": "gold_coins",
      "quantity": 5000,
      "granted_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Grant Entitlement (Admin)

```http
POST /v2/project/{project_id}/admin/entitlement/grant HTTP/1.1
Host: store.xsolla.com
Authorization: Basic <credentials>
Content-Type: application/json

{
  "user_id": "user_12345",
  "sku": "sword_legendary",
  "quantity": 1
}
```

### Revoke Entitlement (Admin)

```http
POST /v2/project/{project_id}/admin/entitlement/revoke HTTP/1.1
Host: store.xsolla.com
Authorization: Basic <credentials>
Content-Type: application/json

{
  "user_id": "user_12345",
  "sku": "sword_legendary",
  "quantity": 1
}
```

---

## Best Practices

1. **Use webhooks for fulfillment** - More reliable than polling
2. **Implement idempotency** - Handle webhook retries gracefully
3. **Log all transactions** - Keep audit trail
4. **Handle partial fulfillment** - What if one item fails?
5. **Provide order history** - Let users see past purchases
6. **Support refunds** - Have a clear refund process
7. **Monitor fulfillment** - Alert on failures

### Order Status UI Example

```javascript
function OrderStatus({ orderId }) {
  const [order, setOrder] = useState(null);
  const [polling, setPolling] = useState(true);
  
  useEffect(() => {
    if (!polling) return;
    
    const interval = setInterval(async () => {
      const status = await checkOrderStatus(orderId);
      setOrder(status);
      
      if (status.status === 'done' || status.status === 'canceled') {
        setPolling(false);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [orderId, polling]);
  
  if (!order) return <Spinner />;
  
  switch (order.status) {
    case 'done':
      return <SuccessMessage items={order.content.items} />;
    case 'canceled':
    case 'error':
      return <ErrorMessage />;
    default:
      return <ProcessingMessage />;
  }
}
```
