import { eventBus } from './eventBus.js';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
const ORDER_STATES = [
  'ORDEN_CREADA',
  'EN_PROCESO',
  'PREPARANDO',
  'ENVIADO',
  'EN_CAMINO',
  'ENTREGADO'
];

let productsCache = [];

export const STATUS_KEYS = [
  'status_created',
  'status_processing',
  'status_preparing',
  'status_shipped',
  'status_transit',
  'status_delivered'
];

export function calculateOrderTotal(items = []) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.detail || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return payload;
}

function updateProductCache(product) {
  const index = productsCache.findIndex((item) => item.id === product.id);
  if (index === -1) {
    productsCache = [...productsCache, product];
    return;
  }

  productsCache = productsCache.map((item) => (item.id === product.id ? product : item));
}

export const productService = {
  async loadAll() {
    const payload = await apiRequest('/api/products');
    productsCache = Array.isArray(payload.products) ? payload.products : [];
    eventBus.emit('product:catalog_updated', this.getAll());
    return this.getAll();
  },

  getAll() {
    return productsCache.map((product) => ({ ...product }));
  },

  getById(id) {
    const product = productsCache.find((item) => item.id === id);
    return product ? { ...product } : null;
  },

  search(query, locale) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return this.getAll();
    }

    return this.getAll().filter(
      (product) =>
        product.name?.[locale]?.toLowerCase()?.includes(normalized) ||
        product.desc?.[locale]?.toLowerCase()?.includes(normalized)
    );
  },

  getByCategory(category) {
    if (category === 'all') {
      return this.getAll();
    }

    return this.getAll().filter((product) => product.category === category);
  },

  async reserveStock(id, quantity) {
    try {
      const product = await apiRequest(`/api/products/${id}/reserve`, {
        method: 'POST',
        body: JSON.stringify({ quantity })
      });

      updateProductCache(product);
      eventBus.emit('product:stock_updated', product);
      return { success: true, product };
    } catch (error) {
      if (error.status === 404 || error.status === 409) {
        return { success: false, error: error.message };
      }

      throw error;
    }
  },

  async restoreStock(id, quantity) {
    const product = await apiRequest(`/api/products/${id}/restore`, {
      method: 'POST',
      body: JSON.stringify({ quantity })
    });

    updateProductCache(product);
    eventBus.emit('product:stock_restored', product);
    return product;
  }
};

export const paymentService = {
  async validate(paymentData) {
    await delay(600);

    if (!paymentData.method) {
      return { success: false, error: 'no_method' };
    }

    return { success: true };
  },

  async process(paymentData) {
    eventBus.emit('payment:processing', paymentData);
    await delay(1500);

    const success = Math.random() < 0.85;
    if (!success) {
      eventBus.emit('payment:failed', paymentData);
      return { success: false, error: 'payment_declined' };
    }

    const txId = `TX-${Date.now().toString(36).toUpperCase()}`;
    eventBus.emit('payment:success', { ...paymentData, txId });
    return { success: true, txId };
  },

  async refund(txId) {
    await delay(800);
    eventBus.emit('payment:refunded', { txId });
    return { success: true };
  }
};

export const orderService = {
  async create(cartItems, shippingInfo, paymentInfo, country, currency) {
    const order = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: cartItems,
        shippingInfo,
        paymentInfo,
        country,
        currency
      })
    });

    eventBus.emit('order:created', order);
    return order;
  },

  async getById(id) {
    return apiRequest(`/api/orders/${id}`);
  },

  async getAll() {
    const payload = await apiRequest('/api/orders');
    return Array.isArray(payload.orders) ? payload.orders : [];
  }
};

export const sagaOrchestrator = {
  async processOrder(cart, shippingInfo, paymentData, country, currency) {
    const completedSteps = [];

    try {
      eventBus.emit('saga:step', { step: 'reserve_stock', status: 'running' });
      for (const item of cart) {
        const reservation = await productService.reserveStock(item.id, item.qty);
        if (!reservation.success) {
          throw new Error(reservation.error || `stock_insufficient:${item.id}`);
        }

        completedSteps.push({ type: 'stock', id: item.id, qty: item.qty });
      }
      eventBus.emit('saga:step', { step: 'reserve_stock', status: 'done' });

      eventBus.emit('saga:step', { step: 'validate_payment', status: 'running' });
      const validation = await paymentService.validate(paymentData);
      if (!validation.success) {
        throw new Error('validation_failed');
      }
      eventBus.emit('saga:step', { step: 'validate_payment', status: 'done' });

      eventBus.emit('saga:step', { step: 'process_payment', status: 'running' });
      const payment = await paymentService.process(paymentData);
      if (!payment.success) {
        throw new Error('payment_failed');
      }

      completedSteps.push({ type: 'payment', txId: payment.txId });
      eventBus.emit('saga:step', { step: 'process_payment', status: 'done' });

      eventBus.emit('saga:step', { step: 'create_order', status: 'running' });
      const order = await orderService.create(
        cart,
        shippingInfo,
        { ...paymentData, txId: payment.txId },
        country,
        currency
      );
      eventBus.emit('saga:step', { step: 'create_order', status: 'done' });

      eventBus.emit('saga:complete', order);
      return { success: true, order };
    } catch (error) {
      eventBus.emit('saga:rollback_start', { error: error.message });

      for (const step of completedSteps.reverse()) {
        if (step.type === 'stock') {
          await productService.restoreStock(step.id, step.qty);
        }

        if (step.type === 'payment') {
          await paymentService.refund(step.txId);
        }
      }

      eventBus.emit('saga:rollback_complete', { error: error.message });
      return { success: false, error: error.message };
    }
  }
};

export function isOrderDelivered(order) {
  return order?.status === ORDER_STATES.at(-1);
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
