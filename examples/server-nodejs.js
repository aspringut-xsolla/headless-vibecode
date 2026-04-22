/**
 * Xsolla Headless Webshop - Node.js Server Example
 *
 * This example shows:
 * - Authentication with Xsolla APIs
 * - Payment token generation
 * - Webhook handling with signature verification
 */

const express = require('express');
const crypto = require('crypto');

const app = express();

// Configuration
const CONFIG = {
  projectId: process.env.XSOLLA_PROJECT_ID,
  merchantId: process.env.XSOLLA_MERCHANT_ID,
  apiKey: process.env.XSOLLA_API_KEY,
  webhookSecret: process.env.XSOLLA_WEBHOOK_SECRET,
  sandbox: process.env.NODE_ENV !== 'production'
};

// Base URLs
const STORE_API = 'https://store.xsolla.com/api';
const PAY_STATION_API = 'https://api.xsolla.com';
const LOGIN_API = 'https://login.xsolla.com/api';

// Helper: Create Basic Auth header
function getBasicAuth() {
  const credentials = Buffer.from(`${CONFIG.projectId}:${CONFIG.apiKey}`).toString('base64');
  return `Basic ${credentials}`;
}

// Helper: Create Merchant Basic Auth header
function getMerchantAuth() {
  const credentials = Buffer.from(`${CONFIG.merchantId}:${CONFIG.apiKey}`).toString('base64');
  return `Basic ${credentials}`;
}

// ============================================
// CATALOG ENDPOINTS
// ============================================

/**
 * Get all virtual items
 */
