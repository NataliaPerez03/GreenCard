import { eventBus } from './eventBus.js';
import { i18n } from './i18n.js';
import { countries } from './data.js';
import { productService, orderService, sagaOrchestrator } from './services.js';

// ─── State Store ───
export const store = {
  locale: 'es', country: 'CO', currency: 'COP',
  cart: [], currentOrder: null, orders: [],
  currentPage: 'home', categoryFilter: 'all', searchQuery: '',

  setCountry(code) {
    const c = countries.find(x => x.code === code);
    if (!c) return;
    this.country = c.code; this.currency = c.currency; this.locale = c.locale;
    i18n.setLocale(c.locale);
    this.cart = this.cart.map(item => {
      const p = productService.getById(item.id);
      return { ...item, price: p.prices[this.currency] };
    });
    eventBus.emit('store:changed', this);
    renderApp();
    renderFooter();
  },

  addToCart(productId, qty = 1) {
    const p = productService.getById(productId);
    if (!p) return;
    const existing = this.cart.find(i => i.id === productId);
    if (existing) { existing.qty += qty; }
    else { this.cart.push({ id: p.id, name: p.name, image: p.image, price: p.prices[this.currency], qty, stock: p.stock }); }
    eventBus.emit('cart:updated', this.cart);
    showToast(i18n.t('added'), 'success');
    updateCartBadge();
  },

  removeFromCart(productId) {
    this.cart = this.cart.filter(i => i.id !== productId);
    eventBus.emit('cart:updated', this.cart);
    updateCartBadge();
    if (this.currentPage === 'cart') renderApp();
  },

  updateQty(productId, qty) {
    const item = this.cart.find(i => i.id === productId);
    if (item) { item.qty = Math.max(1, Math.min(qty, item.stock)); }
    eventBus.emit('cart:updated', this.cart);
    if (this.currentPage === 'cart') renderApp();
  },

  getCartTotal() { return this.cart.reduce((s, i) => s + i.price * i.qty, 0); },
  getCartCount() { return this.cart.reduce((s, i) => s + i.qty, 0); },
  clearCart() { this.cart = []; eventBus.emit('cart:updated', []); updateCartBadge(); }
};

// ─── Toast ───
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span> ${message}`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// ─── Cart Badge ───
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) { const c = store.getCartCount(); badge.textContent = c; badge.style.display = c > 0 ? 'flex' : 'none'; }
}

// ─── Router ───
function navigate(page) {
  store.currentPage = page;
  window.location.hash = page;
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', () => {
  const page = window.location.hash.slice(1) || 'home';
  if (page !== store.currentPage) { store.currentPage = page; renderApp(); }
});

// ─── Render ───
function renderApp() {
  renderHeader();
  const main = document.getElementById('main-content');
  main.style.opacity = '0';
  setTimeout(() => {
    switch (store.currentPage) {
      case 'products': renderProducts(main); break;
      case 'cart': renderCart(main); break;
      case 'checkout': renderCheckout(main); break;
      case 'tracking': renderTracking(main); break;
      default: renderHome(main);
    }
    main.style.opacity = '1';
    updateCartBadge();
  }, 150);
}

// ─── Header ───
function renderHeader() {
  const h = document.getElementById('app-header');
  const t = i18n.t.bind(i18n);
  const c = countries.find(x => x.code === store.country);
  h.innerHTML = `
    <nav class="navbar">
      <a class="logo" href="#home" id="nav-logo">🌿 ${t('brand')}</a>
      <div class="nav-links" id="nav-links">
        <a href="#home" class="nav-link ${store.currentPage==='home'?'active':''}">${t('nav_home')}</a>
        <a href="#products" class="nav-link ${store.currentPage==='products'?'active':''}">${t('nav_products')}</a>
        <a href="#cart" class="nav-link ${store.currentPage==='cart'?'active':''}">${t('nav_cart')}</a>
        <a href="#tracking" class="nav-link ${store.currentPage==='tracking'?'active':''}">${t('nav_track')}</a>
      </div>
      <div class="nav-actions">
        <select class="country-select" id="country-select" aria-label="${t('country_label')}">
          ${countries.map(co => `<option value="${co.code}" ${co.code===store.country?'selected':''}>${co.flag}  ${co.name} (${co.currency})</option>`).join('')}
        </select>
        <a href="#cart" class="cart-icon-btn" id="cart-icon-btn" aria-label="${t('nav_cart')}">
          🛒 <span class="cart-badge" id="cart-badge" style="display:${store.getCartCount()>0?'flex':'none'}">${store.getCartCount()}</span>
        </a>
        <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menu">☰</button>
      </div>
    </nav>`;
  document.getElementById('country-select').addEventListener('change', e => store.setCountry(e.target.value));
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
  });
}

// ─── HOME PAGE ───
function renderHome(el) {
  const t = i18n.t.bind(i18n);
  const featured = productService.getAll().filter(p => p.badge === 'bestseller').slice(0, 4);
  el.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">${t('hero_title').replace('\n','<br>')}</h1>
        <p class="hero-sub">${t('hero_sub')}</p>
        <div class="hero-actions">
          <a href="#products" class="btn btn-primary btn-lg">${t('hero_cta')}</a>
          <a href="#products" class="btn btn-outline btn-lg">${t('hero_cta2')}</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-image-wrapper">
          <img src="images/hero_no_text.png" alt="Naturist Wellness">
        </div>
        <div class="hero-badge">
          <div class="hero-badge-icon">✨</div>
          <div class="hero-badge-text">
            100% Natural
            <span>Quality Guaranteed</span>
          </div>
        </div>
      </div>
    </section>
    <section class="trust-bar">
      <div class="trust-item"><div class="trust-icon">🌱</div>${t('trust_organic')}</div>
      <div class="trust-item"><div class="trust-icon">🚚</div>${t('trust_shipping')}</div>
      <div class="trust-item"><div class="trust-icon">💬</div>${t('trust_support')}</div>
      <div class="trust-item"><div class="trust-icon">↩️</div>${t('trust_returns')}</div>
    </section>
    <section class="section">
      <div class="section-header"><h2>${t('featured')}</h2><a href="#products" class="link">${t('view_all')} →</a></div>
      <div class="product-grid">${featured.map(p => productCard(p)).join('')}</div>
    </section>
    <section class="newsletter-section">
      <h2>${t('newsletter')}</h2>
      <form class="newsletter-form" onsubmit="event.preventDefault()">
        <input type="email" placeholder="${t('field_email')}" class="input" required>
        <button type="submit" class="btn btn-primary">${t('subscribe')}</button>
      </form>
    </section>`;
  bindProductCards(el);
}

