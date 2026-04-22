# Payment Integration

Integrate Xsolla Pay Station for payment processing, or use the Headless Checkout SDK for full UI control.

## Pay Station Overview

Pay Station is Xsolla's payment interface supporting 700+ payment methods worldwide. Two integration approaches:

| Approach | Description | Use Case |
|----------|-------------|----------|
| **Standard Pay Station** | Pre-built UI in iframe/popup | Quick integration, trusted UI |
| **Headless Checkout SDK** | API-only, build your own UI | Full customization, native feel |

---

## Pay Station API

**Base URL**: `https://api.xsolla.com`

### Generate Payment Token

Server-side token generation with full control:

```http
POST /merchant/{merchant_id}/token HTTP/1.1
Host: api.xsolla.com
Authorization: Basic <base64(merchant_id:api_key)>
Content-Type: application/json

{
  "user": {
    "id": {
      "value": "user_12345"
    },
    "email": {
      "value": "user@example.com"
    },
    "country": {
      "value": "US"
    }
  },
  "settings": {
    "project_id": 12345,
    "language": "en",
    "currency": "USD",
    "sandbox": true,
    "return_url": "https://yoursite.com/payment/complete",
    "redirect_policy": {
      "redirect_conditions": "successful",
      "delay": 5,
      "status_for_manual_redirect": "none"
    },
    "ui": {
      "size": "medium",
      "theme": "default",
      "version": "desktop"
    }
  },
  "purchase": {
    "checkout": {
      "amount": 9.99,
      "currency": "USD"
    },
    "description": {
      "value": "Legendary Sword"
    }
  }
}
```

### Token Parameters

#### User Object

| Field | Required | Description |
|-------|----------|-------------|
| `user.id.value` | Yes | Your internal user ID |
| `user.email.value` | No | Pre-fills email field |
| `user.country.value` | Recommended | ISO 2-letter code, affects currency |
| `user.name.value` | No | Display name |

#### Settings Object

| Field | Description |
|-------|-------------|
| `project_id` | Your Xsolla project ID |
| `language` | UI language (en, de, fr, etc.) |
| `currency` | Payment currency (USD, EUR, etc.) |
| `sandbox` | `true` for test mode |
| `return_url` | Redirect after payment |
| `external_id` | Your order ID for tracking |

#### Purchase Object

| Field | Description |
|-------|-------------|
| `checkout.amount` | Total amount |
| `checkout.currency` | Currency code |
| `description.value` | Shown to user |
| `subscription.plan_id` | For subscription purchases |

---

## Opening Pay Station

### Method 1: Redirect

```javascript
window.location.href = `https://secure.xsolla.com/paystation4/?token=${paymentToken}`;
```

### Method 2: New Window

```javascript
window.open(
  `https://secure.xsolla.com/paystation4/?token=${paymentToken}`,
  'XsollaPayStation',
  'width=800,height=600'
);
```

### Method 3: Lightbox Widget

```html
<script src="https://cdn.xsolla.net/embed/paystation/1.2.3/widget.min.js"></script>
<script>
XPayStationWidget.init({
  access_token: paymentToken,
  sandbox: true,
  lightbox: {
    width: '740px',
    height: '760px',
    spinner: 'round',
    spinnerColor: '#cccccc'
  }
});

// Event handlers
XPayStationWidget.on(XPayStationWidget.eventTypes.STATUS, function(event, data) {
  console.log('Payment status:', data.paymentInfo.status);
});

XPayStationWidget.on(XPayStationWidget.eventTypes.CLOSE, function(event, data) {
  console.log('Widget closed');
  // Check order status via API
});

// Open the widget
XPayStationWidget.open();
</script>
```

### Method 4: Inline iframe

```html
<iframe 
  id="paystation-iframe"
  src="https://secure.xsolla.com/paystation4/?token=${paymentToken}"
  width="100%" 
  height="600"
  frameborder="0"
  allow="payment"
></iframe>
```

---

## Headless Checkout SDK

Build a completely custom payment UI while Xsolla handles the backend.

### Installation

```bash
npm install @xsolla/pay-station-sdk
```

Or via CDN:
```html
<script src="https://cdn.xsolla.net/embed/pay-station-sdk/X.Y.Z/headless-checkout.js"></script>
```

### GitHub Repository

https://github.com/xsolla/pay-station-sdk

### SDK Initialization

```javascript
import { HeadlessCheckout } from '@xsolla/pay-station-sdk';

const headlessCheckout = new HeadlessCheckout();

await headlessCheckout.init({
  token: paymentToken,
  sandbox: true
});
```

### Get Available Payment Methods

```javascript
const paymentMethods = await headlessCheckout.getPaymentMethods();

