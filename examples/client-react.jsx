/**
 * Xsolla Headless Webshop - React Client Example
 *
 * This example shows:
 * - Fetching catalog items
 * - Cart management
 * - Payment flow with Pay Station
 * - Order status polling
 */

import React, { useState, useEffect, useCallback } from 'react';

// Configuration
const API_BASE = '/api'; // Your backend API

// ============================================
// API CLIENT
// ============================================

class XsollaClient {
  constructor(userToken) {
    this.userToken = userToken;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.userToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errorMessage || 'Request failed');
    }

    return response.json();
  }

  // Catalog
  async getCatalog() {
    return this.request('/catalog/items');
  }

  async getItemsByGroup(groupId) {
    return this.request(`/catalog/groups/${groupId}/items`);
  }

  // Cart
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(sku, quantity = 1) {
    return this.request(`/cart/items/${sku}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  async removeFromCart(sku) {
    return this.request(`/cart/items/${sku}`, {
      method: 'DELETE'
    });
  }

  // Payment
  async createPaymentToken(items, returnUrl) {
    return this.request('/payment/token', {
      method: 'POST',
      body: JSON.stringify({
        items,
        returnUrl
      })
    });
  }

  // Orders
  async getOrderStatus(orderId) {
    return this.request(`/orders/${orderId}`);
  }
}

// ============================================
// CONTEXT
// ============================================

const XsollaContext = React.createContext(null);

export function XsollaProvider({ userToken, children }) {
  const client = new XsollaClient(userToken);
  return (
    <XsollaContext.Provider value={client}>
      {children}
    </XsollaContext.Provider>
  );
}

function useXsolla() {
  const client = React.useContext(XsollaContext);
  if (!client) throw new Error('useXsolla must be used within XsollaProvider');
  return client;
}

// ============================================
// CATALOG COMPONENT
// ============================================

export function Catalog({ onAddToCart }) {
  const client = useXsolla();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    client.getCatalog()
      .then(data => setItems(data.items || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [client]);

  if (loading) return <div className="loading">Loading catalog...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="catalog">
      <h2>Shop</h2>
      <div className="items-grid">
        {items.map(item => (
          <ItemCard
            key={item.sku}
            item={item}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

function ItemCard({ item, onAddToCart }) {
  const price = item.price;
  const hasDiscount = price.amount_without_discount &&
    price.amount_without_discount !== price.amount;

  return (
    <div className="item-card">
      <img src={item.image_url} alt={item.name} />
      <h3>{item.name}</h3>
      <p className="description">{item.description}</p>

      <div className="price">
        {hasDiscount && (
          <span className="original-price">
            {price.amount_without_discount} {price.currency}
          </span>
        )}
        <span className="current-price">
          {price.amount} {price.currency}
        </span>
      </div>

      {item.virtual_prices?.length > 0 && (
        <div className="virtual-price">
          or {item.virtual_prices[0].amount} {item.virtual_prices[0].name}
        </div>
      )}

      <button
        onClick={() => onAddToCart(item)}
        disabled={!item.is_enabled}
      >
        Add to Cart
      </button>
    </div>
  );
}

// ============================================
// CART COMPONENT
// ============================================

export function Cart({ onCheckout }) {
  const client = useXsolla();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const data = await client.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleRemoveItem = async (sku) => {
    await client.removeFromCart(sku);
    refreshCart();
  };

  const handleUpdateQuantity = async (sku, quantity) => {
    if (quantity <= 0) {
      await client.removeFromCart(sku);
    } else {
      await client.addToCart(sku, quantity);
    }
    refreshCart();
  };

  if (loading) return <div className="loading">Loading cart...</div>;
  if (!cart || cart.items.length === 0) {
    return <div className="cart-empty">Your cart is empty</div>;
  }

  return (
    <div className="cart">
      <h2>Shopping Cart</h2>

      <div className="cart-items">
        {cart.items.map(item => (
          <div key={item.sku} className="cart-item">
            <img src={item.image_url} alt={item.name} />
            <div className="item-details">
              <h4>{item.name}</h4>
              <p>{item.price.amount} {item.price.currency}</p>
            </div>
            <div className="quantity-controls">
              <button onClick={() => handleUpdateQuantity(item.sku, item.quantity - 1)}>
                -
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => handleUpdateQuantity(item.sku, item.quantity + 1)}>
                +
              </button>
            </div>
            <button
              className="remove-btn"
              onClick={() => handleRemoveItem(item.sku)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-total">
        <strong>Total: {cart.price.amount} {cart.price.currency}</strong>
      </div>

      <button
        className="checkout-btn"
        onClick={() => onCheckout(cart)}
        disabled={cart.is_free && cart.items.length === 0}
      >
        {cart.is_free ? 'Get Free Items' : 'Proceed to Checkout'}
      </button>
    </div>
  );
}

// ============================================
// CHECKOUT COMPONENT
// ============================================

export function Checkout({ cart, onComplete, onCancel }) {
  const client = useXsolla();
  const [status, setStatus] = useState('preparing'); // preparing, paying, polling, done, error
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);

  // Start checkout
  const startCheckout = async () => {
    try {
      setStatus('preparing');

      const items = cart.items.map(item => ({
        sku: item.sku,
        quantity: item.quantity
      }));

      const result = await client.createPaymentToken(
        items,
        window.location.origin + '/checkout/complete'
      );

      setOrderId(result.orderId);
      setStatus('paying');

      // Open Pay Station
      openPayStation(result.token);
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  // Open Pay Station in popup/lightbox
  const openPayStation = (token) => {
    // Option 1: Popup window
    const popup = window.open(
      `https://secure.xsolla.com/paystation4/?token=${token}`,
      'XsollaPayStation',
      'width=800,height=600,scrollbars=yes'
    );

    // Poll for popup close
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setStatus('polling');
        pollOrderStatus();
      }
    }, 500);

    // Option 2: Use XPayStationWidget for lightbox (requires script include)
    // if (window.XPayStationWidget) {
    //   window.XPayStationWidget.init({ access_token: token, sandbox: true });
    //   window.XPayStationWidget.on('close', () => {
    //     setStatus('polling');
    //     pollOrderStatus();
    //   });
    //   window.XPayStationWidget.open();
    // }
  };

  // Poll order status after payment UI closes
  const pollOrderStatus = async () => {
    const maxAttempts = 20;
    const interval = 3000;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const order = await client.getOrderStatus(orderId);

        if (order.status === 'done') {
          setStatus('done');
          onComplete(order);
          return;
        }

        if (order.status === 'canceled' || order.status === 'error') {
          setStatus('error');
          setError('Payment was not completed');
          return;
        }

        // Still processing, wait
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (err) {
        console.error('Status check failed:', err);
      }
    }

    // Timeout
    setStatus('error');
    setError('Order status check timed out. Please check your order history.');
  };

  useEffect(() => {
    startCheckout();
  }, []);

  return (
    <div className="checkout">
      {status === 'preparing' && (
        <div className="checkout-status">
          <div className="spinner" />
          <p>Preparing your order...</p>
        </div>
      )}

      {status === 'paying' && (
        <div className="checkout-status">
          <p>Complete your payment in the popup window.</p>
          <p>Order ID: {orderId}</p>
          <button onClick={onCancel}>Cancel</button>
        </div>
      )}

      {status === 'polling' && (
        <div className="checkout-status">
          <div className="spinner" />
          <p>Processing your payment...</p>
        </div>
      )}

      {status === 'done' && (
        <div className="checkout-status success">
          <h3>Payment Successful!</h3>
          <p>Your items have been added to your inventory.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="checkout-status error">
          <h3>Payment Failed</h3>
          <p>{error}</p>
          <button onClick={onCancel}>Back to Cart</button>
        </div>
      )}
    </div>
  );
}