// ─── PRODUCTS PAGE ───
function renderProducts(el) {
  const t = i18n.t.bind(i18n);
  const cats = ['all','superfoods','supplements','teas','oils','grains','care'];
  const catKeys = ['cat_all','cat_superfoods','cat_supplements','cat_teas','cat_oils','cat_grains','cat_care'];
  let items = store.searchQuery
    ? productService.search(store.searchQuery, store.locale)
    : productService.getByCategory(store.categoryFilter);

  el.innerHTML = `
    <section class="section page-section">
      <h1 class="page-title">${t('nav_products')}</h1>
      <div class="search-bar">
        <input type="text" class="input search-input" id="search-input" placeholder="${t('search')}" value="${store.searchQuery}">
      </div>
      <div class="category-tabs">
        ${cats.map((c, i) => `<button class="cat-tab ${store.categoryFilter===c?'active':''}" data-cat="${c}">${t(catKeys[i])}</button>`).join('')}
      </div>
      <div class="product-grid">${items.length ? items.map(p => productCard(p)).join('') : `<p class="empty-state">${t('cart_empty')}</p>`}</div>
    </section>`;
  el.querySelectorAll('.cat-tab').forEach(btn => btn.addEventListener('click', () => {
    store.categoryFilter = btn.dataset.cat; store.searchQuery = ''; renderApp();
  }));
  document.getElementById('search-input')?.addEventListener('input', debounce(e => {
    store.searchQuery = e.target.value; store.categoryFilter = 'all'; renderProducts(el); bindProductCards(el);
  }, 300));
  bindProductCards(el);
}

