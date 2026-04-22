# Getting Started

## Prerequisites

Before integrating with Xsolla APIs, you need:

1. **Xsolla Publisher Account** - Register at https://publisher.xsolla.com
2. **Project** - Create a project in Publisher Account
3. **API Key** - Generate an API key for authentication
4. **Merchant ID** - Found in your Publisher Account URL

## Finding Your Credentials

### Merchant ID

Located in:
- Company settings → Company section
- Your Publisher Account URL: `https://publisher.xsolla.com/<merchant_ID>/`

### Project ID

Found in:
- Project settings in Publisher Account
- Required for most API calls

### API Key

Generate at:
- Company settings → API keys (company-level)
- Project settings → API keys (project-level)

> **Important**: Save the API key immediately after generation. It's only displayed once.

## Authentication Methods

Xsolla API uses three authentication schemes:

### 1. Basic Access Authentication (Server-to-Server)

For server-side API calls. Encode `merchant_id:api_key` or `project_id:api_key` in Base64.

```
Authorization: Basic <base64_encoded_credentials>
```

Example encoding:
```javascript
const credentials = Buffer.from(`${projectId}:${apiKey}`).toString('base64');
```

### 2. User JWT (Client-Side)

For user-initiated requests from browsers or apps:

```
Authorization: Bearer <user_JWT>
```

The user JWT is obtained after authentication via the Login API.

### 3. Server JWT (Server-to-Server for Login)

For server-side Login API operations:

```
X-SERVER-AUTHORIZATION: <server_JWT>
```

## API Requirements

All requests must:

- Use **HTTPS** with TLS 1.2 or higher
- Include appropriate authentication headers
- Add `Content-Type: application/json` for POST/PUT requests
- Handle rate limiting (HTTP 429 responses)

## Base URLs

| Service | URL |
|---------|-----|
| Pay Station API | `https://api.xsolla.com` |
| Login API | `https://login.xsolla.com/api` |
| Catalog/Store API | `https://store.xsolla.com/api` |

## Sandbox Mode

For development and testing, use sandbox mode:

- Payments won't charge real accounts
- Pass `"sandbox": true` in payment token requests
- Test card: `4111 1111 1111 1111` (any future expiry, any CVV)

## Security Best Practices

1. **Never expose API keys in frontend code** - Keep keys on your server only
2. **Validate webhook signatures** - Always verify incoming webhooks
3. **Use HTTPS everywhere** - All API calls and webhook endpoints
4. **Rotate API keys periodically** - Generate new keys and update integrations
5. **Implement rate limiting** - Handle 429 responses gracefully

## Local Configuration

### .xsolla.json

Store project settings in a `.xsolla.json` file at your project root:

```json
{
  "version": "1",
  "default_environment": "dev",
  "environments": {
    "dev": {
      "merchant_id": 123456,
      "project_id": 789012,
      "api_base": "https://api.xsolla.com",
      "login_base": "https://login.xsolla.com",
      "sandbox": true
    },
    "prod": {
      "merchant_id": 123456,
      "project_id": 789012,
      "sandbox": false
    }
  }
}
```

### Environment Variables

Create a `.env` file for secrets (never commit this file):

```bash
XSOLLA_API_KEY=your_api_key_here
XSOLLA_WEBHOOK_SECRET=your_webhook_secret_here
```

Load environment variables in your server entry point:

```javascript
import 'dotenv/config';
```

> **Important**: Add `.env` to your `.gitignore` to prevent committing secrets.

## Project Setup Checklist

- [ ] Create Publisher Account
- [ ] Create a project
- [ ] Generate API key
- [ ] Note your Merchant ID and Project ID
- [ ] Create `.xsolla.json` with project settings
- [ ] Create `.env` with API key (add to `.gitignore`)
- [ ] Configure webhook URL (HTTPS required)
- [ ] Set up OAuth 2.0 client for Login (if using auth)
- [ ] Enable sandbox mode for testing

## Next Steps

1. [Set up Authentication](02-authentication.md) - Configure user login
2. [Configure Catalog](03-catalog-api.md) - Set up your item catalog
3. [Implement Cart](04-cart-and-checkout.md) - Build shopping cart functionality
