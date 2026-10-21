/**
 * Number and money formatting.
 *
 * Amounts are formatted the European way: thousands separated by a dot and
 * decimals by a comma (`1.234,56 €`).
 */

export type CurrencyOptions = {
  /** Shorten big numbers: `12,3 k€`. */
  compact?: boolean;
  /** Show a `+` for positive values. */
  showSign?: boolean;
  /** Override the number of decimals. */
  decimals?: number;
  /** Skip the currency symbol. */
  withoutSymbol?: boolean;
};

function formatDecimal(value: number, decimals: number): string {
  const safeValue = Math.abs(value);
  const fixed = safeValue.toFixed(decimals);
  const [integerPart, fractionPart] = fixed.split('.');
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return fractionPart ? `${grouped},${fractionPart}` : grouped;
}

export function formatCurrency(value: number, options?: CurrencyOptions): string {
  const { compact = false, showSign = false, decimals, withoutSymbol = false } = options ?? {};
  const symbol = withoutSymbol ? '' : ' €';

  const absolute = Math.abs(value);
  let body: string;

  if (compact && absolute >= 1000) {
    const units = [
      { threshold: 1_000_000_000, suffix: 'MM' },
      { threshold: 1_000_000, suffix: 'M' },
      { threshold: 1_000, suffix: 'k' },
    ];
    const unit = units.find((candidate) => absolute >= candidate.threshold);
    if (unit) {
      const scaled = absolute / unit.threshold;
      body = `${formatDecimal(scaled, scaled < 10 ? 1 : 0)} ${unit.suffix}${symbol}`;
    } else {
      body = `${formatDecimal(absolute, 0)}${symbol}`;
    }
  } else {
    body = `${formatDecimal(absolute, decimals ?? 2)}${symbol}`;
  }

  const isRoundedToZero = decimals === 0 ? Math.round(absolute) === 0 : Math.abs(value) < 0.005;
  const sign = value < 0 && !isRoundedToZero ? '-' : showSign && value > 0 ? '+' : '';

  return `${sign}${body}`;
}

export function formatPercent(value: number, decimals = 1): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${formatDecimal(Math.abs(value), decimals)} %`;
}

export function formatNumber(value: number, decimals = 0): string {
  return formatDecimal(value, decimals);
}

/**
 * Parses user typed amounts. Accepts `1.234,56`, `1234.56` and `1234,56`.
 */
export function parseAmount(input: string): number {
  const cleaned = input.replace(/[^\d,.\-]/g, '');
  if (!cleaned) return 0;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalised: string;

  if (lastComma > -1 && lastDot > -1) {
    normalised = lastComma > lastDot
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned.replace(/,/g, '');
  } else if (lastComma > -1) {
    normalised = cleaned.replace(',', '.');
  } else {
    normalised = cleaned;
  }

  const parsed = parseFloat(normalised);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Formats an amount for display inside an input field. */
export function formatAmountForInput(value: number): string {
  if (!Number.isFinite(value)) return '';
  if (value === 0) return '0';
  const rounded = Math.round(value * 100) / 100;
  return String(rounded).replace('.', ',');
}