// ─── CART PAGE ───
function renderCart(el) {
  const t = i18n.t.bind(i18n);
  if (!store.cart.length) {
    el.innerHTML = `<section class="section page-section cart-empty-state"><h1>${t('cart_title')}</h1><p class="empty-icon">🛒</p><p>${t('cart_empty')}</p><a href="#products" class="btn btn-primary">${t('cart_continue')}</a></section>`;
    return;
  }
  el.innerHTML = `
    <section class="section page-section">
      <h1 class="page-title">${t('cart_title')}</h1>
      <div class="cart-layout">
        <div class="cart-items">
          ${store.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
              <div class="cart-item-image"><img src="${item.image}" alt="${item.name[store.locale]}"></div>
              <div class="cart-item-info">
                <h3>${item.name[store.locale]}</h3>
                <p class="cart-item-price">${i18n.formatCurrency(item.price, store.currency)}</p>
              </div>
              <div class="cart-item-qty">
                <button class="qty-btn minus" data-id="${item.id}">−</button>
                <span>${item.qty}</span>
                <button class="qty-btn plus" data-id="${item.id}">+</button>
              </div>
              <div class="cart-item-total">${i18n.formatCurrency(item.price * item.qty, store.currency)}</div>
              <button class="remove-btn" data-id="${item.id}">✕</button>
            </div>`).join('')}
        </div>
        <div class="cart-summary">
          <h3>${t('cart_subtotal')}</h3>
          <p class="cart-total-amount">${i18n.formatCurrency(store.getCartTotal(), store.currency)}</p>
          <a href="#checkout" class="btn btn-primary btn-lg btn-block">${t('cart_checkout')}</a>
          <a href="#products" class="btn btn-outline btn-block">${t('cart_continue')}</a>
        </div>
      </div>
    </section>`;
  el.querySelectorAll('.qty-btn.minus').forEach(b => b.addEventListener('click', () => { const item = store.cart.find(i => i.id === b.dataset.id); if (item) store.updateQty(b.dataset.id, item.qty - 1); }));
  el.querySelectorAll('.qty-btn.plus').forEach(b => b.addEventListener('click', () => { const item = store.cart.find(i => i.id === b.dataset.id); if (item) store.updateQty(b.dataset.id, item.qty + 1); }));
  el.querySelectorAll('.remove-btn').forEach(b => b.addEventListener('click', () => store.removeFromCart(b.dataset.id)));
}

// ─── CHECKOUT PAGE ───
function renderCheckout(el) {
  const t = i18n.t.bind(i18n);
  const c = countries.find(x => x.code === store.country);
  if (!store.cart.length) { navigate('cart'); return; }

  el.innerHTML = `
    <section class="section page-section">
      <h1 class="page-title">${t('checkout_title')}</h1>
      <div class="checkout-steps">
        <div class="step active" id="step-1-indicator"><span>1</span>${t('step_shipping')}</div>
        <div class="step-line"></div>
        <div class="step" id="step-2-indicator"><span>2</span>${t('step_payment')}</div>
        <div class="step-line"></div>
        <div class="step" id="step-3-indicator"><span>3</span>${t('step_confirm')}</div>
      </div>
      <div class="checkout-body">
        <div class="checkout-form" id="checkout-step-content"></div>
        <div class="cart-summary">
          <h3>${t('cart_total')}</h3>
          <p class="cart-total-amount">${i18n.formatCurrency(store.getCartTotal(), store.currency)}</p>
          <div class="cart-summary-items">${store.cart.map(item => `<div class="summary-line"><span class="summary-line-item"><img src="${item.image}" class="summary-thumb" alt=""> ${item.name[store.locale]} x${item.qty}</span><span>${i18n.formatCurrency(item.price * item.qty, store.currency)}</span></div>`).join('')}</div>
        </div>
      </div>
    </section>`;
  renderCheckoutStep(1, c);
}

function renderCheckoutStep(step, countryObj) {
  const t = i18n.t.bind(i18n);
  const content = document.getElementById('checkout-step-content');
  if (!content) return;
  document.querySelectorAll('.checkout-steps .step').forEach((s, i) => { s.classList.toggle('active', i < step); s.classList.toggle('current', i === step - 1); });

  if (step === 1) {
    content.innerHTML = `
      <h2>${t('step_shipping')}</h2>
      <div class="form-grid">
        <div class="form-group"><label>${t('field_name')}</label><input class="input" id="ship-name" required></div>
        <div class="form-group"><label>${t('field_email')}</label><input class="input" id="ship-email" type="email" required></div>
        <div class="form-group"><label>${t('field_address')}</label><input class="input" id="ship-address" required></div>
        <div class="form-group"><label>${t('field_city')}</label><input class="input" id="ship-city" required></div>
        <div class="form-group"><label>${t('field_phone')}</label><input class="input" id="ship-phone" required></div>
      </div>
      <button class="btn btn-primary btn-lg" id="to-step-2">${t('next')} →</button>`;
    document.getElementById('to-step-2').addEventListener('click', () => {
      const fields = ['ship-name','ship-email','ship-address','ship-city','ship-phone'];
      if (fields.some(f => !document.getElementById(f).value.trim())) { showToast('Please fill all fields', 'error'); return; }
      store._shipping = { name: document.getElementById('ship-name').value, email: document.getElementById('ship-email').value, address: document.getElementById('ship-address').value, city: document.getElementById('ship-city').value, phone: document.getElementById('ship-phone').value };
      renderCheckoutStep(2, countryObj);
    });
  } else if (step === 2) {
    const { paymentIcons, paymentNames } = await_import();
    content.innerHTML = `
      <h2>${t('pay_method')}</h2>
      <div class="payment-methods">
        ${countryObj.payments.map(pm => `<label class="payment-option"><input type="radio" name="pay" value="${pm}"><span class="payment-card">${paymentIcons[pm]} ${paymentNames[pm]}</span></label>`).join('')}
      </div>
      <div class="step-actions">
        <button class="btn btn-outline" id="back-step-1">← ${t('back')}</button>
        <button class="btn btn-primary btn-lg" id="to-step-3">${t('next')} →</button>
      </div>`;
    document.getElementById('back-step-1').addEventListener('click', () => renderCheckoutStep(1, countryObj));
    document.getElementById('to-step-3').addEventListener('click', () => {
      const selected = content.querySelector('input[name="pay"]:checked');
      if (!selected) { showToast(t('pay_error'), 'error'); return; }
      store._payMethod = selected.value;
      renderCheckoutStep(3, countryObj);
    });
  } else if (step === 3) {
    content.innerHTML = `
      <h2>${t('order_confirm')}</h2>
      <div class="confirm-details">
        <p><strong>${t('field_name')}:</strong> ${store._shipping.name}</p>
        <p><strong>${t('field_email')}:</strong> ${store._shipping.email}</p>
        <p><strong>${t('field_address')}:</strong> ${store._shipping.address}, ${store._shipping.city}</p>
        <p><strong>${t('pay_method')}:</strong> ${store._payMethod}</p>
        <p><strong>${t('cart_total')}:</strong> ${i18n.formatCurrency(store.getCartTotal(), store.currency)}</p>
      </div>
      <div class="saga-log" id="saga-log" style="display:none"></div>
      <div class="step-actions">
        <button class="btn btn-outline" id="back-step-2">← ${t('back')}</button>
        <button class="btn btn-primary btn-lg btn-cta" id="place-order">🛒 ${t('order_place')}</button>
      </div>`;
    document.getElementById('back-step-2').addEventListener('click', () => renderCheckoutStep(2, countryObj));
    document.getElementById('place-order').addEventListener('click', async () => {
      const btn = document.getElementById('place-order');
      btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> ${t('pay_processing')}`;
      const sagaLog = document.getElementById('saga-log');
      sagaLog.style.display = 'block'; sagaLog.innerHTML = '';
      const logStep = (msg, status) => { sagaLog.innerHTML += `<div class="saga-step ${status}"><span class="saga-icon">${status === 'done' ? '✓' : status === 'error' ? '✗' : '⟳'}</span> ${msg}</div>`; };

      eventBus.on('saga:step', d => logStep(d.step.replace(/_/g, ' '), d.status));
      eventBus.on('saga:rollback_start', () => logStep(t('saga_rollback'), 'error'));
      eventBus.on('saga:rollback_complete', () => logStep(t('saga_complete'), 'error'));

      const result = await sagaOrchestrator.processOrder(
        store.cart, store._shipping,
        { method: store._payMethod, amount: store.getCartTotal(), currency: store.currency },
        store.country, store.currency
      );

      if (result.success) {
        showToast(t('pay_success'), 'success');
        store.currentOrder = result.order;
        store.orders.push(result.order);
        store.clearCart();
        setTimeout(() => navigate('tracking'), 1500);
      } else {
        showToast(t('pay_error') + ' — ' + t('saga_rollback'), 'error');
        btn.disabled = false; btn.innerHTML = `🛒 ${t('order_place')}`;
      }
    });
  }
}

