import { products } from './storeData.js';
import { eventBus } from './eventBus.js';

const stockOverrides = {};
const orders = {};
const ORDER_STATES = [
  'ORDEN_CREADA',
  'EN_PROCESO',
  'PREPARANDO',
  'ENVIADO',
  'EN_CAMINO',
  'ENTREGADO'
];

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

export const productService = {
  getAll() {
    return products.map((product) => ({
      ...product,
      stock: stockOverrides[product.id] ?? product.stock
    }));
  },

  getById(id) {
    const product = products.find((item) => item.id === id);
    if (!product) {
      return null;
    }

    return {
      ...product,
      stock: stockOverrides[product.id] ?? product.stock
    };
  },

  search(query, locale) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return this.getAll();
    }

    return this.getAll().filter(
      (product) =>
        product.name[locale]?.toLowerCase().includes(normalized) ||
        product.desc[locale]?.toLowerCase().includes(normalized)
    );
  },

  getByCategory(category) {
    if (category === 'all') {
      return this.getAll();
    }

    return this.getAll().filter((product) => product.category === category);
  },

  reserveStock(id, quantity) {
    const product = this.getById(id);
    if (!product || product.stock < quantity) {
      return false;
    }

    stockOverrides[id] = product.stock - quantity;
    eventBus.emit('product:stock_updated', { id, stock: stockOverrides[id] });
    return true;
  },

  restoreStock(id, quantity) {
    const baseProduct = products.find((item) => item.id === id);
    if (!baseProduct) {
      return;
    }

    stockOverrides[id] = (stockOverrides[id] ?? baseProduct.stock) + quantity;
    eventBus.emit('product:stock_restored', { id, stock: stockOverrides[id] });
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
  create(cartItems, shippingInfo, paymentInfo, country, currency) {
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const order = {
      id,
      items: [...cartItems],
      shippingInfo,
      paymentInfo,
      country,
      currency,
      status: ORDER_STATES[0],
      statusIndex: 0,
      createdAt: new Date().toISOString(),
      history: [{ status: ORDER_STATES[0], time: new Date().toISOString() }]
    };

    order.total = calculateOrderTotal(cartItems);
    orders[id] = order;

    eventBus.emit('order:created', order);
    this.autoAdvance(id);

    return order;
  },

  getById(id) {
    return orders[id] || null;
  },

  getAll() {
    return Object.values(orders);
  },

  updateStatus(id, status) {
    const order = orders[id];
    if (!order) {
      return;
    }

    order.status = status;
    order.statusIndex = ORDER_STATES.indexOf(status);
    order.history.push({ status, time: new Date().toISOString() });
    eventBus.emit('order:status_updated', order);
  },

  autoAdvance(id) {
    let currentIndex = 1;
    const interval = setInterval(() => {
      if (currentIndex >= ORDER_STATES.length) {
        clearInterval(interval);
        return;
      }

      this.updateStatus(id, ORDER_STATES[currentIndex]);
      currentIndex += 1;
    }, 4000);
  }
};

export const sagaOrchestrator = {
  async processOrder(cart, shippingInfo, paymentData, country, currency) {
    const completedSteps = [];

    try {
      eventBus.emit('saga:step', { step: 'reserve_stock', status: 'running' });
      for (const item of cart) {
        if (!productService.reserveStock(item.id, item.qty)) {
          throw new Error(`stock_insufficient:${item.id}`);
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
      const order = orderService.create(
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
          productService.restoreStock(step.id, step.qty);
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

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
