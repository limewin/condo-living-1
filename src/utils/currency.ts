/**
 * Currency utility functions for Philippine Peso (PHP - ₱)
 */

export function formatPHP(amount: number | null | undefined, options?: { showCents?: boolean }): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₱0.00';
  }

  const showCents = options?.showCents ?? true;
  
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}

export function parsePHP(input: string): number {
  if (!input) return 0;
  const clean = input.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}
