import { getTodayLocalYMD } from './dateUtils';

/**
 * Real-time Notifications & Reminders Engine
 * Handles user-initiated permission flow, in-app toast fallbacks,
 * audio chime synthesis via Web Audio API, and reliable deduplication.
 */

export interface CalendarReminderItem {
  id: string;
  title: string;
  timeStr: string;
  type: 'event' | 'task';
  category?: string;
  message: string;
  timestamp: number;
}

// In-memory set backed by sessionStorage for session persistence across hot reloads
const SESSION_NOTIFIED_KEY = 'harmony_session_notified_alerts_v3';

function getNotifiedSet(): Set<string> {
  const set = new Set<string>();
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(SESSION_NOTIFIED_KEY);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          arr.forEach((k) => set.add(k));
        }
      }
    }
  } catch {}
  return set;
}

function recordNotifiedKey(key: string): void {
  try {
    const set = getNotifiedSet();
    set.add(key);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(SESSION_NOTIFIED_KEY, JSON.stringify(Array.from(set)));
    }
  } catch {}
}

/**
 * Checks if browser supports native notifications.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Returns current notification permission status safely.
 */
export function getNotificationPermissionStatus(): 'default' | 'granted' | 'denied' | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission as 'default' | 'granted' | 'denied';
}

/**
 * User-initiated notification permission request.
 * MUST be invoked directly from a user action (e.g. clicking "Enable Notifications" button).
 * Never invoked automatically without user interaction.
 */
export async function requestNotificationPermissionByUser(): Promise<'default' | 'granted' | 'denied' | 'unsupported'> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as 'default' | 'granted' | 'denied';
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return getNotificationPermissionStatus();
  }
}

/**
 * Plays a peaceful, soft reminder chime using Web Audio API (zero external assets).
 */
export function playGentleChime(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Harmonic bell chord (E5: 659.25Hz, G#5: 830.61Hz, B5: 987.77Hz)
    playTone(659.25, 0, 1.2);
    playTone(830.61, 0.15, 1.2);
    playTone(987.77, 0.3, 1.5);
  } catch {
    // Audio context may be restricted before user gesture, ignore safely
  }
}

/**
 * Shows native browser notification if permission is granted.
 * Gracefully ignores if not granted or unsupported (in-app toast is used as fallback).
 */
export function triggerNativeNotification(item: CalendarReminderItem): void {
  if (!isNotificationSupported()) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(`Harmony Calendar: ${item.title}`, {
        body: item.message,
        icon: '/favicon.ico',
        tag: `${item.id}-${getTodayLocalYMD()}`, // Prevents duplicate native stacking
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
}

/**
 * Checks if a reminder should trigger for an event or task.
 * Enforces per-day deduplication to prevent repetitive notifications.
 */
export function shouldTriggerReminder(
  id: string,
  targetDateStr: string,
  targetTimeStr: string | undefined,
  reminderMinutesBefore: number = 15
): boolean {
  const todayStr = getTodayLocalYMD();
  if (targetDateStr !== todayStr) return false;

  const dedupeKey = `${id}-${todayStr}`;
  const notifiedSet = getNotifiedSet();
  if (notifiedSet.has(dedupeKey)) return false;

  const now = new Date();

  if (!targetTimeStr) {
    // All-day event: trigger once around or after 09:00 AM
    const currentHour = now.getHours();
    if (currentHour >= 9) {
      recordNotifiedKey(dedupeKey);
      return true;
    }
    return false;
  }

  const [tHour, tMin] = targetTimeStr.split(':').map(Number);
  const targetTotalMinutes = tHour * 60 + tMin;
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  // Trigger if we are within [target - reminderMinutesBefore, target] window
  const diff = targetTotalMinutes - currentTotalMinutes;
  if (diff >= 0 && diff <= reminderMinutesBefore) {
    recordNotifiedKey(dedupeKey);
    return true;
  }

  return false;
}

/**
 * Triggers a manual test chime and notification so user can verify audio & alert setup.
 */
export function testNotificationChimeAndAlert(): CalendarReminderItem {
  playGentleChime();
  const testItem: CalendarReminderItem = {
    id: `test-${Date.now()}`,
    title: 'Reminder Test Chime',
    timeStr: 'Right Now',
    type: 'event',
    category: 'personal',
    message: 'Audio chime and in-app alert notifications are active and functioning properly!',
    timestamp: Date.now(),
  };
  triggerNativeNotification(testItem);
  return testItem;
}
