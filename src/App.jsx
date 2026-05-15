import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { countries, paymentIcons, paymentNames } from './storeData.js';
import { eventBus } from './eventBus.js';
import { i18n } from './i18n.js';
import { getProductPrice } from './pricing.js';
import { orderService, productService, sagaOrchestrator, STATUS_KEYS } from './services.js';

const CATEGORY_KEYS = [
  ['all', 'cat_all'],
  ['superfoods', 'cat_superfoods'],
  ['supplements', 'cat_supplements'],
  ['teas', 'cat_teas'],
  ['oils', 'cat_oils'],
  ['grains', 'cat_grains'],
  ['care', 'cat_care']
];

const VALID_PAGES = new Set(['home', 'products', 'cart', 'checkout', 'tracking']);

function getPageFromHash() {
  const page = window.location.hash.replace('#', '') || 'home';
  return VALID_PAGES.has(page) ? page : 'home';
}

function getCountry(code) {
  return countries.find((country) => country.code === code) || countries[0];
}

function getSocialProof(productId) {
  const base = productId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 5 + (base % 20);
}

function buildSagaMessage(locale, step, status) {
  const t = (key) => i18n.t(locale, key);
  const labels = {
    reserve_stock: t('saga_stock'),
    validate_payment: t('pay_method'),
    process_payment: t('pay_processing'),
    create_order: t('order_confirm')
  };

  if (status === 'error') {
    return t('saga_rollback');
  }

  return labels[step] || step.replace(/_/g, ' ');
}

function formatPrice(locale, amount, currency) {
  return i18n.formatCurrency(locale, amount, currency);
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(getPageFromHash());
  const [countryCode, setCountryCode] = useState('CO');
  const [cart, setCart] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [, setOrderVersion] = useState(0);
  const [toasts, setToasts] = useState([]);

  const country = getCountry(countryCode);
  const locale = country.locale;
  const currency = country.currency;
  const t = (key) => i18n.t(locale, key);

  useEffect(() => {
    const loaderTimer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(loaderTimer);
  }, []);

  useEffect(() => {
    const syncPage = () => setCurrentPage(getPageFromHash());
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  useEffect(() => {
    const unsubscribers = [
      eventBus.on('order:created', () => setOrderVersion((value) => value + 1)),
      eventBus.on('order:status_updated', () => setOrderVersion((value) => value + 1))
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const filteredProducts = deferredSearchQuery.trim()
    ? productService.search(deferredSearchQuery, locale)
    : productService.getByCategory(categoryFilter);

  const featuredProducts = productService
    .getAll()
    .filter((product) => product.badge === 'bestseller')
    .slice(0, 4);

  const cartItems = cart
    .map((entry) => {
      const product = productService.getById(entry.id);
      if (!product) {
        return null;
      }

      return {
        ...product,
        qty: Math.min(entry.qty, product.stock),
        price: getProductPrice(product, currency)
      };
    })
    .filter(Boolean);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const currentOrder = currentOrderId
    ? orderService.getById(currentOrderId)
    : orderService.getAll().at(-1) || null;

  function navigate(page) {
    const nextPage = VALID_PAGES.has(page) ? page : 'home';
    setCurrentPage(nextPage);
    window.location.hash = nextPage;
  }

  function showToast(message, type = 'info') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  }

  function addToCart(productId, quantity = 1) {
    const product = productService.getById(productId);
    if (!product || product.stock <= 0) {
      showToast(t('stock_out'), 'error');
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === productId);
      if (!existing) {
        return [...currentCart, { id: productId, qty: Math.min(quantity, product.stock) }];
      }

      const nextQuantity = Math.min(existing.qty + quantity, product.stock);
      if (nextQuantity === existing.qty) {
        showToast(`${t('stock_low')} (${product.stock})`, 'error');
        return currentCart;
      }

      return currentCart.map((item) =>
        item.id === productId ? { ...item, qty: nextQuantity } : item
      );
    });

    showToast(t('added'), 'success');
  }

  function removeFromCart(productId) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  }

  function updateQty(productId, quantity) {
    const product = productService.getById(productId);
    if (!product) {
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId
          ? { ...item, qty: Math.max(1, Math.min(quantity, product.stock)) }
          : item
      )
    );
  }

  function handleCountryChange(nextCode) {
    const nextCountry = getCountry(nextCode);
    setCountryCode(nextCountry.code);
  }

  function handleOrderPlaced(order) {
    setCurrentOrderId(order.id);
    setCart([]);
    showToast(t('pay_success'), 'success');
    navigate('tracking');
  }

  function handleTrackSearch(orderId) {
    const found = orderService.getById(orderId.trim());
    if (!found) {
      showToast('Order not found', 'error');
      return;
    }

    setCurrentOrderId(found.id);
  }

  return (
    <>
      <div className={`app-loader ${isLoading ? '' : 'hidden'}`}>
        <div className="loader-spinner"></div>
        <p className="loader-text">GreenCart</p>
      </div>

      <ToastContainer toasts={toasts} />

      <header className="app-header">
        <Header
          t={t}
          countryCode={countryCode}
          cartCount={cartCount}
          currentPage={currentPage}
          menuOpen={menuOpen}
          onCountryChange={handleCountryChange}
          onNavigate={navigate}
          onToggleMenu={() => setMenuOpen((open) => !open)}
        />
      </header>

      <main id="main-content">
        {currentPage === 'home' && (
          <HomePage
            t={t}
            locale={locale}
            currency={currency}
            featuredProducts={featuredProducts}
            onAddToCart={addToCart}
            onNavigate={navigate}
          />
        )}

        {currentPage === 'products' && (
          <ProductsPage
            t={t}
            locale={locale}
            currency={currency}
            products={filteredProducts}
            categoryFilter={categoryFilter}
            searchQuery={searchQuery}
            onCategoryChange={(category) => {
              setCategoryFilter(category);
              setSearchQuery('');
            }}
            onSearchChange={(value) => {
              setSearchQuery(value);
              if (value.trim()) {
                setCategoryFilter('all');
              }
            }}
            onAddToCart={addToCart}
          />
        )}

        {currentPage === 'cart' && (
          <CartPage
            t={t}
            locale={locale}
            currency={currency}
            items={cartItems}
            total={cartTotal}
            onNavigate={navigate}
            onRemove={removeFromCart}
            onUpdateQty={updateQty}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            t={t}
            locale={locale}
            country={country}
            currency={currency}
            items={cartItems}
            total={cartTotal}
            onNavigate={navigate}
            onOrderPlaced={handleOrderPlaced}
            onToast={showToast}
          />
        )}

        {currentPage === 'tracking' && (
          <TrackingPage
            t={t}
            locale={locale}
            order={currentOrder}
            onTrackSearch={handleTrackSearch}
          />
        )}
      </main>

      <footer className="app-footer">
        <Footer t={t} />
      </footer>
    </>
  );
}

