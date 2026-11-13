import { Language } from '../types/calendar';

export type WeekStartDay = 0 | 1 | 6; // 0 = Sunday, 1 = Monday, 6 = Saturday
export type TimeFormatOption = 'auto' | '12h' | '24h';
export type DateFormatOption = 'auto' | 'DMY' | 'MDY' | 'YMD';

const MONDAY_START_COUNTRIES = new Set([
  'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'PL',
  'TR', 'RU', 'AU', 'NZ', 'SG', 'MY', 'PK', 'ZA', 'CN', 'KR', 'VN', 'TH', 'UA', 'IE',
]);

const SATURDAY_START_COUNTRIES = new Set([
  'SA', 'QA', 'KW', 'OM', 'BH', 'EG', 'JO', 'IQ', 'AF', 'DZ', 'MA', 'TN', 'LY', 'SD',
]);

const TWENTY_FOUR_HOUR_COUNTRIES = new Set([
  'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'PL',
  'TR', 'RU', 'JP', 'CN', 'KR', 'SG', 'ID', 'VN', 'TH', 'BR', 'AR', 'ZA',
]);

/**
 * Returns a clean BCP-47 locale tag combining UI language and selected country where available.
 */
export function getLocaleTag(language: Language, countryCode?: string): string {
  const cc = countryCode?.trim().toUpperCase();
  if (language === 'ur') {
    return cc === 'IN' ? 'ur-IN' : 'ur-PK';
  }
  if (language === 'hinglish') {
    return cc && cc.length === 2 ? `en-${cc}` : 'en-IN';
  }
  if (cc && cc.length === 2) {
    return `en-${cc}`;
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'en-US';
}

/**
 * Resolves the first day of the week (0 = Sun, 1 = Mon, 6 = Sat).
 */
export function resolveWeekStartDay(
  pref?: 'auto' | WeekStartDay,
  countryCode?: string
): WeekStartDay {
  if (pref === 0 || pref === 1 || pref === 6) {
    return pref;
  }
  const cc = countryCode?.trim().toUpperCase();
  if (cc) {
    if (SATURDAY_START_COUNTRIES.has(cc)) return 6;
    if (MONDAY_START_COUNTRIES.has(cc)) return 1;
    if (cc === 'US' || cc === 'CA' || cc === 'IN' || cc === 'JP' || cc === 'AE' || cc === 'NP' || cc === 'LK' || cc === 'BD') {
      return 0;
    }
  }
  // Query browser Intl.Locale.getWeekInfo when supported
  try {
    const langTag =
      cc && cc.length === 2
        ? `en-${cc}`
        : typeof navigator !== 'undefined' && navigator.language
        ? navigator.language
        : 'en-US';
    const IntlAny = Intl as unknown as {
      Locale?: new (tag: string) => { getWeekInfo?: () => { firstDay: number } };
    };
    if (IntlAny.Locale) {
      const info = new IntlAny.Locale(langTag).getWeekInfo?.();
      if (info && typeof info.firstDay === 'number') {
        if (info.firstDay === 1) return 1;
        if (info.firstDay === 6) return 6;
        if (info.firstDay === 7 || info.firstDay === 0) return 0;
      }
    }
  } catch {}
  return 0;
}

/**
 * Returns the 7 weekday indices (0..6) ordered from the configured weekStartDay.
 */
export function getWeekdayOrder(weekStartDay: WeekStartDay): number[] {
  return Array.from({ length: 7 }, (_, i) => (weekStartDay + i) % 7);
}

/**
 * Resolves 12-hour vs 24-hour clock display.
 */
export function resolveTimeFormat(
  pref?: TimeFormatOption,
  countryCode?: string
): '12h' | '24h' {
  if (pref === '12h' || pref === '24h') {
    return pref;
  }
  const cc = countryCode?.trim().toUpperCase();
  if (cc) {
    if (TWENTY_FOUR_HOUR_COUNTRIES.has(cc)) return '24h';
    return '12h';
  }
  try {
    const resolved = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions();
    if (resolved.hourCycle === 'h23' || resolved.hourCycle === 'h24') {
      return '24h';
    }
    if (resolved.hour12 === false) {
      return '24h';
    }
  } catch {}
  return '12h';
}

/**
 * Formats an "HH:mm" time string according to 12h or 24h preference.
 * Leaves placeholder strings (e.g. "--:--") untouched.
 */
export function formatTimePreference(
  hhmm: string,
  pref?: TimeFormatOption,
  countryCode?: string
): string {
  if (!hhmm || !hhmm.includes(':')) return hhmm;
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;

  const mode = resolveTimeFormat(pref, countryCode);
  const mm = String(m).padStart(2, '0');
  if (mode === '24h') {
    return `${String(h).padStart(2, '0')}:${mm}`;
  }
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${suffix}`;
}

/**
 * Formats a Date object as a live clock in a target IANA timezone respecting 12h/24h preference.
 */
export function formatClockInZone(
  date: Date,
  timeZone: string,
  pref?: TimeFormatOption,
  countryCode?: string,
  locale: string = 'en-US',
  showSeconds: boolean = true
): string {
  const mode = resolveTimeFormat(pref, countryCode);
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds ? { second: '2-digit' } : {}),
      hour12: mode === '12h',
    }).format(date);
  } catch {
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds ? { second: '2-digit' } : {}),
      hour12: mode === '12h',
    });
  }
}

/**
 * Formats a Date or YYYY-MM-DD string cleanly with unambiguous month names or explicit DMY/MDY/YMD order.
 */
export function formatDateLocalized(
  dateInput: Date | string,
  datePref: DateFormatOption = 'auto',
  locale: string = 'en-US',
  style: 'medium' | 'long' | 'shortNumeric' = 'medium'
): string {
  const dateObj =
    typeof dateInput === 'string'
      ? (() => {
          const [y, m, d] = dateInput.split('-').map(Number);
          if (!y || !m || !d) return new Date();
          return new Date(y, m - 1, d, 12, 0, 0);
        })()
      : dateInput;

  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');

  if (style === 'shortNumeric' || datePref === 'YMD' || datePref === 'DMY' || datePref === 'MDY') {
    if (datePref === 'YMD') return `${y}-${m}-${d}`;
    if (datePref === 'DMY') return `${d}/${m}/${y}`;
    if (datePref === 'MDY') return `${m}/${d}/${y}`;
    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(dateObj);
    } catch {
      return `${y}-${m}-${d}`;
    }
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: style === 'long' ? 'long' : 'short',
      year: style === 'long' ? 'numeric' : undefined,
      month: style === 'long' ? 'long' : 'short',
      day: 'numeric',
    }).format(dateObj);
  } catch {
    return `${y}-${m}-${d}`;
  }
}

/**
 * Formats numbers using the user's active locale.
 */
export function formatNumberLocalized(value: number, locale: string = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return String(value);
  }
}