app.get('/api/catalog/items', async (req, res) => {
  try {
    const response = await fetch(
      `${STORE_API}/v2/project/${CONFIG.projectId}/items/virtual_items/all`,
      {
        headers: {
          'Authorization': req.headers.authorization // Pass through user JWT
        }
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get items by group
 */
app.get('/api/catalog/groups/:groupId/items', async (req, res) => {
  try {
    const response = await fetch(
      `${STORE_API}/v2/project/${CONFIG.projectId}/items/virtual_items/group/${req.params.groupId}`,
      {
        headers: {
          'Authorization': req.headers.authorization
        }
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CART ENDPOINTS
// ============================================

/**
 * Get user's cart
 */
app.get('/api/cart', async (req, res) => {
  try {
    const response = await fetch(
      `${STORE_API}/v2/project/${CONFIG.projectId}/cart`,
      {
        headers: {
          'Authorization': req.headers.authorization
        }
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add item to cart
 */
app.put('/api/cart/items/:sku', express.json(), async (req, res) => {
  try {
    // First get cart ID
    const cartResponse = await fetch(
      `${STORE_API}/v2/project/${CONFIG.projectId}/cart`,
      {
        headers: { 'Authorization': req.headers.authorization }
      }
    );
    const cart = await cartResponse.json();

    // Add/update item
    const response = await fetch(
      `${STORE_API}/v2/project/${CONFIG.projectId}/cart/${cart.cart_id}/item/${req.params.sku}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': req.headers.authorization,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: req.body.quantity || 1 })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PAYMENT ENDPOINTS
// ============================================

/**
 * Generate payment token (server-side - recommended approach)
 */
app.post('/api/payment/token', express.json(), async (req, res) => {
  try {
    const { userId, userEmail, userName, items, currency = 'USD', returnUrl } = req.body;

    const response = await fetch(
      `${STORE_API}/v3/project/${CONFIG.projectId}/admin/payment/token`,
      {
        method: 'POST',
        headers: {
          'Authorization': getBasicAuth(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: {
            id: { value: userId },
            email: { value: userEmail },
            name: { value: userName }
          },
          purchase: {
            items: items.map(item => ({
              sku: item.sku,
              quantity: item.quantity || 1
            }))
          },
          settings: {
            language: 'en',
            currency: currency,
            sandbox: CONFIG.sandbox,
            return_url: returnUrl,
            ui: {
              theme: 'default'
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Return token and Pay Station URL
    res.json({
      token: data.token,
      orderId: data.order_id,
      payStationUrl: `https://secure.xsolla.com/paystation4/?token=${data.token}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate payment token for cart
 */
app.post('/api/payment/cart/token', express.json(), async (req, res) => {
  try {
    const { userId, userEmail, cartId, returnUrl } = req.body;

    // Get cart contents
    const cartResponse = await fetch(
      `${STORE_API}/v2/project/${CONFIG.projectId}/cart/${cartId}`,
      {
        headers: { 'Authorization': req.headers.authorization }
      }
    );
    const cart = await cartResponse.json();

    // Generate token with cart items
    const items = cart.items.map(item => ({
      sku: item.sku,
      quantity: item.quantity
    }));

    const tokenResponse = await fetch(
      `${STORE_API}/v3/project/${CONFIG.projectId}/admin/payment/token`,
      {
        method: 'POST',
        headers: {
          'Authorization': getBasicAuth(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: {
            id: { value: userId },
            email: { value: userEmail }
          },
          purchase: { items },
          settings: {
            sandbox: CONFIG.sandbox,
            return_url: returnUrl
          }
        })
      }
    );

    const data = await tokenResponse.json();
    res.json({
      token: data.token,
      orderId: data.order_id,
      payStationUrl: `https://secure.xsolla.com/paystation4/?token=${data.token}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ORDER ENDPOINTS
// ============================================

/**
 * Get order status
 */
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const response = await fetch(
      `${STORE_API}/v2/project/${CONFIG.projectId}/order/${req.params.orderId}`,
      {
        headers: { 'Authorization': req.headers.authorization }
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// WEBHOOK HANDLING
// ============================================

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(rawBody, receivedSignature) {
  const expectedSignature = crypto
    .createHash('sha1')
    .update(rawBody + CONFIG.webhookSecret)
    .digest('hex');

  try {
    return crypto.timingSafeEquals(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(receivedSignature.toLowerCase(), 'utf8')
    );
  } catch {
    return false;
  }
}

/**
 * Webhook endpoint
 */
app.post('/webhooks/xsolla', express.raw({ type: 'application/json' }), async (req, res) => {
  // Extract signature from Authorization header
  const authHeader = req.headers['authorization'] || '';
  const signature = authHeader.replace('Signature ', '');

  // Verify signature
  if (!verifyWebhookSignature(req.body.toString(), signature)) {
    console.error('Invalid webhook signature');
    return res.status(400).json({
      error: { code: 'INVALID_SIGNATURE', message: 'Signature verification failed' }
    });
  }

  // Parse webhook
  const webhook = JSON.parse(req.body);
  console.log('Received webhook:', webhook.notification_type);

  try {
    switch (webhook.notification_type) {
      case 'user_validation':
        await handleUserValidation(webhook, res);
        break;

      case 'order_paid':
        await handleOrderPaid(webhook, res);
        break;

      case 'order_canceled':
        await handleOrderCanceled(webhook, res);
        break;

      case 'payment':
        // Legacy webhook for older accounts
        await handlePayment(webhook, res);
        break;

      case 'refund':
        await handleRefund(webhook, res);
        break;

      default:
        console.log('Unhandled webhook type:', webhook.notification_type);
        res.status(200).send();
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

/**
 * Handle user validation webhook
 */
async function handleUserValidation(webhook, res) {
  const userId = webhook.user.id;

  // Check if user exists in your system
  const userExists = await checkUserExists(userId);

  if (!userExists) {
    return res.status(400).json({
      error: { code: 'INVALID_USER', message: 'User not found' }
    });
  }

  res.status(200).send();
}

/**
 * Handle order_paid webhook - fulfill the order
 */
async function handleOrderPaid(webhook, res) {
  const { order, user } = webhook;

  // Idempotency check
  const existingOrder = await findOrder(order.id);
  if (existingOrder && existingOrder.fulfilled) {
    console.log('Order already fulfilled:', order.id);
    return res.status(200).send();
  }

  // Grant items to user
  for (const item of order.content.items) {
    await grantItemToUser(user.id, item.sku, item.quantity);
    console.log(`Granted ${item.quantity}x ${item.sku} to user ${user.id}`);
  }

  // Record order as fulfilled
  await saveOrder({
    orderId: order.id,
    userId: user.id,
    items: order.content.items,
    amount: order.content.price.amount,
    currency: order.content.price.currency,
    fulfilled: true,
    fulfilledAt: new Date()
  });

  res.status(200).send();
}

/**
 * Handle order_canceled webhook - revoke items if already granted
 */
async function handleOrderCanceled(webhook, res) {
  const { order, user } = webhook;

  const existingOrder = await findOrder(order.id);
  if (existingOrder && existingOrder.fulfilled) {
    // Revoke previously granted items
    for (const item of existingOrder.items) {
      await revokeItemFromUser(user.id, item.sku, item.quantity);
      console.log(`Revoked ${item.quantity}x ${item.sku} from user ${user.id}`);
    }

    await updateOrder(order.id, { status: 'canceled', fulfilled: false });
  }

  res.status(200).send();
}

/**
 * Handle legacy payment webhook
 */
async function handlePayment(webhook, res) {
  // Similar to order_paid but different payload structure
  console.log('Legacy payment webhook:', webhook.transaction.id);
  res.status(200).send();
}

/**
 * Handle refund webhook
 */
async function handleRefund(webhook, res) {
  console.log('Refund webhook:', webhook.transaction.id);
  // Revoke items, update order status
  res.status(200).send();
}

// ============================================
// DATABASE STUBS (Replace with your implementation)
// ============================================

async function checkUserExists(userId) {
  // TODO: Check your database
  return true;
}

async function findOrder(orderId) {
  // TODO: Query your database
  return null;
}

async function saveOrder(order) {
  // TODO: Save to your database
  console.log('Saving order:', order);
}

async function updateOrder(orderId, updates) {
  // TODO: Update in your database
  console.log('Updating order:', orderId, updates);
}

async function grantItemToUser(userId, sku, quantity) {
  // TODO: Add item to user's inventory
  console.log(`Grant: ${quantity}x ${sku} to ${userId}`);
}

async function revokeItemFromUser(userId, sku, quantity) {
  // TODO: Remove item from user's inventory
  console.log(`Revoke: ${quantity}x ${sku} from ${userId}`);
}

// ============================================
// SERVER START
// ============================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Sandbox mode: ${CONFIG.sandbox}`);
});
