# Catalog API

The Catalog API manages your store's items: virtual goods, currency, bundles, and game keys.

**Base URL**: `https://store.xsolla.com/api`

## Authentication

### Client-Side (User JWT)

```
Authorization: Bearer <user_JWT>
```

Provides personalized data (user-specific prices, owned items).

### Server-Side (Basic Auth)

```
Authorization: Basic <base64(project_id:api_key)>
```

Required for admin operations (create, update, delete items).

### Guest Access

For unauthenticated browsing (limited to game key scenarios):
```
x-unauthorized-id: <unique_device_id>
x-user: <base64_encoded_email>
```

## Item Types

| Type | Description |
|------|-------------|
| Virtual Items | In-game goods (weapons, skins, boosters) |
| Virtual Currency | In-game money |
| Virtual Currency Packages | Bundles of virtual currency |
| Bundles | Combined packages sold as single SKU |
| Game Keys | Keys for games/DLCs (Steam, etc.) |
| Groups | Logical organization for items |

---

## Virtual Items

### List All Virtual Items (Client)

```http
GET /v2/project/{project_id}/items/virtual_items/all HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

Returns all items for client-side search/filtering.

### List Virtual Items with Pagination

```http
GET /v2/project/{project_id}/items/virtual_items?limit=20&offset=0 HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### Get Item by SKU

```http
GET /v2/project/{project_id}/items/virtual_items/sku/{item_sku} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### Get Items by Group

```http
GET /v2/project/{project_id}/items/virtual_items/group/{group_external_id} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### Create Virtual Item (Admin)

```http
POST /v2/project/{project_id}/admin/items/virtual_items HTTP/1.1
Host: store.xsolla.com
Authorization: Basic <credentials>
Content-Type: application/json

{
  "sku": "sword_legendary",
  "name": {"en": "Legendary Sword"},
  "description": {"en": "A powerful legendary weapon"},
  "image_url": "https://example.com/sword.png",
  "prices": [
    {"amount": 9.99, "currency": "USD", "is_default": true}
  ],
  "virtual_prices": [
    {"amount": 1000, "sku": "gold_coins"}
  ],
  "is_enabled": true,
  "groups": ["weapons", "legendary"]
}
```

### Update Virtual Item (Admin)

```http
PUT /v2/project/{project_id}/admin/items/virtual_items/sku/{item_sku} HTTP/1.1
Host: store.xsolla.com
Authorization: Basic <credentials>
Content-Type: application/json

{
  "prices": [
    {"amount": 7.99, "currency": "USD", "is_default": true}
  ]
}
```

### Delete Virtual Item (Admin)

```http
DELETE /v2/project/{project_id}/admin/items/virtual_items/sku/{item_sku} HTTP/1.1
Host: store.xsolla.com
Authorization: Basic <credentials>
```

---

## Virtual Currency

### List Currencies

```http
GET /v2/project/{project_id}/items/virtual_currency HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### Get Currency by SKU

```http
GET /v2/project/{project_id}/items/virtual_currency/sku/{currency_sku} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### List Currency Packages

```http
GET /v2/project/{project_id}/items/virtual_currency/package HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### Get Package by SKU

```http
GET /v2/project/{project_id}/items/virtual_currency/package/sku/{package_sku} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

---

## Bundles

### List Bundles

```http
GET /v2/project/{project_id}/items/bundle HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### Get Bundle by SKU

```http
GET /v2/project/{project_id}/items/bundle/sku/{bundle_sku} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### Create Bundle (Admin)

```http
POST /v2/project/{project_id}/admin/items/bundle HTTP/1.1
Host: store.xsolla.com
Authorization: Basic <credentials>
Content-Type: application/json

{
  "sku": "starter_pack",
  "name": {"en": "Starter Pack"},
  "description": {"en": "Everything you need to begin"},
  "image_url": "https://example.com/pack.png",
  "prices": [
    {"amount": 19.99, "currency": "USD", "is_default": true}
  ],
  "content": [
    {"sku": "sword_basic", "quantity": 1},
    {"sku": "gold_coins", "quantity": 500}
  ],
  "is_enabled": true
}
```

---

## Game Keys

### List Game Keys

```http
GET /v2/project/{project_id}/items/game HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### Get Game Key by SKU

```http
GET /v2/project/{project_id}/items/game/sku/{item_sku} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### List DRM Platforms

```http
GET /v2/project/{project_id}/items/game/drm HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

---

## Item Groups

### List Groups

```http
GET /v2/project/{project_id}/items/groups HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

### Create Group (Admin)

```http
POST /v2/project/{project_id}/admin/items/groups HTTP/1.1
Host: store.xsolla.com
Authorization: Basic <credentials>
Content-Type: application/json

{
  "external_id": "weapons",
  "name": {"en": "Weapons"},
  "description": {"en": "All weapon items"},
  "parent_external_id": null
}
```

---

## Universal Item Endpoints

### Get All Sellable Items

```http
GET /v2/project/{project_id}/items?limit=50&offset=0 HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

Returns all item types with pagination.

### Get Item by SKU (Any Type)

```http
GET /v2/project/{project_id}/items/sku/{sku} HTTP/1.1
Host: store.xsolla.com
Authorization: Bearer <user_JWT>
```

---

## Pagination

All list endpoints support:

| Parameter | Description |
|-----------|-------------|
| `limit` | Items per page (default varies) |
| `offset` | Starting index (0-based) |

Response includes:
```json
{
  "items": [...],
  "has_more": true,
  "total_items_count": 150
}
```

---

## Response Format

### Success Response

```json
{
  "sku": "sword_legendary",
  "name": "Legendary Sword",
  "description": "A powerful legendary weapon",
  "image_url": "https://example.com/sword.png",
  "price": {
    "amount": "9.99",
    "currency": "USD",
    "amount_without_discount": "12.99"
  },
  "virtual_prices": [
    {"amount": 1000, "sku": "gold_coins", "name": "Gold Coins"}
  ],
  "is_free": false,
  "groups": [
    {"external_id": "weapons", "name": "Weapons"}
  ]
}
```

### Error Response

```json
{
  "errorCode": 401,
  "errorMessage": "Invalid token",
  "statusCode": 401,
  "transactionId": "abc123"
}
```

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Invalid request parameters |
| 401 | Authentication failure |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 422 | Validation error |
| 429 | Rate limit exceeded |