function await_import() {
  // Inline to avoid async import complexity
  return {
    paymentIcons: { PSE:'🏦', Nequi:'📱', PIX:'⚡', card:'💳', paypal:'🅿️', sepa:'🏛️' },
    paymentNames: { PSE:'PSE', Nequi:'Nequi', PIX:'PIX', card:'Credit/Debit Card', paypal:'PayPal', sepa:'SEPA' }
  };
}

// ─── TRACKING PAGE ───
function renderTracking(el) {
  const t = i18n.t.bind(i18n);
  const ORDER_STATES_KEYS = ['status_created','status_processing','status_preparing','status_shipped','status_transit','status_delivered'];
  const order = store.currentOrder || (store.orders.length ? store.orders[store.orders.length - 1] : null);

  if (!order) {
    el.innerHTML = `
      <section class="section page-section">
        <h1 class="page-title">${t('track_title')}</h1>
        <div class="track-search">
          <input class="input" id="track-input" placeholder="${t('track_id')}">
          <button class="btn btn-primary" id="track-btn">${t('track_search')}</button>
        </div>
        <p class="empty-state">${t('track_no')}</p>
      </section>`;
    document.getElementById('track-btn')?.addEventListener('click', () => {
      const id = document.getElementById('track-input').value.trim();
      const found = orderService.getById(id);
      if (found) { store.currentOrder = found; renderTracking(el); }
      else showToast('Order not found', 'error');
    });
    return;
  }

  el.innerHTML = `
    <section class="section page-section">
      <h1 class="page-title">${t('track_title')}</h1>
      <div class="order-card">
        <div class="order-header">
          <h2>${order.id}</h2>
          <span class="order-status-badge">${t(ORDER_STATES_KEYS[order.statusIndex])}</span>
        </div>
        <div class="timeline">
          ${ORDER_STATES_KEYS.map((sk, i) => `
            <div class="timeline-step ${i <= order.statusIndex ? 'completed' : ''} ${i === order.statusIndex ? 'current' : ''}">
              <div class="timeline-dot"></div>
              <div class="timeline-label">${t(sk)}</div>
            </div>`).join('')}
        </div>
        <div class="order-items">
          ${order.items.map(item => `<div class="order-item"><span class="order-item-name"><img src="${item.image}" class="summary-thumb" alt=""> ${item.name[store.locale]} x${item.qty}</span><span>${i18n.formatCurrency(item.price * item.qty, store.currency)}</span></div>`).join('')}
          <div class="order-item total"><strong>${t('cart_total')}</strong><strong>${i18n.formatCurrency(order.total, store.currency)}</strong></div>
        </div>
      </div>
    </section>`;

  // Live update
  const unsub = eventBus.on('order:status_updated', (o) => {
    if (o.id === order.id && store.currentPage === 'tracking') { store.currentOrder = o; renderTracking(el); }
  });
}

