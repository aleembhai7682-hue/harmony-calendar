import { Language } from '../types/calendar';
import { formatDateToLocalYMD, getTodayLocalYMD } from './dateUtils';

export type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYER_IDS: PrayerId[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export type PrayerDayRecord = Record<PrayerId, boolean>;
export type PrayerHistoryMap = Record<string, PrayerDayRecord>;

export interface PrayerDayStat {
  dateStr: string;
  dayShort: string;
  dateShort: string;
  fullDateLabel: string;
  isToday: boolean;
  completedCount: number;
  goal: number;
  metGoal: boolean;
  adherencePct: number;
  record: PrayerDayRecord;
}

const PRAYER_COMPLETION_STORAGE_KEY = 'harmony_prayer_completion_v1';
const PRAYER_GOAL_STORAGE_KEY = 'harmony_prayer_goal_v1';

export const EMPTY_PRAYER_DAY_RECORD: PrayerDayRecord = {
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
};

function getSafeStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      return window.localStorage;
    }
  } catch {
    // Ignore storage availability errors
  }
  return null;
}

export function normalizePrayerDayRecord(raw: unknown): PrayerDayRecord {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    fajr: Boolean(src.fajr),
    dhuhr: Boolean(src.dhuhr),
    asr: Boolean(src.asr),
    maghrib: Boolean(src.maghrib),
    isha: Boolean(src.isha),
  };
}

export function countCompletedPrayers(record?: Partial<PrayerDayRecord> | null): number {
  if (!record) return 0;
  return PRAYER_IDS.reduce((sum, id) => sum + (record[id] ? 1 : 0), 0);
}

export function clampDailyPrayerGoal(goal: number): number {
  if (!Number.isFinite(goal)) return 5;
  return Math.min(5, Math.max(1, Math.round(goal)));
}

export function loadPrayerHistory(): PrayerHistoryMap {
  const storage = getSafeStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(PRAYER_COMPLETION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const clean: PrayerHistoryMap = {};
    for (const [dateKey, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        clean[dateKey] = normalizePrayerDayRecord(value);
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export function savePrayerHistory(history: PrayerHistoryMap): void {
  const storage = getSafeStorage();
  if (!storage) return;
  try {
    storage.setItem(PRAYER_COMPLETION_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Ignore quota / storage errors
  }
}

export function loadDailyPrayerGoal(): number {
  const storage = getSafeStorage();
  if (!storage) return 5;
  try {
    const raw = storage.getItem(PRAYER_GOAL_STORAGE_KEY);
    if (!raw) return 5;
    const parsed = Number(raw);
    return clampDailyPrayerGoal(parsed);
  } catch {
    return 5;
  }
}

export function saveDailyPrayerGoal(goal: number): void {
  const storage = getSafeStorage();
  if (!storage) return;
  try {
    storage.setItem(PRAYER_GOAL_STORAGE_KEY, String(clampDailyPrayerGoal(goal)));
  } catch {
    // Ignore quota / storage errors
  }
}

export function togglePrayerInHistory(
  history: PrayerHistoryMap,
  dateStr: string,
  prayerId: PrayerId
): PrayerHistoryMap {
  const existing = history[dateStr] ?? { ...EMPTY_PRAYER_DAY_RECORD };
  const nextRecord: PrayerDayRecord = {
    ...existing,
    [prayerId]: !existing[prayerId],
  };
  return {
    ...history,
    [dateStr]: nextRecord,
  };
}

export function setAllPrayersForDay(
  history: PrayerHistoryMap,
  dateStr: string,
  completed: boolean
): PrayerHistoryMap {
  return {
    ...history,
    [dateStr]: {
      fajr: completed,
      dhuhr: completed,
      asr: completed,
      maghrib: completed,
      isha: completed,
    },
  };
}

const URDU_WEEKDAYS_SHORT = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
const EN_WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EN_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function getPrayerDisplayName(prayerId: PrayerId, language: Language, isFriday = false): string {
  if (language === 'ur') {
    switch (prayerId) {
      case 'fajr':
        return 'فجر';
      case 'dhuhr':
        return isFriday ? 'جمعہ' : 'ظہر';
      case 'asr':
        return 'عصر';
      case 'maghrib':
        return 'مغرب';
      case 'isha':
        return 'عشاء';
    }
  }
  switch (prayerId) {
    case 'fajr':
      return 'Fajr';
    case 'dhuhr':
      return isFriday ? 'Jummah' : 'Dhuhr';
    case 'asr':
      return 'Asr';
    case 'maghrib':
      return 'Maghrib';
    case 'isha':
      return 'Isha';
  }
}

export function getLast7DaysPrayerStats(
  anchorDate: Date,
  history: PrayerHistoryMap,
  dailyGoal: number,
  language: Language
): PrayerDayStat[] {
  const safeGoal = clampDailyPrayerGoal(dailyGoal);
  const todayStr = getTodayLocalYMD();
  const base = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate());
  const stats: PrayerDayStat[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const dayDate = new Date(base.getFullYear(), base.getMonth(), base.getDate() - offset);
    const dateStr = formatDateToLocalYMD(dayDate);
    const record = normalizePrayerDayRecord(history[dateStr]);
    const completedCount = countCompletedPrayers(record);
    const weekdayIdx = dayDate.getDay();
    const dayShort =
      language === 'ur' ? URDU_WEEKDAYS_SHORT[weekdayIdx] : EN_WEEKDAYS_SHORT[weekdayIdx];
    const dateShort = `${dayDate.getDate()} ${EN_MONTHS_SHORT[dayDate.getMonth()]}`;
    const fullDateLabel = `${EN_WEEKDAYS_SHORT[weekdayIdx]}, ${dateShort}`;

    stats.push({
      dateStr,
      dayShort,
      dateShort,
      fullDateLabel,
      isToday: dateStr === todayStr,
      completedCount,
      goal: safeGoal,
      metGoal: completedCount >= safeGoal,
      adherencePct: Math.min(100, Math.round((completedCount / safeGoal) * 100)),
      record,
    });
  }

  return stats;
}
