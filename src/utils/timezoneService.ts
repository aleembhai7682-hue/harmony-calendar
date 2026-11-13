import { CalendarEvent, CalendarFilterSettings } from '../types/calendar';
import { getCityLocation, hasExplicitLocation } from './cities';
import {
  getDeviceTimezone,
  getTimezoneOffsetHoursForZone,
  isValidIanaTimezone,
  formatUtcOffset,
} from './istTime';

export interface ZonedDateTimeParts {
  ymd: string;
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hours: number; // 0-23
  minutes: number; // 0-59
  seconds: number; // 0-59
}

/**
 * Returns the user's currently selected valid geographical IANA timezone if a location
 * is configured and confirmed, or falls back to the device timezone for non-astronomical
 * calendar UI display.
 */
export function getEffectiveCalendarTimezone(filters: CalendarFilterSettings): string {
  const hasLoc = hasExplicitLocation(
    filters.selectedCity,
    filters.customLatitude,
    filters.customLongitude
  );
  const needsLegacyConfirm =
    filters.selectedCity?.trim().toLowerCase() === 'mumbai' &&
    filters.locationExplicitlyConfirmed !== true;

  if (hasLoc && !needsLegacyConfirm) {
    if (
      filters.selectedLocationTimezone &&
      isValidIanaTimezone(filters.selectedLocationTimezone)
    ) {
      return filters.selectedLocationTimezone.trim();
    }
    const loc = getCityLocation(
      filters.selectedCity,
      filters.customLatitude,
      filters.customLongitude,
      filters.customLocationName,
      filters.selectedCountry,
      filters.selectedLocationTimezone
    );
    if (loc.timezone && isValidIanaTimezone(loc.timezone)) {
      return loc.timezone;
    }
  }
  return getDeviceTimezone();
}

/**
 * Extracts exact calendar date (YYYY-MM-DD) and wall-clock time components
 * for a given Date instant inside a target IANA timezone (DST-aware).
 */
export function getZonedDateTimeParts(
  date: Date,
  timeZone: string
): ZonedDateTimeParts {
  const safeZone = isValidIanaTimezone(timeZone) ? timeZone : getDeviceTimezone();
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: safeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const getVal = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
    const year = getVal('year');
    const month = getVal('month');
    const day = getVal('day');
    let hours = getVal('hour');
    if (hours === 24) hours = 0;
    const minutes = getVal('minute');
    const seconds = getVal('second');
    const ymd = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;
    return { ymd, year, month, day, hours, minutes, seconds };
  } catch {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return {
      ymd: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      year,
      month,
      day,
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds(),
    };
  }
}

/**
 * Converts a wall-clock YYYY-MM-DD + HH:mm in a given IANA timezone to a UTC epoch timestamp (ms).
 * Iteratively refines offset so DST transitions (spring-forward / fall-back) and fractional offsets
 * (e.g. +5:30, +5:45, -3:30) resolve accurately.
 */
export function zonedDateTimeToUtcMs(
  ymd: string,
  hhmm: string,
  sourceTimeZone: string
): number | null {
  const dateParts = ymd.split('-').map(Number);
  const timeParts = hhmm.split(':').map(Number);
  if (
    dateParts.length !== 3 ||
    timeParts.length < 2 ||
    dateParts.some(Number.isNaN) ||
    timeParts.some(Number.isNaN)
  ) {
    return null;
  }

  const [y, m, d] = dateParts;
  const [hh, mm] = timeParts;
  const targetAsUtc = Date.UTC(y, m - 1, d, hh, mm, 0);

  const safeZone = isValidIanaTimezone(sourceTimeZone) ? sourceTimeZone : 'UTC';
  // Iterative offset convergence (2 passes handle DST boundary crossings cleanly)
  let offsetHours = getTimezoneOffsetHoursForZone(safeZone, new Date(targetAsUtc));
  let utcGuess = targetAsUtc - Math.round(offsetHours * 3600000);
  offsetHours = getTimezoneOffsetHoursForZone(safeZone, new Date(utcGuess));
  utcGuess = targetAsUtc - Math.round(offsetHours * 3600000);
  return utcGuess;
}

/**
 * Converts a YYYY-MM-DD + HH:mm pair from sourceTimeZone into targetTimeZone.
 */
export function convertZonedDateTime(
  ymd: string,
  hhmm: string,
  sourceTimeZone: string,
  targetTimeZone: string
): { date: string; time: string } {
  if (
    !sourceTimeZone ||
    !targetTimeZone ||
    sourceTimeZone === targetTimeZone ||
    !isValidIanaTimezone(sourceTimeZone) ||
    !isValidIanaTimezone(targetTimeZone)
  ) {
    return { date: ymd, time: hhmm };
  }

  const utcMs = zonedDateTimeToUtcMs(ymd, hhmm, sourceTimeZone);
  if (utcMs === null) {
    return { date: ymd, time: hhmm };
  }
  const parts = getZonedDateTimeParts(new Date(utcMs), targetTimeZone);
  return {
    date: parts.ymd,
    time: `${String(parts.hours).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}`,
  };
}

export interface EventDisplayTiming {
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  isConverted: boolean;
  sourceTimeZone?: string;
  sourceOffsetStr?: string;
}

/**
 * Computes how an event should be displayed in the target calendar timezone.
 * - All-day events NEVER shift across dates.
 * - Legacy events without an explicit timeZone remain anchored as floating local wall-clock events.
 * - Timed events scheduled in a different IANA timezone convert cleanly to targetTimeZone.
 */
export function getEventDisplayInTimezone(
  event: CalendarEvent,
  targetTimeZone?: string
): EventDisplayTiming {
  if (
    event.allDay ||
    !event.startTime ||
    !event.timeZone ||
    !targetTimeZone ||
    event.timeZone === targetTimeZone ||
    !isValidIanaTimezone(event.timeZone) ||
    !isValidIanaTimezone(targetTimeZone)
  ) {
    return {
      startDate: event.startDate,
      startTime: event.startTime,
      endDate: event.endDate || event.startDate,
      endTime: event.endTime,
      isConverted: false,
      sourceTimeZone: event.timeZone,
    };
  }

  const startConverted = convertZonedDateTime(
    event.startDate,
    event.startTime,
    event.timeZone,
    targetTimeZone
  );

  let endConvertedDate = event.endDate || event.startDate;
  let endConvertedTime = event.endTime;
  if (event.endTime) {
    const endConverted = convertZonedDateTime(
      event.endDate || event.startDate,
      event.endTime,
      event.timeZone,
      targetTimeZone
    );
    endConvertedDate = endConverted.date;
    endConvertedTime = endConverted.time;
  }

  const utcMs = zonedDateTimeToUtcMs(event.startDate, event.startTime, event.timeZone);
  const sourceOffsetStr =
    utcMs !== null
      ? formatUtcOffset(getTimezoneOffsetHoursForZone(event.timeZone, new Date(utcMs)))
      : undefined;

  return {
    startDate: startConverted.date,
    startTime: startConverted.time,
    endDate: endConvertedDate,
    endTime: endConvertedTime,
    isConverted: true,
    sourceTimeZone: event.timeZone,
    sourceOffsetStr,
  };
}
