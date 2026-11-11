/**
 * Indian Standard Time (IST / Asia/Kolkata / Mumbai Time Zone) Utility
 * Ensures all prayer times, countdown timers, Rahu Kaal, and calendar dates
 * are strictly locked to IST (UTC +05:30), preventing any time drift regardless
 * of the user's client machine or server time zone.
 */

import { PrayerTimes } from '../types/calendar';

/**
 * Returns a Date object converted to Indian Standard Time (IST).
 */
export function getNowInIST(): Date {
  const now = new Date();
  // Get UTC milliseconds
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  // Add 5 hours and 30 minutes for IST
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  return new Date(utcMs + istOffsetMs);
}

/**
 * Returns formatted IST time string: "HH:MM:SS AM/PM"
 */
export function formatISTTime(date?: Date): string {
  const d = date || getNowInIST();
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${hh}:${mm}:${ss} ${ampm} IST`;
}

import { calculateLocationPrayerTimes, DetailedPrayerInfo } from './prayerTimes';

/**
 * Accurate daily prayer times for Mumbai, Maharashtra, India
 * Coordinates: 18.9220° N, 72.8347° E | Standard Time: IST (UTC+5:30)
 * Uses solar declination and equation of time calibrated for Mumbai's longitude.
 */
export function getMumbaiPrayerTimes(date: Date): PrayerTimes {
  return calculateLocationPrayerTimes(date, { cityId: 'mumbai' }).times;
}

export { calculateLocationPrayerTimes };
export type { DetailedPrayerInfo };
