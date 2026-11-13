/**
 * Device Local Time & Timezone Engine
 * Replaces hardcoded Indian Standard Time (IST) assumptions with the user's
 * actual local device clock and timezone (e.g. EDT, BST, GST, IST, JST).
 */



/**
 * Returns user device's IANA timezone string (e.g. 'America/New_York', 'Asia/Kolkata', 'Europe/London').
 */
export function getDeviceTimezone(): string {
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {}
  }
  return 'UTC';
}

/**
 * Returns current local timezone offset in hours from UTC (e.g. +5.5 for IST, -4 for EDT).
 */
export function getTimezoneOffsetHours(date: Date = new Date()): number {
  return -date.getTimezoneOffset() / 60;
}

/**
 * Computes the exact UTC offset (in hours, including DST) for any IANA timezone string on a given Date.
 * Falls back to device local timezone offset if the timezone string is invalid or unsupported.
 */
export function getTimezoneOffsetHoursForZone(
  timeZone: string,
  date: Date = new Date()
): number {
  if (!timeZone || typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
    return getTimezoneOffsetHours(date);
  }
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const getNum = (type: string) => {
      const val = Number(parts.find((p) => p.type === type)?.value || 0);
      return val;
    };
    let hour = getNum('hour');
    if (hour === 24) hour = 0;
    const utcFromParts = Date.UTC(
      getNum('year'),
      getNum('month') - 1,
      getNum('day'),
      hour,
      getNum('minute'),
      getNum('second')
    );
    const utcNow = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    );
    const diffMinutes = Math.round((utcFromParts - utcNow) / 60000);
    return diffMinutes / 60;
  } catch {
    return getTimezoneOffsetHours(date);
  }
}

/**
 * Formats a UTC offset in hours into standard readable notation (e.g., "UTC+5:30", "UTC-4", "UTC+0").
 */
export function formatUtcOffset(offsetHours: number): string {
  const sign = offsetHours >= 0 ? '+' : '-';
  const absMin = Math.round(Math.abs(offsetHours) * 60);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  return m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${String(m).padStart(2, '0')}`;
}

/**
 * Returns clock components and formatted string in a specific IANA timezone (or device local time if omitted).
 */
export function getTimePartsInZone(
  timeZone?: string,
  date: Date = new Date()
): { hours: number; minutes: number; seconds: number; formatted: string } {
  const targetTz = timeZone || getDeviceTimezone();
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    let hours = Number(parts.find((p) => p.type === 'hour')?.value || 0);
    if (hours === 24) hours = 0;
    const minutes = Number(parts.find((p) => p.type === 'minute')?.value || 0);
    const seconds = Number(parts.find((p) => p.type === 'second')?.value || 0);

    const formatted = formatLocalTimeInZone(date, targetTz, true);
    return { hours, minutes, seconds, formatted };
  } catch {
    return {
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds(),
      formatted: formatLocalTime(date, true),
    };
  }
}

export function formatLocalTimeInZone(
  date: Date,
  timeZone: string,
  showTimezone: boolean = true
): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      ...(showTimezone ? { timeZoneName: 'short' } : {}),
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return formatLocalTime(date, showTimezone);
  }
}

/**
 * Returns current Date in user's device local time.
 */
export function getNowLocal(): Date {
  return new Date();
}

/**
 * Backwards compatibility alias for getNowLocal.
 * Returns the user's actual device local time rather than forcing an artificial offset.
 */
export function getNowInIST(): Date {
  return new Date();
}

/**
 * Returns formatted local device time string with timezone indicator.
 * e.g. "10:30:15 AM (EDT)" or "10:30:15 AM"
 */
export function formatLocalTime(date?: Date, showTimezone: boolean = true): string {
  const d = date || new Date();
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (!showTimezone) {
    return `${hh}:${mm}:${ss} ${ampm}`;
  }

  let tzCode = '';
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(d);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    if (tzPart) tzCode = tzPart.value;
  } catch {}

  return tzCode ? `${hh}:${mm}:${ss} ${ampm} (${tzCode})` : `${hh}:${mm}:${ss} ${ampm}`;
}

/**
 * Backwards compatibility alias for formatLocalTime.
 */
export function formatISTTime(date?: Date): string {
  return formatLocalTime(date, true);
}



