const BASE_CURRENCY = 'USD';

// Tasas centralizadas para que el mismo producto conserve un valor base
// y se convierta de forma consistente segun la moneda del pais.
export const exchangeRates = {
  USD: 1,
  COP: 4000,
  BRL: 5,
  EUR: 0.92
};

const fractionDigitsByCurrency = {
  COP: 0,
  USD: 2,
  BRL: 2,
  EUR: 2
};

function roundByCurrency(amount, currency) {
  const fractionDigits = fractionDigitsByCurrency[currency] ?? 2;
  const factor = 10 ** fractionDigits;
  return Math.round(amount * factor) / factor;
}

export function convertCurrency(amount, fromCurrency, toCurrency) {
  const sourceRate = exchangeRates[fromCurrency];
  const targetRate = exchangeRates[toCurrency];

  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return 0;
  }

  if (!sourceRate || !targetRate) {
    return roundByCurrency(amount, toCurrency);
  }

  const amountInUsd = amount / sourceRate;
  return roundByCurrency(amountInUsd * targetRate, toCurrency);
}

export function getProductPrice(product, currency) {
  if (!product) {
    return 0;
  }

  const basePrice =
    typeof product.basePrice === 'number'
      ? product.basePrice
      : typeof product.prices?.[BASE_CURRENCY] === 'number'
        ? product.prices[BASE_CURRENCY]
        : 0;

  return convertCurrency(basePrice, BASE_CURRENCY, currency);
}
