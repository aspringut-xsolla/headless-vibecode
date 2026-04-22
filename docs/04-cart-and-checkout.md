# Cart & Checkout

Manage shopping carts and initiate purchases.

**Base URL**: `https://store.xsolla.com/api`

## Cart Concepts

- Each user has a **current cart** (no cart ID needed)
- **Named carts** use a `cart_id` for multiple carts per user
- Carts persist across sessions
- Items include real-time pricing and promotions

## Authentication

Client-side operations use User JWT:
```
Authorization: Bearer <user_JWT>
```

Server-side operations use Basic Auth:
```
Authorization: Basic <base64(project_id:api_key)>
```

> **Important**: Cart operations require authentication. Requests without a valid user JWT return `401 Unauthorized`. For guest checkout flows, generate a payment token server-side instead of using the cart API.

---

## Cart Operations

### Get Current Cart

```http
GET /v2/project/{project_id}/cart HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

Response:
```json
{
  "cart_id": "abc123",
  "items": [
    {
      "sku": "sword_legendary",
      "name": "Legendary Sword",
      "quantity": 1,
      "price": {
        "amount": "9.99",
        "currency": "USD"
      },
      "image_url": "https://example.com/sword.png"
    }
  ],
  "price": {
    "amount": "9.99",
    "currency": "USD"
  },
  "is_free": false
}
```

### Get Cart by ID

```http
GET /v2/project/{project_id}/cart/{cart_id} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### Add/Update Item in Cart

Updates quantity. If item doesn't exist, adds it.

```http
PUT /v2/project/{project_id}/cart/{cart_id}/item/{item_sku} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
Content-Type: application/json

{
  "quantity": 2
}
```

### Remove Item from Cart

```http
DELETE /v2/project/{project_id}/cart/{cart_id}/item/{item_sku} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### Clear Cart

```http
PUT /v2/project/{project_id}/cart/{cart_id}/clear HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### Fill Cart with Items

Replace cart contents with specified items:

```http
PUT /v2/project/{project_id}/cart/{cart_id}/fill HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
Content-Type: application/json

{
  "items": [
    {"sku": "sword_legendary", "quantity": 1},
    {"sku": "health_potion", "quantity": 5}
  ]
}
```

Response includes updated prices, discounts, and bonus items.

---

## Purchase Flows

### Option 1: Client-Side Token Generation

Quick checkout from frontend. Less control but simpler.

**Purchase Single Item:**

```http
POST /v2/project/{project_id}/payment/item/{item_sku} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
Content-Type: application/json

{
  "sandbox": true
}
```

**Purchase Cart:**

```http
POST /v2/project/{project_id}/payment/cart HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
Content-Type: application/json

{
  "sandbox": true
}
```

Response:
```json
{
  "order_id": 12345,
  "token": "payment_token_here"
}
```

### Option 2: Server-Side Token Generation (Recommended)

More control over checkout parameters. Required for custom user data.

```http
POST /v3/project/{project_id}/admin/payment/token HTTP/1.1
Host: store.xsolla.com
Authorization: Basic <credentials>
Content-Type: application/json

{
  "user": {
    "id": {
      "value": "user_12345"
    },
    "name": {
      "value": "John Doe"
    },
    "email": {
      "value": "john@example.com"
    },
    "country": {
      "value": "US",
      "allow_modify": false
    }
  },
  "purchase": {
    "items": [
      {"sku": "sword_legendary", "quantity": 1},
      {"sku": "health_potion", "quantity": 3}
    ]
  },
  "settings": {
    "language": "en",
    "currency": "USD",
    "sandbox": true,
    "return_url": "https://yoursite.com/payment/complete",
    "ui": {
      "theme": "default"
    }
  }
}
```

Response:
```json
{
  "order_id": 12345,
  "token": "payment_token_here"
}
```

> **Note**: Either `user.country.value` or `X-User-Ip` header is required for currency selection.

---

## Opening Payment UI

After obtaining a payment token, open Pay Station:

### Standard Pay Station (New Window/Tab)

```
https://secure.xsolla.com/paystation4/?token={payment_token}
```

### Embedded (iframe)

```html
<iframe 
  src="https://secure.xsolla.com/paystation4/?token={payment_token}"
  width="100%" 
  height="600"
  frameborder="0"
></iframe>
```

### Pay Station Widget

```html
<script src="https://cdn.xsolla.net/embed/paystation/1.2.3/widget.min.js"></script>
<script>
  XPayStationWidget.init({
    access_token: '{payment_token}',
    sandbox: true,
    lightbox: {
      width: '740px',
      height: '760px'
    }
  });
  XPayStationWidget.open();
</script>
```

---

## Virtual Currency Purchases

Pay with in-game currency instead of real money:

```http
POST /v2/project/{project_id}/payment/item/{item_sku}/virtual/{virtual_currency_sku} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

No payment UI needed - transaction completes immediately.

---

## Free Items

For items with zero price:

**Single Free Item:**

```http
POST /v2/project/{project_id}/free/item/{item_sku} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

**Free Cart:**

```http
POST /v2/project/{project_id}/free/cart HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

---

## Server-Side Cart Operations

For server-to-server cart management:

```http
PUT /v2/admin/project/{project_id}/cart/{cart_id}/fill HTTP/1.1
Host: store.xsolla.com
Authorization: Basic <credentials>
Content-Type: application/json

{
  "user": {
    "id": "user_12345"
  },
  "items": [
    {"sku": "sword_legendary", "quantity": 1}
  ]
}
```

---

## Checkout Flow Summary

```
1. User browses catalog
         │
         ▼
2. Add items to cart (PUT /cart/{cart_id}/item/{sku})
         │
         ▼
3. Review cart (GET /cart)
         │
         ▼
4. Generate payment token (POST /payment/cart or /admin/payment/token)
         │
         ▼
5. Open Pay Station with token
         │
         ▼
6. User completes payment
         │
         ▼
7. Receive order_paid webhook
         │
         ▼
8. Fulfill order (grant items to user)
```

## Error Handling

| Error Code | Meaning | Resolution |
|------------|---------|------------|
| `INVALID_TOKEN` | User JWT expired/invalid | Refresh authentication |
| `ITEM_NOT_FOUND` | SKU doesn't exist | Check catalog |
| `ITEM_NOT_AVAILABLE` | Item not for sale | Check item status |
| `INSUFFICIENT_FUNDS` | Not enough virtual currency | Prompt user to purchase currency |
