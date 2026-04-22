# Headless Xsolla Webshop Documentation

Build a fully custom e-commerce experience using Xsolla's APIs. This guide covers everything needed to create a headless webshop for selling virtual items, game keys, subscriptions, and more.

## What is a Headless Webshop?

A headless architecture decouples the frontend presentation layer from the backend commerce functionality. With Xsolla's APIs, you:

- Build any UI you want (React, Vue, mobile, etc.)
- Call Xsolla APIs directly for catalog, cart, payments, and user management
- Handle webhooks for order fulfillment
- Maintain full control over the user experience

## Documentation Structure

| Document | Description |
|----------|-------------|
| [Getting Started](docs/01-getting-started.md) | Initial setup, credentials, and API basics |
| [Authentication](docs/02-authentication.md) | Login API, user tokens, OAuth 2.0 flows |
| [Catalog API](docs/03-catalog-api.md) | Virtual items, bundles, currency, game keys |
| [Cart & Checkout](docs/04-cart-and-checkout.md) | Cart management, purchase flows |
| [Payment Integration](docs/05-payment-integration.md) | Pay Station, payment tokens, headless checkout SDK |
| [Webhooks](docs/06-webhooks.md) | Event handling, signature verification, order fulfillment |
| [Order Management](docs/07-order-management.md) | Order tracking, status polling, fulfillment |
| [API Reference](docs/08-api-reference.md) | Quick lookup for all endpoints |
| [Troubleshooting](docs/09-troubleshooting.md) | Common issues and solutions |
| [Xsolla CLI](docs/10-xsolla-cli.md) | Command-line interface reference |

## Code Examples

| Example | Description |
|---------|-------------|
| [server-nodejs.js](examples/server-nodejs.js) | Node.js/Express backend with all endpoints |
| [client-react.jsx](examples/client-react.jsx) | React frontend components |
| [webhook-handler.ts](examples/webhook-handler.ts) | TypeScript webhook handler with types |

## Quick Links

- **Xsolla Publisher Account**: https://publisher.xsolla.com
- **API Documentation**: https://developers.xsolla.com
- **Headless Checkout SDK**: https://github.com/xsolla/pay-station-sdk

## API Base URLs

| Service | Base URL |
|---------|----------|
| Pay Station & Subscriptions | `https://api.xsolla.com` |
| Login | `https://login.xsolla.com/api` |
| Catalog & Store | `https://store.xsolla.com/api` |
| Pay Station UI | `https://secure.xsolla.com/paystation4/` |

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Your Frontend │────▶│   Your Backend  │────▶│   Xsolla APIs   │
│   (Custom UI)   │     │   (Auth, Tokens)│     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │    Webhooks     │
                                               │  (Order Events) │
                                               └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Your Backend   │
                                               │  (Fulfillment)  │
                                               └─────────────────┘
```

## Typical Integration Flow

1. **User Authentication** - Authenticate users via Xsolla Login API
2. **Display Catalog** - Fetch and display items from Catalog API
3. **Cart Management** - Add/remove items using Cart API
4. **Payment Token** - Generate token server-side for secure checkout
5. **Payment UI** - Open Pay Station or use Headless Checkout SDK
6. **Webhook Processing** - Receive `order_paid` webhook
7. **Order Fulfillment** - Grant items to user in your system
