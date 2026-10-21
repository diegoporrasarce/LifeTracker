/**
 * Date helpers.
 *
 * Dates are stored as plain `YYYY-MM-DD` strings so they survive JSON
 * round-trips and can be compared lexicographically. Month and weekday names
 * are hard-coded in Spanish instead of relying on `Intl`, which is not
 * consistently available on every Hermes build.
 */

export type ISODate = string;
export type MonthKey = string; // YYYY-MM

export const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

export const MONTH_NAMES_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

export const WEEKDAY_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;
export const WEEKDAY_SHORT = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'] as const;

export function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function toISODate(date: Date): ISODate {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function fromISODate(iso: ISODate): Date {
  const [year, month, day] = iso.split('-').map((part) => parseInt(part, 10));
  return new Date(year || 1970, (month || 1) - 1, day || 1);
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function monthKeyOf(iso: ISODate): MonthKey {
  return iso.slice(0, 7);
}

export function currentMonthKey(): MonthKey {
  return monthKeyOf(todayISO());
}

export function parseMonthKey(key: MonthKey): { year: number; month: number } {
  const [year, month] = key.split('-').map((part) => parseInt(part, 10));
  return { year: year || 1970, month: (month || 1) - 1 };
}

export function makeMonthKey(year: number, month: number): MonthKey {
  return `${year}-${pad2(month + 1)}`;
}

export function addMonths(key: MonthKey, delta: number): MonthKey {
  const { year, month } = parseMonthKey(key);
  const date = new Date(year, month + delta, 1);
  return makeMonthKey(date.getFullYear(), date.getMonth());
}

export function monthLabel(key: MonthKey, options?: { short?: boolean; withYear?: boolean }): string {
  const { year, month } = parseMonthKey(key);
  const name = options?.short ? MONTH_NAMES_SHORT[month] : MONTH_NAMES[month];
  if (options?.withYear === false) return name;
  return `${name} ${year}`;
}

/** Capitalised variant, handy for titles. */
export function monthLabelCapitalised(key: MonthKey, options?: { short?: boolean }): string {
  const label = monthLabel(key, options);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function isSameMonth(iso: ISODate, key: MonthKey): boolean {
  return iso.slice(0, 7) === key;
}

/**
 * Builds a 6x7 grid (42 cells) of dates covering the requested month.
 * Weeks start on Monday.
 */
export function buildMonthGrid(key: MonthKey): ISODate[] {
  const { year, month } = parseMonthKey(key);
  const firstOfMonth = new Date(year, month, 1);
  const offset = (firstOfMonth.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);

  const cells: ISODate[] = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    cells.push(toISODate(date));
  }
  return cells;
}

export function weekdayIndex(iso: ISODate): number {
  return (fromISODate(iso).getDay() + 6) % 7;
}

export function weekdayShort(iso: ISODate): string {
  return WEEKDAY_SHORT[weekdayIndex(iso)];
}

export function dayNumber(iso: ISODate): number {
  return parseInt(iso.slice(8, 10), 10);
}

export function formatDateLong(iso: ISODate): string {
  const date = fromISODate(iso);
  return `${weekdayShort(iso)} ${dayNumber(iso)} ${MONTH_NAMES_SHORT[date.getMonth()]}`;
}

export function formatDateFull(iso: ISODate): string {
  const date = fromISODate(iso);
  return `${dayNumber(iso)} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`;
}

export function daysFromToday(iso: ISODate): number {
  const start = fromISODate(todayISO()).getTime();
  const target = fromISODate(iso).getTime();
  return Math.round((target - start) / 86_400_000);
}

export function relativeDayLabel(iso: ISODate): string {
  const diff = daysFromToday(iso);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff === -1) return 'Ayer';
  if (diff > 1 && diff <= 14) return `En ${diff} días`;
  if (diff < -1 && diff >= -14) return `Hace ${Math.abs(diff)} días`;
  return formatDateLong(iso);
}

/** Inclusive list of month keys between two months. */
export function monthKeyRange(from: MonthKey, to: MonthKey): MonthKey[] {
  const keys: MonthKey[] = [];
  let current = from;
  let guard = 0;
  while (current <= to && guard < 1200) {
    keys.push(current);
    current = addMonths(current, 1);
    guard += 1;
  }
  return keys;
}

export function lastNMonths(count: number, reference: MonthKey = currentMonthKey()): MonthKey[] {
  const keys: MonthKey[] = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    keys.push(addMonths(reference, -index));
  }
  return keys;
}

/** Validates a `HH:mm` string. */
export function isValidTime(value: string): boolean {
  if (!/^\d{1,2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(':').map((part) => parseInt(part, 10));
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export function formatTime(value: string): string {
  return isValidTime(value) ? value.padStart(5, '0') : value;
}
