# Troubleshooting

Common issues and solutions when integrating Xsolla headless webshop.

## Authentication Issues

### "Invalid token" or 401 errors

**Symptoms**: API calls return 401 Unauthorized

**Causes & Solutions**:

1. **Expired JWT token**
   - User tokens expire after 24 hours by default
   - Implement token refresh flow
   - Check `exp` claim in JWT

2. **Wrong authentication method**
   - Client-side calls need `Authorization: Bearer <user_JWT>`
   - Server-side calls need `Authorization: Basic <credentials>`
   - Login server calls need `X-SERVER-AUTHORIZATION: <server_JWT>`

3. **Incorrect Base64 encoding**
   ```javascript
   // Correct
   const auth = Buffer.from(`${projectId}:${apiKey}`).toString('base64');

   // Wrong - don't include "Basic " in encoding
   const wrong = Buffer.from(`Basic ${projectId}:${apiKey}`).toString('base64');
   ```

4. **Using company API key with project endpoint**
   - Some endpoints require project-level API key
   - Some require company-level (merchant) API key
   - Check documentation for each endpoint

### "Invalid signature" on webhooks

**Causes & Solutions**:

1. **Re-serializing JSON payload**
   ```javascript
   // WRONG - parsing and re-serializing changes formatting
   const webhook = JSON.parse(body);
   const signature = sha1(JSON.stringify(webhook) + secret);

   // CORRECT - use raw body exactly as received
   const signature = sha1(rawBody + secret);
   ```

2. **Wrong secret key**
   - Check you're using the webhook secret, not API key
   - Regenerate secret in Publisher Account if unsure

3. **Encoding issues**
   - Ensure UTF-8 encoding
   - Don't trim or modify the body

---

## Payment Issues

### Payment token generation fails

**Error**: `INVALID_USER` or `INVALID_PROJECT_ID`

**Solutions**:
- Verify `project_id` matches Publisher Account
- Ensure `user.id.value` is provided
- For currency selection, provide either:
  - `user.country.value` (ISO 2-letter code)
  - `X-User-Ip` header with user's IP

### Pay Station doesn't open

**Causes**:
- Token expired (tokens have limited validity)
- Popup blocked by browser
- Invalid token format

**Solutions**:
```javascript
// Generate token immediately before opening
const { token } = await generateToken();

// Open in same tick to avoid popup blockers
window.open(`https://secure.xsolla.com/paystation4/?token=${token}`);
```

### Payment succeeds but webhook not received

**Checklist**:
1. Webhook URL configured in Publisher Account
2. URL is HTTPS (HTTP not supported)
3. URL is publicly accessible
4. Server returns 2xx status code quickly
5. Check webhook logs in Publisher Account

---

## Catalog Issues

### Items not showing

**Causes & Solutions**:

1. **Items not enabled**
   - Check `is_enabled: true` in Publisher Account
   - Verify item has valid price

2. **Items not in correct group**
   - Check group assignments in Publisher Account

3. **Region restrictions**
   - Item may be restricted for user's country
   - Check regional settings

### Prices showing wrong currency

**Solutions**:
- Pass user's country in requests
- Use `Accept-Language` header
- Check currency settings in Publisher Account

---

## Cart Issues

### Cart is empty after adding items

**Causes**:
- Wrong cart ID
- User token changed (different user)
- Cart was cleared

**Debug**:
```javascript
// Get cart first to check ID
const cart = await getCart();
console.log('Cart ID:', cart.cart_id);

// Always use the returned cart_id
await addToCart(cart.cart_id, sku, quantity);
```

### "Item not found" when adding to cart

**Causes**:
- SKU doesn't exist
- Item not enabled
- Item not configured for this project

---

## Webhook Issues

### Webhooks arriving multiple times

**This is expected behavior**. Implement idempotency:

```javascript
async function handleOrderPaid(webhook) {
  const order = await db.findOrder(webhook.order.id);

  if (order?.fulfilled) {
    // Already processed, return success
    return { status: 200 };
  }

  // Process new order...
}
```

### Webhook processing too slow

**Symptoms**: Xsolla retries webhooks, causing duplicates

**Solutions**:
1. Respond immediately, process async
   ```javascript
   app.post('/webhook', (req, res) => {
     // Respond immediately
     res.status(200).send();

     // Process in background
     processWebhookAsync(req.body);
   });
   ```

2. Use a queue system (Redis, SQS, etc.)

### Missing webhook fields

**Account age matters**:
- Accounts after Jan 2025: Full data in `order_paid`
- Older accounts: Payment data in `payment` webhook, items in `order_paid`

Check `notification_type` and handle both cases.

---

## Sandbox vs Production

### "Sandbox mode" errors in production

**Causes**:
- `sandbox: true` still in code
- Using test API keys

**Checklist before going live**:
- [ ] Remove `sandbox: true` from all token requests
- [ ] Use production API keys
- [ ] Update webhook URL if different
- [ ] Test with real payment (small amount)

### Test payments not working

**Solutions**:
- Ensure `sandbox: true` in token request
- Use test card: `4111 1111 1111 1111`
- Any future expiry date
- Any 3-digit CVV

---

## Rate Limiting

### HTTP 429 responses

**Solutions**:

1. **Implement exponential backoff**
   ```javascript
   async function requestWithRetry(fn, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (error.status === 429 && i < maxRetries - 1) {
           await sleep(Math.pow(2, i) * 1000);
           continue;
         }
         throw error;
       }
     }
   }
   ```

2. **Cache catalog data**
   - Don't fetch catalog on every page load
   - Cache for 5-15 minutes

3. **Contact Xsolla** for limit increases if needed

---

## Debugging Tips

### Enable request logging

```javascript
// Log all requests
const originalFetch = fetch;
global.fetch = async (url, options) => {
  console.log('Request:', url, options?.method || 'GET');
  const response = await originalFetch(url, options);
  console.log('Response:', response.status);
  return response;
};
```

### Check webhook payloads

Use https://webhook.site during development to inspect webhook payloads before implementing handlers.

### Verify JWT contents

```javascript
function decodeJWT(token) {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64').toString());
}

const claims = decodeJWT(userToken);
console.log('User ID:', claims.sub);
console.log('Expires:', new Date(claims.exp * 1000));
```

---

## Getting Help

1. **Xsolla Documentation**: https://developers.xsolla.com
2. **Publisher Account Support**: Contact through your Publisher Account
3. **API Status**: Check for outages
4. **Community**: Xsolla developer forums

### Information to include in support requests

- Project ID (never share API keys)
- Request/response examples (sanitize sensitive data)
- Webhook payloads (if applicable)
- Error messages and codes
- Timestamp of issues
