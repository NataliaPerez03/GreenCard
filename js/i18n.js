import { translations } from './data.js';

let currentLocale = 'es';

export const i18n = {
  setLocale(locale) { currentLocale = locale; },
  getLocale() { return currentLocale; },
  t(key) { return (translations[currentLocale] && translations[currentLocale][key]) || (translations.en && translations.en[key]) || key; },
  formatCurrency(amount, currency) {
    const opts = { style:'currency', currency, minimumFractionDigits: currency === 'COP' ? 0 : 2 };
    const localeMap = { es:'es-CO', pt:'pt-BR', en:'en-US', fr:'fr-FR', de:'de-DE' };
    try { return new Intl.NumberFormat(localeMap[currentLocale] || 'en-US', opts).format(amount); }
    catch { return `${currency} ${amount.toFixed(2)}`; }
  }
};