// ============================================
// ORDER HISTORY COMPONENT
// ============================================

export function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from your backend which calls Xsolla's order search API
    fetch('/api/orders/history')
      .then(res => res.json())
      .then(data => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading orders...</div>;
  if (orders.length === 0) return <div>No orders yet</div>;

  return (
    <div className="order-history">
      <h2>Order History</h2>
      {orders.map(order => (
        <div key={order.order_id} className="order-card">
          <div className="order-header">
            <span>Order #{order.order_id}</span>
            <span className={`status ${order.status}`}>{order.status}</span>
          </div>
          <div className="order-items">
            {order.content.items.map(item => (
              <div key={item.sku} className="order-item">
                {item.quantity}x {item.name || item.sku}
              </div>
            ))}
          </div>
          <div className="order-total">
            {order.content.price.amount} {order.content.price.currency}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function WebShop({ userToken }) {
  const [view, setView] = useState('catalog'); // catalog, cart, checkout
  const [cart, setCart] = useState(null);
  const client = new XsollaClient(userToken);

  const handleAddToCart = async (item) => {
    await client.addToCart(item.sku, 1);
    // Optionally show toast notification
  };

  const handleCheckout = (cartData) => {
    setCart(cartData);
    setView('checkout');
  };

  const handleCheckoutComplete = (order) => {
    setCart(null);
    setView('catalog');
    // Show success message
  };

  return (
    <XsollaProvider userToken={userToken}>
      <div className="webshop">
        <nav>
          <button onClick={() => setView('catalog')}>Shop</button>
          <button onClick={() => setView('cart')}>Cart</button>
          <button onClick={() => setView('orders')}>Orders</button>
        </nav>

        <main>
          {view === 'catalog' && (
            <Catalog onAddToCart={handleAddToCart} />
          )}

          {view === 'cart' && (
            <Cart onCheckout={handleCheckout} />
          )}

          {view === 'checkout' && cart && (
            <Checkout
              cart={cart}
              onComplete={handleCheckoutComplete}
              onCancel={() => setView('cart')}
            />
          )}

          {view === 'orders' && <OrderHistory />}
        </main>
      </div>
    </XsollaProvider>
  );
}
