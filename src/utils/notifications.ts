import { getTodayLocalYMD } from './dateUtils';

/**
 * Real-time Notifications & Reminders Engine
 * Handles in-app alerts and native Web Notifications for calendar events and tasks.
 * Avoids duplicate notifications, uses local IST time, and handles browser permissions safely.
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

// Session cache to prevent duplicate alerts
const notifiedSet = new Set<string>();

/**
 * Plays a peaceful, soft reminder chime using Web Audio API (zero external assets).
 */
export function playGentleChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Harmonic bell chord (E5, G#5, B5)
    playTone(659.25, 0, 1.2);
    playTone(830.61, 0.15, 1.2);
    playTone(987.77, 0.3, 1.5);
  } catch {
    // Audio context may be restricted before user interaction, ignore safely
  }
}

/**
 * Requests browser notification permission with safe fallback.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return 'default';
  }
}

/**
 * Shows native browser notification if permission is granted.
 */
export function triggerNativeNotification(item: CalendarReminderItem): void {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(`Harmony Calendar: ${item.title}`, {
        body: item.message,
        icon: '/favicon.ico',
        tag: item.id,
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
}

/**
 * Checks if a reminder should trigger for an event or task.
 */
export function shouldTriggerReminder(
  id: string,
  targetDateStr: string,
  targetTimeStr: string | undefined,
  reminderMinutesBefore: number = 15
): boolean {
  if (notifiedSet.has(id)) return false;

  const todayStr = getTodayLocalYMD();
  if (targetDateStr !== todayStr) return false;

  const now = new Date();

  if (!targetTimeStr) {
    // All-day event: trigger once around 09:00 AM
    const currentHour = now.getHours();
    if (currentHour >= 9 && !notifiedSet.has(id)) {
      notifiedSet.add(id);
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
    notifiedSet.add(id);
    return true;
  }

  return false;
}