function Header({
  t,
  countryCode,
  cartCount,
  currentPage,
  menuOpen,
  onCountryChange,
  onNavigate,
  onToggleMenu
}) {
  const navItems = [
    ['home', t('nav_home')],
    ['products', t('nav_products')],
    ['cart', t('nav_cart')],
    ['tracking', t('nav_track')]
  ];

  return (
    <nav className="navbar">
      <a
        className="logo"
        href="#home"
        onClick={(event) => {
          event.preventDefault();
          onNavigate('home');
        }}
      >
        <span aria-hidden="true">🌿</span>
        <span>{t('brand')}</span>
      </a>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {navItems.map(([page, label]) => (
          <a
            key={page}
            href={`#${page}`}
            className={`nav-link ${currentPage === page ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(page);
            }}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="nav-actions">
        <select
          className="country-select"
          value={countryCode}
          aria-label={t('country_label')}
          onChange={(event) => onCountryChange(event.target.value)}
        >
          {countries.map((item) => (
            <option key={item.code} value={item.code}>
              {item.flag} {item.name} ({item.currency})
            </option>
          ))}
        </select>

        <a
          href="#cart"
          className="cart-icon-btn"
          aria-label={t('nav_cart')}
          onClick={(event) => {
            event.preventDefault();
            onNavigate('cart');
          }}
        >
          <span aria-hidden="true">🛒</span>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </a>

        <button className="mobile-menu-btn" type="button" aria-label="Menu" onClick={onToggleMenu}>
          ☰
        </button>
      </div>
    </nav>
  );
}

function HomePage({ t, locale, currency, featuredProducts, onAddToCart, onNavigate }) {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            {t('hero_title').split('\n').map((line, index) => (
              <span key={`${line}-${index}`}>
                {line}
                {index === 0 ? <br /> : null}
              </span>
            ))}
          </h1>
          <p className="hero-sub">{t('hero_sub')}</p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" type="button" onClick={() => onNavigate('products')}>
              {t('hero_cta')}
            </button>
            <button className="btn btn-outline btn-lg" type="button" onClick={() => onNavigate('products')}>
              {t('hero_cta2')}
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <img src="/images/hero_no_text.png" alt="Naturist Wellness" />
          </div>
          <div className="hero-badge">
            <div className="hero-badge-icon">✨</div>
            <div className="hero-badge-text">
              100% Natural
              <span>Quality Guaranteed</span>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-bar">
        <div className="trust-item">
          <div className="trust-icon">🌱</div>
          {t('trust_organic')}
        </div>
        <div className="trust-item">
          <div className="trust-icon">🚚</div>
          {t('trust_shipping')}
        </div>
        <div className="trust-item">
          <div className="trust-icon">💬</div>
          {t('trust_support')}
        </div>
        <div className="trust-item">
          <div className="trust-icon">↩️</div>
          {t('trust_returns')}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>{t('featured')}</h2>
          <button className="link link-button" type="button" onClick={() => onNavigate('products')}>
            {t('view_all')} →
          </button>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              t={t}
              locale={locale}
              currency={currency}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>

      <section className="newsletter-section">
        <h2>{t('newsletter')}</h2>
        <form className="newsletter-form" onSubmit={(event) => event.preventDefault()}>
          <input type="email" placeholder={t('field_email')} className="input" required />
          <button type="submit" className="btn btn-primary">
            {t('subscribe')}
          </button>
        </form>
      </section>
    </>
  );
}

function ProductsPage({
  t,
  locale,
  currency,
  products,
  categoryFilter,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  onAddToCart
}) {
  return (
    <section className="section page-section">
      <h1 className="page-title">{t('nav_products')}</h1>

      <div className="search-bar">
        <input
          type="text"
          className="input search-input"
          placeholder={t('search')}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="category-tabs">
        {CATEGORY_KEYS.map(([category, labelKey]) => (
          <button
            key={category}
            type="button"
            className={`cat-tab ${categoryFilter === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {products.length ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              t={t}
              locale={locale}
              currency={currency}
              onAddToCart={onAddToCart}
            />
          ))
        ) : (
          <p className="empty-state">{t('cart_empty')}</p>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product, t, locale, currency, onAddToCart }) {
  const [didAdd, setDidAdd] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const lowStock = product.stock > 0 && product.stock <= 5;

  function handleAdd() {
    onAddToCart(product.id);
    setDidAdd(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setDidAdd(false);
    }, 1200);
  }

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name[locale]} />
        {product.badge ? <span className={`badge badge-${product.badge}`}>{t(`badge_${product.badge}`)}</span> : null}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name[locale]}</h3>
        <p className="product-desc">{product.desc[locale]}</p>

        <div className="product-rating">
          <span>{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}</span>
          <span className="rating-count">
            ({product.reviews} {t('reviews_label')})
          </span>
        </div>

        {lowStock ? <span className="stock-warning">🔥 {t('stock_low')} ({product.stock})</span> : null}
        {!lowStock && product.stock === 0 ? <span className="stock-out">{t('stock_out')}</span> : null}

        <p className="social-proof">
          👥 {getSocialProof(product.id)} {t('social_proof')}
        </p>

        <div className="product-footer">
          <span className="product-price">{formatPrice(locale, getProductPrice(product, currency), currency)}</span>
          <button
            type="button"
            className={`btn btn-primary btn-add-cart ${didAdd ? 'btn-success' : ''}`}
            disabled={product.stock === 0}
            onClick={handleAdd}
          >
            {didAdd ? t('added') : t('add_cart')}
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPage({ t, locale, currency, items, total, onNavigate, onRemove, onUpdateQty }) {
  if (!items.length) {
    return (
      <section className="section page-section cart-empty-state">
        <h1>{t('cart_title')}</h1>
        <p className="empty-icon">🛒</p>
        <p>{t('cart_empty')}</p>
        <button className="btn btn-primary" type="button" onClick={() => onNavigate('products')}>
          {t('cart_continue')}
        </button>
      </section>
    );
  }

  return (
    <section className="section page-section">
      <h1 className="page-title">{t('cart_title')}</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img src={item.image} alt={item.name[locale]} />
              </div>

              <div className="cart-item-info">
                <h3>{item.name[locale]}</h3>
                <p className="cart-item-price">{formatPrice(locale, item.price, currency)}</p>
              </div>

              <div className="cart-item-qty">
                <button type="button" className="qty-btn" onClick={() => onUpdateQty(item.id, item.qty - 1)}>
                  −
                </button>
                <span>{item.qty}</span>
                <button type="button" className="qty-btn" onClick={() => onUpdateQty(item.id, item.qty + 1)}>
                  +
                </button>
              </div>

              <div className="cart-item-total">{formatPrice(locale, item.price * item.qty, currency)}</div>

              <button type="button" className="remove-btn" onClick={() => onRemove(item.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>{t('cart_subtotal')}</h3>
          <p className="cart-total-amount">{formatPrice(locale, total, currency)}</p>
          <button className="btn btn-primary btn-lg btn-block" type="button" onClick={() => onNavigate('checkout')}>
            {t('cart_checkout')}
          </button>
          <button className="btn btn-outline btn-block" type="button" onClick={() => onNavigate('products')}>
            {t('cart_continue')}
          </button>
        </div>
      </div>
    </section>
  );
}

function CheckoutPage({ t, locale, country, currency, items, total, onNavigate, onOrderPlaced, onToast }) {
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    phone: ''
  });
  const [payMethod, setPayMethod] = useState('');
  const [processing, setProcessing] = useState(false);
  const [sagaLog, setSagaLog] = useState([]);

  useEffect(() => {
    if (!items.length) {
      onNavigate('cart');
    }
  }, [items.length, onNavigate]);

  if (!items.length) {
    return null;
  }

  function nextFromShipping() {
    if (Object.values(shipping).some((value) => !value.trim())) {
      onToast('Please fill all fields', 'error');
      return;
    }

    setStep(2);
  }

  async function placeOrder() {
    setProcessing(true);
    setSagaLog([]);

    const addSagaEntry = (message, status) => {
      setSagaLog((current) => [
        ...current,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, message, status }
      ]);
    };

    const unsubscribers = [
      eventBus.on('saga:step', ({ step: eventStep, status }) => {
        addSagaEntry(buildSagaMessage(locale, eventStep, status), status);
      }),
      eventBus.on('saga:rollback_start', () => addSagaEntry(t('saga_rollback'), 'error')),
      eventBus.on('saga:rollback_complete', () => addSagaEntry(t('saga_complete'), 'error'))
    ];

    try {
      const result = await sagaOrchestrator.processOrder(
        items.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty
        })),
        shipping,
        { method: payMethod, amount: total, currency },
        country.code,
        currency
      );

      if (result.success) {
        onOrderPlaced(result.order);
        return;
      }

      onToast(`${t('pay_error')} - ${t('saga_rollback')}`, 'error');
      setProcessing(false);
    } finally {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    }
  }

  return (
    <section className="section page-section">
      <h1 className="page-title">{t('checkout_title')}</h1>

      <div className="checkout-steps">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}>
          <span>1</span>
          {t('step_shipping')}
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}>
          <span>2</span>
          {t('step_payment')}
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''}`}>
          <span>3</span>
          {t('step_confirm')}
        </div>
      </div>

      <div className="checkout-body">
        <div className="checkout-form">
          {step === 1 && (
            <>
              <h2>{t('step_shipping')}</h2>
              <div className="form-grid">
                <FormField label={t('field_name')} value={shipping.name} onChange={(value) => setShipping({ ...shipping, name: value })} />
                <FormField label={t('field_email')} type="email" value={shipping.email} onChange={(value) => setShipping({ ...shipping, email: value })} />
                <FormField label={t('field_address')} value={shipping.address} onChange={(value) => setShipping({ ...shipping, address: value })} />
                <FormField label={t('field_city')} value={shipping.city} onChange={(value) => setShipping({ ...shipping, city: value })} />
                <FormField label={t('field_phone')} value={shipping.phone} onChange={(value) => setShipping({ ...shipping, phone: value })} />
              </div>
              <button className="btn btn-primary btn-lg" type="button" onClick={nextFromShipping}>
                {t('next')} →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2>{t('pay_method')}</h2>
              <div className="payment-methods">
                {country.payments.map((method) => (
                  <label key={method} className="payment-option">
                    <input
                      type="radio"
                      name="pay"
                      value={method}
                      checked={payMethod === method}
                      onChange={(event) => setPayMethod(event.target.value)}
                    />
                    <span className="payment-card">
                      {paymentIcons[method]} {paymentNames[method]}
                    </span>
                  </label>
                ))}
              </div>

              <div className="step-actions">
                <button className="btn btn-outline" type="button" onClick={() => setStep(1)}>
                  ← {t('back')}
                </button>
                <button
                  className="btn btn-primary btn-lg"
                  type="button"
                  onClick={() => {
                    if (!payMethod) {
                      onToast(t('pay_error'), 'error');
                      return;
                    }
                    setStep(3);
                  }}
                >
                  {t('next')} →
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2>{t('order_confirm')}</h2>
              <div className="confirm-details">
                <p>
                  <strong>{t('field_name')}:</strong> {shipping.name}
                </p>
                <p>
                  <strong>{t('field_email')}:</strong> {shipping.email}
                </p>
                <p>
                  <strong>{t('field_address')}:</strong> {shipping.address}, {shipping.city}
                </p>
                <p>
                  <strong>{t('pay_method')}:</strong> {payMethod}
                </p>
                <p>
                  <strong>{t('cart_total')}:</strong> {formatPrice(locale, total, currency)}
                </p>
              </div>

              {sagaLog.length > 0 ? (
                <div className="saga-log">
                  {sagaLog.map((entry) => (
                    <div key={entry.id} className={`saga-step ${entry.status}`}>
                      <span className="saga-icon">
                        {entry.status === 'done' ? '✓' : entry.status === 'error' ? '✕' : '⟳'}
                      </span>
                      {entry.message}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="step-actions">
                <button className="btn btn-outline" type="button" onClick={() => setStep(2)} disabled={processing}>
                  ← {t('back')}
                </button>
                <button className="btn btn-primary btn-lg btn-cta" type="button" onClick={placeOrder} disabled={processing}>
                  {processing ? (
                    <>
                      <span className="spinner"></span>
                      {t('pay_processing')}
                    </>
                  ) : (
                    <>🛒 {t('order_place')}</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="cart-summary">
          <h3>{t('cart_total')}</h3>
          <p className="cart-total-amount">{formatPrice(locale, total, currency)}</p>
          <div className="cart-summary-items">
            {items.map((item) => (
              <div key={item.id} className="summary-line">
                <span className="summary-line-item">
                  <img src={item.image} className="summary-thumb" alt="" />
                  {item.name[locale]} x{item.qty}
                </span>
                <span>{formatPrice(locale, item.price * item.qty, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FormField({ label, type = 'text', value, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input className="input" type={type} value={value} onChange={(event) => onChange(event.target.value)} required />
    </div>
  );
}

function TrackingPage({ t, locale, order, onTrackSearch }) {
  const [query, setQuery] = useState('');
  const orderLocale = order ? getCountry(order.country).locale : locale;

  if (!order) {
    return (
      <section className="section page-section">
        <h1 className="page-title">{t('track_title')}</h1>
        <div className="track-search">
          <input
            className="input"
            value={query}
            placeholder={t('track_id')}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="btn btn-primary" type="button" onClick={() => onTrackSearch(query)}>
            {t('track_search')}
          </button>
        </div>
        <p className="empty-state">{t('track_no')}</p>
      </section>
    );
  }

  return (
    <section className="section page-section">
      <h1 className="page-title">{t('track_title')}</h1>
      <div className="order-card">
        <div className="order-header">
          <h2>{order.id}</h2>
          <span className="order-status-badge">{t(STATUS_KEYS[order.statusIndex])}</span>
        </div>

        <div className="timeline">
          {STATUS_KEYS.map((statusKey, index) => (
            <div
              key={statusKey}
              className={`timeline-step ${index <= order.statusIndex ? 'completed' : ''} ${index === order.statusIndex ? 'current' : ''}`}
            >
              <div className="timeline-dot"></div>
              <div className="timeline-label">{t(statusKey)}</div>
            </div>
          ))}
        </div>

        <div className="order-items">
          {order.items.map((item) => (
            <div key={item.id} className="order-item">
              <span className="order-item-name">
                <img src={item.image} className="summary-thumb" alt="" />
                {item.name[orderLocale]} x{item.qty}
              </span>
              <span>{formatPrice(orderLocale, item.price * item.qty, order.currency)}</span>
            </div>
          ))}
          <div className="order-item total">
            <strong>{t('cart_total')}</strong>
            <strong>{formatPrice(orderLocale, order.total, order.currency)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type} show`}>
          <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'i'}</span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function Footer({ t }) {
  return (
    <div className="footer-content">
      <div className="footer-brand">
        <span className="logo">
          <span aria-hidden="true">🌿</span>
          <span>{t('brand')}</span>
        </span>
        <p>{t('tagline')}</p>
      </div>
      <div className="footer-links">
        <a href="#">{t('footer_about')}</a>
        <a href="#">{t('footer_contact')}</a>
        <a href="#">{t('footer_privacy')}</a>
      </div>
      <p className="footer-copy">© 2026 GreenCart. {t('footer_rights')}.</p>
    </div>
  );
}