// ─── Product Card Component ───
function productCard(p) {
  const t = i18n.t.bind(i18n);
  const badgeHtml = p.badge ? `<span class="badge badge-${p.badge}">${t('badge_' + p.badge)}</span>` : '';
  const stockHtml = p.stock <= 5 && p.stock > 0 ? `<span class="stock-warning">🔥 ${t('stock_low')} (${p.stock})</span>` : p.stock === 0 ? `<span class="stock-out">${t('stock_out')}</span>` : '';
  const socialProof = Math.floor(Math.random() * 20) + 5;
  return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name[store.locale]}">
        ${badgeHtml}
      </div>
      <div class="product-info">
        <h3 class="product-name">${p.name[store.locale]}</h3>
        <p class="product-desc">${p.desc[store.locale]}</p>
        <div class="product-rating">
          ${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}
          <span class="rating-count">(${p.reviews} ${t('reviews_label')})</span>
        </div>
        ${stockHtml}
        <p class="social-proof">👥 ${socialProof} ${t('social_proof')}</p>
        <div class="product-footer">
          <span class="product-price">${i18n.formatCurrency(p.prices[store.currency], store.currency)}</span>
          <button class="btn btn-primary btn-add-cart" data-id="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>${t('add_cart')}</button>
        </div>
      </div>
    </div>`;
}

function bindProductCards(container) {
  container.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      store.addToCart(id);
      btn.textContent = i18n.t('added');
      btn.classList.add('btn-success');
      setTimeout(() => { btn.textContent = i18n.t('add_cart'); btn.classList.remove('btn-success'); }, 1200);
    });
  });
}

// ─── Utility ───
function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }

// ─── Footer ───
function renderFooter() {
  const t = i18n.t.bind(i18n);
  document.getElementById('app-footer').innerHTML = `
    <div class="footer-content">
      <div class="footer-brand"><span class="logo">🌿 ${t('brand')}</span><p>${t('tagline')}</p></div>
      <div class="footer-links">
        <a href="#">${t('footer_about')}</a><a href="#">${t('footer_contact')}</a><a href="#">${t('footer_privacy')}</a>
      </div>
      <p class="footer-copy">© 2026 GreenCart. ${t('footer_rights')}.</p>
    </div>`;
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.hash.slice(1) || 'home';
  store.currentPage = page;
  // Loader
  setTimeout(() => {
    document.getElementById('app-loader').classList.add('hidden');
    renderApp();
    renderFooter();
  }, 800);
});

window.navigate = navigate;