// Returns array of available methods:
// [
//   { id: 1234, name: 'Visa/Mastercard', ... },
//   { id: 5678, name: 'PayPal', ... },
//   ...
// ]
```

### Initialize Payment Form

```javascript
await headlessCheckout.form.init({
  paymentMethodId: 1234,  // From getPaymentMethods()
  returnUrl: 'https://yoursite.com/payment/complete'
});
```

### Required UI Components

Add these HTML elements for the SDK to populate:

```html
<!-- Legal information (required) -->
<div id="legal-container"></div>
<psdk-legal element-id="legal-container"></psdk-legal>

<!-- Total amount display -->
<div id="total-container"></div>
<psdk-total element-id="total-container"></psdk-total>

<!-- Payment form fields -->
<div id="form-container"></div>
<psdk-payment-form element-id="form-container"></psdk-payment-form>

<!-- Submit button -->
<div id="submit-container"></div>
<psdk-submit-button element-id="submit-container"></psdk-submit-button>
```

### Custom Form Fields

Build your own form instead of using `psdk-payment-form`:

```html
<psdk-card-number id="card-number"></psdk-card-number>
<psdk-card-expiry id="card-expiry"></psdk-card-expiry>
<psdk-card-cvv id="card-cvv"></psdk-card-cvv>
<psdk-card-holder id="card-holder"></psdk-card-holder>
```

### Handle Payment Events

```javascript
headlessCheckout.events.onNextAction((action) => {
  switch (action.type) {
    case 'check_status':
      // Payment processing, show status
      renderStatusComponent();
      break;
    case 'redirect':
      // 3D Secure or external redirect
      window.location.href = action.data.redirect.redirectUrl;
      break;
    case 'show_errors':
      // Display validation errors
      showErrors(action.data.errors);
      break;
  }
});

headlessCheckout.events.onStatusChange((status) => {
  console.log('Payment status:', status);
  // 'created', 'processing', 'done', 'error', 'canceled'
});
```

### Show Payment Status

```html
<psdk-status id="payment-status"></psdk-status>
```

### Complete Flow Example

```javascript
async function processPayment(paymentToken) {
  const checkout = new HeadlessCheckout();
  
  // 1. Initialize
  await checkout.init({ token: paymentToken, sandbox: true });
  
  // 2. Get payment methods
  const methods = await checkout.getPaymentMethods();
  displayPaymentMethods(methods);
  
  // 3. User selects a method
  const selectedMethod = await getUserSelection();
  
  // 4. Initialize form
  await checkout.form.init({
    paymentMethodId: selectedMethod.id,
    returnUrl: 'https://yoursite.com/complete'
  });
  
  // 5. Handle events
  checkout.events.onNextAction((action) => {
    if (action.type === 'check_status') {
      showStatusScreen();
    }
  });
  
  // 6. User fills form and clicks submit button
  // SDK handles submission automatically
}
```

---

## Tokenization (Saved Cards)

Store payment methods for repeat purchases.

### List Saved Accounts

```http
GET /projects/{project_id}/users/{user_id}/payment_accounts HTTP/1.1
Host: api.xsolla.com
Authorization: Basic <credentials>
```

### Charge Saved Account

```http
POST /projects/{project_id}/users/{user_id}/payments/{type}/{account_id} HTTP/1.1
Host: api.xsolla.com
Authorization: Basic <credentials>
Content-Type: application/json

{
  "purchase": {
    "amount": 9.99,
    "currency": "USD"
  }
}
```

### Delete Saved Account

```http
DELETE /projects/{project_id}/users/{user_id}/payment_accounts/{type}/{account_id} HTTP/1.1
Host: api.xsolla.com
Authorization: Basic <credentials>
```

---

## Sandbox Testing

### Enable Sandbox

- Pass `sandbox: true` in token generation
- Or add `?sandbox=true` to Pay Station URL

### Test Cards

| Card Number | Result |
|-------------|--------|
| `4111 1111 1111 1111` | Successful payment |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 0077` | 3D Secure required |

Use any future expiry date and any 3-digit CVV.

---

## Error Handling

### Common Token Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `INVALID_PROJECT_ID` | Wrong project ID | Verify in Publisher Account |
| `INVALID_SIGNATURE` | Auth failure | Check API key and encoding |
| `INVALID_USER` | Missing user ID | Provide `user.id.value` |
| `INVALID_CURRENCY` | Unsupported currency | Check supported currencies |

### Payment Errors

| Error | User Action |
|-------|-------------|
| `PAYMENT_DECLINED` | Try different payment method |
| `INSUFFICIENT_FUNDS` | Use different card |
| `3DS_FAILED` | Complete 3D Secure verification |
| `EXPIRED_CARD` | Use valid card |
