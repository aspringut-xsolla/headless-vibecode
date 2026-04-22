/**
 * Xsolla Webhook Handler - TypeScript Example
 *
 * This example shows type-safe webhook handling with:
 * - Signature verification
 * - Type definitions for all webhook payloads
 * - Idempotent order processing
 */

import { createHmac, timingSafeEqual } from 'crypto';

// ============================================
// TYPE DEFINITIONS
// ============================================

type WebhookType =
  | 'user_validation'
  | 'payment'
  | 'refund'
  | 'order_paid'
  | 'order_canceled'
  | 'create_subscription'
  | 'update_subscription'
  | 'cancel_subscription'
  | 'afs_reject'
  | 'dispute';

interface WebhookUser {
  id: string;
  email?: string;
  name?: string;
  country?: string;
  ip?: string;
  phone?: string;
}

interface OrderItem {
  sku: string;
  quantity: number;
  amount?: string;
  type?: 'virtual_item' | 'virtual_currency' | 'bundle' | 'game_key';
  is_free?: boolean;
}

interface OrderContent {
  items: OrderItem[];
  price: {
    amount: string;
    currency: string;
    amount_without_discount?: string;
  };
}

interface Transaction {
  id: number;
  external_id?: string;
  payment_date?: string;
  payment_method?: number;
  payment_method_name?: string;
  dry_run?: boolean;
}

// Webhook Payloads
interface UserValidationWebhook {
  notification_type: 'user_validation';
  user: WebhookUser;
}

interface OrderPaidWebhook {
  notification_type: 'order_paid';
  order: {
    id: number;
    status: string;
    content: OrderContent;
  };
  user: WebhookUser;
  transaction?: Transaction;
}

interface OrderCanceledWebhook {
  notification_type: 'order_canceled';
  order: {
    id: number;
    status: string;
  };
  user: WebhookUser;
}

interface PaymentWebhook {
  notification_type: 'payment';
  purchase: {
    virtual_items?: { items: { sku: string; amount: number }[] };
    virtual_currency?: { sku: string; amount: number };
    total: { amount: string; currency: string };
  };
  user: WebhookUser;
  transaction: Transaction;
}

interface RefundWebhook {
  notification_type: 'refund';
  transaction: Transaction;
  user: WebhookUser;
  refund_details?: {
    amount: number;
    currency: string;
    reason?: string;
  };
}

interface SubscriptionWebhook {
  notification_type: 'create_subscription' | 'update_subscription' | 'cancel_subscription';
  subscription: {
    id: number;
    plan_id: string;
    product_id?: string;
    status: string;
    date_create?: string;
    date_next_charge?: string;
    date_end?: string;
  };
  user: WebhookUser;
}

type XsollaWebhook =
  | UserValidationWebhook
  | OrderPaidWebhook
  | OrderCanceledWebhook
  | PaymentWebhook
  | RefundWebhook
  | SubscriptionWebhook;

// Response types
interface WebhookErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

// ============================================
// SIGNATURE VERIFICATION
// ============================================

export function verifySignature(
  rawBody: string,
  receivedSignature: string,
  secretKey: string
): boolean {
  const expectedSignature = createHmac('sha1', '')
    .update(rawBody + secretKey)
    .digest('hex');

  // Use SHA1 without HMAC (Xsolla's implementation)
  const hash = require('crypto')
    .createHash('sha1')
    .update(rawBody + secretKey)
    .digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(hash, 'utf8'),
      Buffer.from(receivedSignature.toLowerCase(), 'utf8')
    );
  } catch {
    return false;
  }
}

// ============================================
// WEBHOOK HANDLER CLASS
// ============================================

export class WebhookHandler {
  private secretKey: string;
  private db: DatabaseAdapter;
  private inventory: InventoryService;

  constructor(config: {
    secretKey: string;
    db: DatabaseAdapter;
    inventory: InventoryService;
  }) {
    this.secretKey = config.secretKey;
    this.db = config.db;
    this.inventory = config.inventory;
  }

