/**
 * Harmony Calendar - Robust Local Date & Timezone Utilities
 * Prevents UTC off-by-one errors caused by toISOString() slicing in non-UTC timezones.
 * Validates real calendar dates beyond superficial regex checks.
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
 * Validates whether a string is a real, valid calendar date (YYYY-MM-DD).
 * Beyond regex matching, checks true month limits, leap years, and day ranges.
 * Rejects nonexistent dates like 2026-02-30 or 2026-04-31.
 */
export function isValidCalendarDateString(dateStr?: string | null): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 1900 || year > 2150) return false;
  if (month < 1 || month > 12) return false;

  // Compute actual maximum days in this month/year (handles February leap year accurately)
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  return true;
}

/**
 * Validates whether an optional time string matches standard 24-hour HH:mm.
 */
export function isValidTimeString(timeStr?: string | null): boolean {
  if (!timeStr) return true; // Optional times are valid
  const match = timeStr.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return Boolean(match);
}

/**
 * Safely parses a YYYY-MM-DD string into a local Date object.
 * Uses local noon (12:00:00) to ensure daylight saving time or midnight
 * boundary shifts never cause an off-by-one day flip.
 */
export function parseYMDToLocalDate(ymd: string): Date {
  if (!isValidCalendarDateString(ymd)) return new Date();
  const [year, month, day] = ymd.split('-').map(Number);
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
  if (!isValidCalendarDateString(target) || !isValidCalendarDateString(start)) return false;
  const effectiveEnd = end && isValidCalendarDateString(end) ? end : start;
  return target >= start && target <= effectiveEnd;
}
