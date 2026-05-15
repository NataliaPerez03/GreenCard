import { translations } from './storeData.js';

const localeMap = {
  es: 'es-CO',
  pt: 'pt-BR',
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE'
};

export const i18n = {
  t(locale, key) {
    return translations[locale]?.[key] || translations.en?.[key] || key;
  },

  formatCurrency(locale, amount, currency) {
    const fractionDigits = currency === 'COP' ? 0 : 2;
    const options = {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    };

    try {
      return new Intl.NumberFormat(localeMap[locale] || 'en-US', options).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }
};
