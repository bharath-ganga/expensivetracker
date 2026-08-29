import type { CurrencyCode } from '@/types/database';

const currencyLocales: Record<CurrencyCode, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
};

export const formatCurrency = (value: number, currency: CurrencyCode | string = 'INR') => {
  const normalizedCurrency = currency in currencyLocales ? currency as CurrencyCode : 'INR';
  return new Intl.NumberFormat(currencyLocales[normalizedCurrency], {
    style: 'currency',
    currency: normalizedCurrency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
};

export const toDateInputValue = (date = new Date()) => date.toISOString().slice(0, 10);

export const escapeCsvCell = (value: unknown) => {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};