  /**
   * Main entry point for webhook processing
   */
  async handle(
    rawBody: string,
    authHeader: string
  ): Promise<{ status: number; body?: WebhookErrorResponse }> {
    // Extract and verify signature
    const signature = authHeader.replace('Signature ', '');

    if (!verifySignature(rawBody, signature, this.secretKey)) {
      return {
        status: 400,
        body: { error: { code: 'INVALID_SIGNATURE', message: 'Signature verification failed' } }
      };
    }

    // Parse webhook
    const webhook: XsollaWebhook = JSON.parse(rawBody);

    // Route to appropriate handler
    switch (webhook.notification_type) {
      case 'user_validation':
        return this.handleUserValidation(webhook);

      case 'order_paid':
        return this.handleOrderPaid(webhook);

      case 'order_canceled':
        return this.handleOrderCanceled(webhook);

      case 'payment':
        return this.handlePayment(webhook);

      case 'refund':
        return this.handleRefund(webhook);

      case 'create_subscription':
      case 'update_subscription':
      case 'cancel_subscription':
        return this.handleSubscription(webhook);

      default:
        // Unknown webhook type, acknowledge receipt
        console.log('Unknown webhook type:', (webhook as any).notification_type);
        return { status: 200 };
    }
  }

  /**
   * Validate that user exists in system
   */
  private async handleUserValidation(
    webhook: UserValidationWebhook
  ): Promise<{ status: number; body?: WebhookErrorResponse }> {
    const user = await this.db.findUser(webhook.user.id);

    if (!user) {
      return {
        status: 400,
        body: { error: { code: 'INVALID_USER', message: 'User not found' } }
      };
    }

    return { status: 200 };
  }

  /**
   * Process successful order payment
   */
  private async handleOrderPaid(
    webhook: OrderPaidWebhook
  ): Promise<{ status: number; body?: WebhookErrorResponse }> {
    const { order, user } = webhook;

    // Idempotency check
    const existingOrder = await this.db.findOrder(order.id);
    if (existingOrder?.fulfilled) {
      console.log(`Order ${order.id} already fulfilled, skipping`);
      return { status: 200 };
    }

    // Verify user exists
    const dbUser = await this.db.findUser(user.id);
    if (!dbUser) {
      return {
        status: 400,
        body: { error: { code: 'INVALID_USER', message: 'User not found' } }
      };
    }

    // Grant all items
    const grantedItems: OrderItem[] = [];

    for (const item of order.content.items) {
      try {
        await this.inventory.grantItem(user.id, item.sku, item.quantity);
        grantedItems.push(item);
      } catch (error) {
        // Rollback on failure
        for (const granted of grantedItems) {
          await this.inventory.revokeItem(user.id, granted.sku, granted.quantity);
        }
        throw error;
      }
    }

    // Record fulfilled order
    await this.db.saveOrder({
      orderId: order.id,
      userId: user.id,
      items: order.content.items,
      amount: parseFloat(order.content.price.amount),
      currency: order.content.price.currency,
      fulfilled: true,
      fulfilledAt: new Date(),
      transactionId: webhook.transaction?.id
    });

    return { status: 200 };
  }

  /**
   * Handle order cancellation (refund)
   */
  private async handleOrderCanceled(
    webhook: OrderCanceledWebhook
  ): Promise<{ status: number; body?: WebhookErrorResponse }> {
    const { order, user } = webhook;

    const existingOrder = await this.db.findOrder(order.id);

    if (existingOrder?.fulfilled) {
      // Revoke previously granted items
      for (const item of existingOrder.items) {
        await this.inventory.revokeItem(user.id, item.sku, item.quantity);
      }

      await this.db.updateOrder(order.id, {
        status: 'canceled',
        fulfilled: false,
        canceledAt: new Date()
      });
    }

    return { status: 200 };
  }

