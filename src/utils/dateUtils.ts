/**
 * Harmony Calendar - Robust Local Date & Timezone Utilities
 * Prevents UTC off-by-one errors caused by toISOString() slicing in non-UTC timezones.
 */

/**
 * Formats a Date object to a local YYYY-MM-DD string without UTC skew.
 */
export function formatDateToLocalYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's local date as a YYYY-MM-DD string.
 */
export function getTodayLocalYMD(): string {
  return formatDateToLocalYMD(new Date());
}

/**
 * Safely parses a YYYY-MM-DD string into a local Date object.
 * Uses local noon (12:00:00) to ensure daylight saving time or midnight
 * boundary shifts never cause an off-by-one day flip.
 */
export function parseYMDToLocalDate(ymd: string): Date {
  if (!ymd || typeof ymd !== 'string') return new Date();
  const parts = ymd.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return new Date();
  }
  const [year, month, day] = parts;
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Checks whether two Date objects represent the exact same calendar day in local time.
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Checks if a target date string (YYYY-MM-DD) falls between start and end date strings inclusive.
 */
export function isDateStringInRange(target: string, start: string, end?: string): boolean {
  const effectiveEnd = end || start;
  return target >= start && target <= effectiveEnd;
}
