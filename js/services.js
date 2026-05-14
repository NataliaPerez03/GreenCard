import { products } from './data.js';
import { eventBus } from './eventBus.js';

// ─── Product Service ───
const stockOverrides = {};
export const productService = {
  getAll() { return products.map(p => ({...p, stock: stockOverrides[p.id] ?? p.stock })); },
  getById(id) { const p = products.find(x => x.id === id); return p ? {...p, stock: stockOverrides[p.id] ?? p.stock} : null; },
  search(query, locale) {
    const q = query.toLowerCase();
    return this.getAll().filter(p => p.name[locale]?.toLowerCase().includes(q) || p.desc[locale]?.toLowerCase().includes(q));
  },
  getByCategory(cat) { return cat === 'all' ? this.getAll() : this.getAll().filter(p => p.category === cat); },
  checkStock(id, qty) { const p = this.getById(id); return p && p.stock >= qty; },
  reserveStock(id, qty) {
    const p = this.getById(id);
    if (!p || p.stock < qty) return false;
    stockOverrides[id] = p.stock - qty;
    eventBus.emit('product:stock_updated', { id, stock: stockOverrides[id] });
    return true;
  },
  restoreStock(id, qty) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    stockOverrides[id] = (stockOverrides[id] ?? p.stock) + qty;
    eventBus.emit('product:stock_restored', { id, stock: stockOverrides[id] });
  }
};

// ─── Payment Service ───
export const paymentService = {
  async validate(paymentData) {
    await delay(600);
    if (!paymentData.method) return { success: false, error: 'no_method' };
    return { success: true };
  },
  async process(paymentData) {
    eventBus.emit('payment:processing', paymentData);
    await delay(1500);
    // Simulate 85% success rate
    const success = Math.random() < 0.85;
    if (success) {
      const txId = 'TX-' + Date.now().toString(36).toUpperCase();
      eventBus.emit('payment:success', { ...paymentData, txId });
      return { success: true, txId };
    } else {
      eventBus.emit('payment:failed', paymentData);
      return { success: false, error: 'payment_declined' };
    }
  },
  async refund(txId) {
    await delay(800);
    eventBus.emit('payment:refunded', { txId });
    return { success: true };
  }
};

// ─── Order Service ───
const orders = {};
const ORDER_STATES = ['ORDEN_CREADA','EN_PROCESO','PREPARANDO','ENVIADO','EN_CAMINO','ENTREGADO'];
const STATUS_KEYS = ['status_created','status_processing','status_preparing','status_shipped','status_transit','status_delivered'];

export { ORDER_STATES, STATUS_KEYS };

export const orderService = {
  create(cartItems, shippingInfo, paymentInfo, country, currency) {
    const id = 'ORD-' + Date.now().toString(36).toUpperCase();
    const order = {
      id, items: [...cartItems], shippingInfo, paymentInfo,
      country, currency, status: 'ORDEN_CREADA', statusIndex: 0,
      createdAt: new Date().toISOString(),
      history: [{ status:'ORDEN_CREADA', time: new Date().toISOString() }]
    };
    order.total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    orders[id] = order;
    eventBus.emit('order:created', order);
    // Auto-advance status for demo
    this._autoAdvance(id);
    return order;
  },
  getById(id) { return orders[id] || null; },
  getAll() { return Object.values(orders); },
  updateStatus(id, status) {
    const order = orders[id];
    if (!order) return;
    order.status = status;
    order.statusIndex = ORDER_STATES.indexOf(status);
    order.history.push({ status, time: new Date().toISOString() });
    eventBus.emit('order:status_updated', order);
  },
  _autoAdvance(id) {
    let idx = 1;
    const iv = setInterval(() => {
      if (idx >= ORDER_STATES.length) { clearInterval(iv); return; }
      this.updateStatus(id, ORDER_STATES[idx]);
      idx++;
    }, 4000);
  }
};

// ─── SAGA Orchestrator ───
export const sagaOrchestrator = {
  async processOrder(cart, shippingInfo, paymentData, country, currency) {
    const steps = [];
    try {
      // Step 1: Reserve stock
      eventBus.emit('saga:step', { step:'reserve_stock', status:'running' });
      for (const item of cart) {
        if (!productService.reserveStock(item.id, item.qty)) {
          throw new Error('stock_insufficient:' + item.id);
        }
        steps.push({ type:'stock', id: item.id, qty: item.qty });
      }
      eventBus.emit('saga:step', { step:'reserve_stock', status:'done' });

      // Step 2: Validate payment
      eventBus.emit('saga:step', { step:'validate_payment', status:'running' });
      const validation = await paymentService.validate(paymentData);
      if (!validation.success) throw new Error('validation_failed');
      eventBus.emit('saga:step', { step:'validate_payment', status:'done' });

      // Step 3: Process payment
      eventBus.emit('saga:step', { step:'process_payment', status:'running' });
      const payment = await paymentService.process(paymentData);
      if (!payment.success) throw new Error('payment_failed');
      steps.push({ type:'payment', txId: payment.txId });
      eventBus.emit('saga:step', { step:'process_payment', status:'done' });

      // Step 4: Create order
      eventBus.emit('saga:step', { step:'create_order', status:'running' });
      const order = orderService.create(cart, shippingInfo, { ...paymentData, txId: payment.txId }, country, currency);
      eventBus.emit('saga:step', { step:'create_order', status:'done' });

      eventBus.emit('saga:complete', order);
      return { success: true, order };

    } catch (err) {
      // SAGA Compensation (rollback)
      eventBus.emit('saga:rollback_start', { error: err.message });

      for (const step of steps.reverse()) {
        if (step.type === 'stock') {
          productService.restoreStock(step.id, step.qty);
        }
        if (step.type === 'payment') {
          await paymentService.refund(step.txId);
        }
      }

      eventBus.emit('saga:rollback_complete', { error: err.message });
      return { success: false, error: err.message };
    }
  }
};

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
