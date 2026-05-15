import { useMemo, useState } from 'react';

const INITIAL_LOGIN_FORM = {
  email: '',
  password: ''
};

const INITIAL_REGISTER_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};

export default function AuthPage({
  t,
  user,
  mode,
  redirectPage,
  onModeChange,
  onLogin,
  onRegister,
  onNavigate
}) {
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM);
  const [registerForm, setRegisterForm] = useState(INITIAL_REGISTER_FORM);

  const targetLabel = useMemo(() => {
    if (redirectPage === 'checkout') {
      return t('cart_checkout');
    }

    if (redirectPage === 'cart') {
      return t('nav_cart');
    }

    return t('nav_products');
  }, [redirectPage, t]);

  if (user) {
    return (
      <section className="section page-section auth-shell">
        <div className="auth-card auth-card-single">
          <div className="auth-panel auth-panel-centered">
            <p className="auth-kicker">{t('brand')}</p>
            <h1 className="page-title auth-title">{t('auth_logged_in')}</h1>
            <p className="auth-copy">
              {t('auth_logged_as')} <strong>{user.name}</strong> ({user.email})
            </p>
            <div className="auth-actions">
              <button className="btn btn-primary btn-lg" type="button" onClick={() => onNavigate('products')}>
                {t('auth_continue')}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => onNavigate('home')}>
                {t('nav_home')}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section page-section auth-shell">
      <div className="auth-card">
        <div className="auth-side">
          <p className="auth-kicker">{t('brand')}</p>
          <h1 className="page-title auth-title">{t('auth_title')}</h1>
          <p className="auth-copy">{t('auth_subtitle')}</p>
          <p className="auth-target">
            {t('auth_access_to')} <strong>{targetLabel}</strong>
          </p>
          <div className="auth-benefits">
            <div className="auth-benefit">{t('auth_benefit_catalog')}</div>
            <div className="auth-benefit">{t('auth_benefit_checkout')}</div>
            <div className="auth-benefit">{t('auth_benefit_tracking')}</div>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-tabs" role="tablist" aria-label={t('auth_tabs')}>
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => onModeChange('login')}
            >
              {t('nav_login')}
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => onModeChange('register')}
            >
              {t('nav_register')}
            </button>
          </div>

          {mode === 'login' ? (
            <form
              className="auth-form"
              onSubmit={(event) => {
                event.preventDefault();
                onLogin(loginForm);
              }}
            >
              <div className="form-group">
                <label>{t('field_email')}</label>
                <input
                  className="input"
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('auth_password')}</label>
                <input
                  className="input"
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  required
                />
              </div>

              <button className="btn btn-primary btn-lg btn-block" type="submit">
                {t('auth_login_cta')}
              </button>

              <p className="auth-switch">
                {t('auth_no_account')}{' '}
                <button type="button" className="auth-inline-btn" onClick={() => onModeChange('register')}>
                  {t('nav_register')}
                </button>
              </p>
            </form>
          ) : (
            <form
              className="auth-form"
              onSubmit={(event) => {
                event.preventDefault();
                onRegister(registerForm);
              }}
            >
              <div className="form-group">
                <label>{t('field_name')}</label>
                <input
                  className="input"
                  type="text"
                  value={registerForm.name}
                  onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('field_email')}</label>
                <input
                  className="input"
                  type="email"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('auth_password')}</label>
                <input
                  className="input"
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('auth_confirm_password')}</label>
                <input
                  className="input"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, confirmPassword: event.target.value })
                  }
                  required
                />
              </div>

              <button className="btn btn-primary btn-lg btn-block" type="submit">
                {t('auth_register_cta')}
              </button>

              <p className="auth-switch">
                {t('auth_has_account')}{' '}
                <button type="button" className="auth-inline-btn" onClick={() => onModeChange('login')}>
                  {t('nav_login')}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
