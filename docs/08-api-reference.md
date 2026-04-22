# API Quick Reference

Quick lookup for all Xsolla API endpoints used in headless integrations.

## Base URLs

| Service | URL |
|---------|-----|
| Store/Catalog | `https://store.xsolla.com/api` |
| Login | `https://login.xsolla.com/api` |
| Pay Station | `https://api.xsolla.com` |
| Pay Station UI | `https://secure.xsolla.com/paystation4/` |

---

## Authentication Headers

```
# User JWT (client-side)
Authorization: Bearer <user_JWT>

# Basic Auth (server-side)
Authorization: Basic <base64(project_id:api_key)>

# Server JWT (Login API server-side)
X-SERVER-AUTHORIZATION: <server_JWT>
```

---

## Catalog Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v2/project/{project_id}/items/virtual_items` | User JWT | List items (paginated) |
| GET | `/v2/project/{project_id}/items/virtual_items/all` | User JWT | All items |
| GET | `/v2/project/{project_id}/items/virtual_items/sku/{sku}` | User JWT | Item by SKU |
| GET | `/v2/project/{project_id}/items/virtual_items/group/{group_id}` | User JWT | Items by group |
| GET | `/v2/project/{project_id}/items/virtual_currency` | User JWT | List currencies |
| GET | `/v2/project/{project_id}/items/virtual_currency/package` | User JWT | Currency packages |
| GET | `/v2/project/{project_id}/items/bundle` | User JWT | List bundles |
| GET | `/v2/project/{project_id}/items/bundle/sku/{sku}` | User JWT | Bundle by SKU |
| GET | `/v2/project/{project_id}/items/game` | User JWT | List game keys |
| GET | `/v2/project/{project_id}/items/groups` | User JWT | List item groups |
| GET | `/v2/project/{project_id}/items` | User JWT | All sellable items |
| GET | `/v2/project/{project_id}/items/sku/{sku}` | User JWT | Any item by SKU |

### Admin Catalog (Server-Side)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/v2/project/{project_id}/admin/items/virtual_items` | Basic | Create item |
| PUT | `/v2/project/{project_id}/admin/items/virtual_items/sku/{sku}` | Basic | Update item |
| DELETE | `/v2/project/{project_id}/admin/items/virtual_items/sku/{sku}` | Basic | Delete item |
| POST | `/v2/project/{project_id}/admin/items/bundle` | Basic | Create bundle |
| POST | `/v2/project/{project_id}/admin/items/groups` | Basic | Create group |

---

## Cart Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v2/project/{project_id}/cart` | User JWT | Get current cart |
| GET | `/v2/project/{project_id}/cart/{cart_id}` | User JWT | Get cart by ID |
| PUT | `/v2/project/{project_id}/cart/{cart_id}/item/{sku}` | User JWT | Add/update item |
| DELETE | `/v2/project/{project_id}/cart/{cart_id}/item/{sku}` | User JWT | Remove item |
| PUT | `/v2/project/{project_id}/cart/{cart_id}/fill` | User JWT | Fill cart |
| PUT | `/v2/project/{project_id}/cart/{cart_id}/clear` | User JWT | Clear cart |

---

## Payment Endpoints

### Client-Side Token Generation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/v2/project/{project_id}/payment/item/{sku}` | User JWT | Purchase single item |
| POST | `/v2/project/{project_id}/payment/cart` | User JWT | Purchase cart |
| POST | `/v2/project/{project_id}/payment/cart/{cart_id}` | User JWT | Purchase specific cart |
| POST | `/v2/project/{project_id}/payment/item/{sku}/virtual/{currency_sku}` | User JWT | Virtual currency payment |

### Server-Side Token Generation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/v3/project/{project_id}/admin/payment/token` | Basic | Generate payment token |
| POST | `/merchant/{merchant_id}/token` | Basic | Pay Station token (full control) |

### Free Items

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/v2/project/{project_id}/free/item/{sku}` | User JWT | Get free item |
| POST | `/v2/project/{project_id}/free/cart` | User JWT | Get free cart |

---

## Order Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v2/project/{project_id}/order/{order_id}` | User JWT | Order status |
| POST | `/v3/project/{project_id}/admin/order/search` | Basic | Search orders |

---

## Entitlement Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v2/project/{project_id}/entitlement` | User JWT | User's entitlements |
| POST | `/v2/project/{project_id}/entitlement/redeem` | User JWT | Redeem key |
| POST | `/v2/project/{project_id}/admin/entitlement/grant` | Basic | Grant entitlement |
| POST | `/v2/project/{project_id}/admin/entitlement/revoke` | Basic | Revoke entitlement |

---

## Login Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/user` | None | Register user |
| POST | `/login` | None | Login (JWT) |
| POST | `/oauth2/login` | None | Login (OAuth 2.0) |
| POST | `/oauth2/token` | None | Exchange code / refresh |
| POST | `/token/validate` | None | Validate user JWT |
| POST | `/server/token/validate` | None | Validate server JWT |

### User Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | User JWT | Get profile |
| PATCH | `/users/me` | User JWT | Update profile |
| POST | `/password/reset/request` | None | Request reset |
| POST | `/password/reset/confirm` | None | Confirm reset |

### Attributes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/attributes/users/me/get` | User JWT | Get attributes |
| POST | `/attributes/users/me/update` | User JWT | Update attributes |
| POST | `/attributes/users/{user_id}/update` | Server JWT | Admin update |

---

## Pay Station Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/merchant/{merchant_id}/token` | Basic | Create token |
| GET | `/projects/{project_id}/users/{user_id}/payment_accounts` | Basic | Saved cards |
| POST | `/projects/{project_id}/users/{user_id}/payments/{type}/{account_id}` | Basic | Charge saved card |
| DELETE | `/projects/{project_id}/users/{user_id}/payment_accounts/{type}/{account_id}` | Basic | Delete saved card |
| GET | `/merchants/{merchant_id}/reports/transactions/search.json` | Basic | Search transactions |
| PUT | `/merchants/{merchant_id}/reports/transactions/{id}/refund` | Basic | Full refund |
| PUT | `/merchants/{merchant_id}/reports/transactions/{id}/partial_refund` | Basic | Partial refund |

---

## Webhook Types

| Type | Description |
|------|-------------|
| `user_validation` | Verify user exists |
| `payment` | Payment completed (legacy) |
| `refund` | Refund processed (legacy) |
| `order_paid` | Order successfully paid |
| `order_canceled` | Order canceled |
| `create_subscription` | Subscription started |
| `update_subscription` | Subscription renewed |
| `cancel_subscription` | Subscription ended |
| `afs_reject` | Anti-fraud rejection |
| `dispute` | Chargeback opened |

---

## Common Parameters

### Pagination

```
?limit=20&offset=0
```

Response:
```json
{
  "items": [...],
  "has_more": true,
  "total_items_count": 150
}
```

### Sandbox Mode

Add to token requests:
```json
{
  "sandbox": true
}
```

Or URL parameter:
```
?sandbox=true
```

---

## Error Response Format

```json
{
  "errorCode": 401,
  "errorMessage": "Invalid token",
  "statusCode": 401,
  "transactionId": "abc123"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Server Error |