  /**
   * Handle legacy payment webhook
   */
  private async handlePayment(
    webhook: PaymentWebhook
  ): Promise<{ status: number; body?: WebhookErrorResponse }> {
    // For accounts before Jan 2025, this contains payment details
    // Order fulfillment happens via order_paid webhook
    console.log(`Payment received: ${webhook.transaction.id}`);
    return { status: 200 };
  }

  /**
   * Handle refund webhook
   */
  private async handleRefund(
    webhook: RefundWebhook
  ): Promise<{ status: number; body?: WebhookErrorResponse }> {
    console.log(`Refund processed: ${webhook.transaction.id}`);
    // Item revocation handled by order_canceled webhook
    return { status: 200 };
  }

  /**
   * Handle subscription events
   */
  private async handleSubscription(
    webhook: SubscriptionWebhook
  ): Promise<{ status: number; body?: WebhookErrorResponse }> {
    const { subscription, user } = webhook;

    switch (webhook.notification_type) {
      case 'create_subscription':
        await this.db.createSubscription({
          id: subscription.id,
          userId: user.id,
          planId: subscription.plan_id,
          status: 'active',
          startedAt: new Date(subscription.date_create!),
          renewsAt: subscription.date_next_charge
            ? new Date(subscription.date_next_charge)
            : null
        });
        await this.inventory.grantSubscriptionBenefits(user.id, subscription.plan_id);
        break;

      case 'update_subscription':
        await this.db.updateSubscription(subscription.id, {
          status: subscription.status,
          renewsAt: subscription.date_next_charge
            ? new Date(subscription.date_next_charge)
            : null
        });
        break;

      case 'cancel_subscription':
        await this.db.updateSubscription(subscription.id, {
          status: 'canceled',
          endedAt: subscription.date_end
            ? new Date(subscription.date_end)
            : new Date()
        });
        await this.inventory.revokeSubscriptionBenefits(user.id, subscription.plan_id);
        break;
    }

    return { status: 200 };
  }
}

// ============================================
// INTERFACE DEFINITIONS (Implement these)
// ============================================

interface DatabaseAdapter {
  findUser(userId: string): Promise<{ id: string } | null>;
  findOrder(orderId: number): Promise<{
    orderId: number;
    fulfilled: boolean;
    items: OrderItem[];
  } | null>;
  saveOrder(order: {
    orderId: number;
    userId: string;
    items: OrderItem[];
    amount: number;
    currency: string;
    fulfilled: boolean;
    fulfilledAt: Date;
    transactionId?: number;
  }): Promise<void>;
  updateOrder(orderId: number, updates: Record<string, any>): Promise<void>;
  createSubscription(sub: {
    id: number;
    userId: string;
    planId: string;
    status: string;
    startedAt: Date;
    renewsAt: Date | null;
  }): Promise<void>;
  updateSubscription(subId: number, updates: Record<string, any>): Promise<void>;
}

interface InventoryService {
  grantItem(userId: string, sku: string, quantity: number): Promise<void>;
  revokeItem(userId: string, sku: string, quantity: number): Promise<void>;
  grantSubscriptionBenefits(userId: string, planId: string): Promise<void>;
  revokeSubscriptionBenefits(userId: string, planId: string): Promise<void>;
}

// ============================================
// EXPRESS INTEGRATION EXAMPLE
// ============================================

/*
import express from 'express';

const app = express();
const webhookHandler = new WebhookHandler({
  secretKey: process.env.XSOLLA_WEBHOOK_SECRET!,
  db: myDatabaseAdapter,
  inventory: myInventoryService
});

app.post(
  '/webhooks/xsolla',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const result = await webhookHandler.handle(
      req.body.toString(),
      req.headers['authorization'] || ''
    );

    if (result.body) {
      res.status(result.status).json(result.body);
    } else {
      res.status(result.status).send();
    }
  }
);
*/
