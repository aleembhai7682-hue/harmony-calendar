import React, { useState, useEffect } from 'react';
import {
  CalendarEvent,
  CalendarFaithMode,
  EventCategory,
  Priority,
  RecurrenceType,
  Language,
} from '../types/calendar';
import { translations } from '../translations/i18n';
import { getTodayLocalYMD } from '../utils/dateUtils';
import { getDeviceTimezone } from '../utils/istTime';
import { getModeTheme } from '../utils/modeTheme';
import { X, Trash2, Calendar, Clock, MapPin, Tag, AlertCircle, Globe } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
  initialEvent?: CalendarEvent | null;
  defaultDate?: string;
  defaultTime?: string;
  language: Language;
  calendarMode?: CalendarFaithMode;
  activeTimeZone?: string;
}

const COLOR_PALETTE = [
  '#14284B', // Midnight Navy
  '#047857', // Botanical Emerald
  '#B45309', // Burnished Saffron
  '#C69C44', // Champagne Brass
  '#BE123C', // Deep Crimson
  '#0284C7', // Cerulean Sky
  '#9A3412', // Terracotta Dusk
  '#6D28D9', // Royal Violet
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEvent,
  defaultDate,
  defaultTime,
  language,
  calendarMode = 'christian',
  activeTimeZone,
}) => {
  const t = translations[language];
  const resolvedTz = initialEvent?.timeZone || activeTimeZone || getDeviceTimezone();
  const modeTheme = getModeTheme(calendarMode);
  const modeDefaultColor =
    calendarMode === 'muslim' ? '#047857' : calendarMode === 'hindu' ? '#B45309' : '#14284B';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(defaultDate || getTodayLocalYMD());
  const [startTime, setStartTime] = useState(defaultTime || '10:00');
  const [endDate, setEndDate] = useState(defaultDate || getTodayLocalYMD());
  const [endTime, setEndTime] = useState('11:00');
  const [allDay, setAllDay] = useState(false);
  const [category, setCategory] = useState<EventCategory>('personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [color, setColor] = useState(modeDefaultColor);
  const [location, setLocation] = useState('');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(15);
  const [faithTag, setFaithTag] = useState<'universal' | 'muslim' | 'hindu' | 'christian'>('universal');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDescription(initialEvent.description || '');
      setStartDate(initialEvent.startDate);
      setStartTime(initialEvent.startTime || '10:00');
      setEndDate(initialEvent.endDate || initialEvent.startDate);
      setEndTime(initialEvent.endTime || '11:00');
      setAllDay(initialEvent.allDay);
      setCategory(initialEvent.category);
      setPriority(initialEvent.priority);
      setRecurrence(initialEvent.recurrence);
      setColor(initialEvent.color || modeDefaultColor);
      setLocation(initialEvent.location || '');
      setReminderMinutesBefore(initialEvent.reminderMinutesBefore || 15);
      setFaithTag(initialEvent.faithTag || 'universal');
    } else {
      setTitle('');
      setDescription('');
      setStartDate(defaultDate || getTodayLocalYMD());
      setStartTime(defaultTime || '10:00');
      setEndDate(defaultDate || getTodayLocalYMD());
      setEndTime('11:00');
      setAllDay(false);
      setCategory('personal');
      setPriority('medium');
      setRecurrence('none');
      setColor(modeDefaultColor);
      setLocation('');
      setReminderMinutesBefore(15);
      setFaithTag('universal');
    }
    setError('');
  }, [initialEvent, defaultDate, defaultTime, isOpen, modeDefaultColor]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(language === 'en' ? 'Please enter an event title.' : 'कृपया कार्यक्रम का शीर्षक दर्ज करें।');
      return;
    }

    if (endDate && startDate > endDate) {
      setError(language === 'en' ? 'End date cannot be earlier than start date.' : 'समाप्ति तिथि आरंभ तिथि से पहले नहीं हो सकती।');
      return;
    }

    if (!allDay && startDate === endDate && startTime && endTime && startTime > endTime) {
      setError(language === 'en' ? 'End time cannot be earlier than start time.' : 'समाप्ति समय आरंभ समय से पहले नहीं हो सकता।');
      return;
    }

    const newEvent: CalendarEvent = {
      id: initialEvent ? initialEvent.id : `evt-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      startDate,
      startTime: allDay ? undefined : startTime,
      endDate: endDate || startDate,
      endTime: allDay ? undefined : endTime,
      allDay,
      category,
      priority,
      recurrence,
      color,
      location: location.trim(),
      reminderMinutesBefore,
      faithTag,
      timeZone: allDay ? undefined : resolvedTz,
      createdAt: initialEvent ? initialEvent.createdAt : Date.now(),
    };

    onSave(newEvent);
    onClose();
  };

  const toggleCheckedColor =
    calendarMode === 'muslim'
      ? 'peer-checked:bg-emerald-700 dark:peer-checked:bg-emerald-500'
      : calendarMode === 'hindu'
      ? 'peer-checked:bg-amber-700 dark:peer-checked:bg-amber-500'
      : 'peer-checked:bg-[#14284B] dark:peer-checked:bg-sky-500';

  const inputCls = `w-full px-3 py-2 text-xs rounded-xl ${modeTheme.cardSubSurface} border ${modeTheme.cardBorder} text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${modeTheme.focusRing} font-medium`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${modeTheme.cardSurface} rounded-3xl max-w-lg w-full p-6 shadow-2xl border ${modeTheme.cardBorder} max-h-[90vh] overflow-y-auto`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${modeTheme.gridDivider}`}>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: color }}
            />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialEvent ? t.actions.edit : t.actions.addEvent}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Diwali Dinner / Client Sync / Quran Recitation"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl ${modeTheme.cardSubSurface} border ${modeTheme.cardBorder} text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${modeTheme.focusRing} font-semibold`}
              autoFocus
            />
          </div>

          {/* All-Day toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.events.allDay}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${toggleCheckedColor}`} />
            </label>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
            </div>

            {!allDay && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputCls}
                />
              </div>
            )}
          </div>

          {!allDay && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Globe className={`w-3.5 h-3.5 ${modeTheme.accentText} shrink-0`} />
                <span>Event Timezone: <strong className="text-slate-700 dark:text-slate-200">{resolvedTz.replace(/_/g, ' ')}</strong></span>
              </div>
            </div>
          )}

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className={`${inputCls} capitalize cursor-pointer`}
              >
                <option value="personal">{t.categories.personal}</option>
                <option value="work">{t.categories.work}</option>
                <option value="family">{t.categories.family}</option>
                <option value="spiritual">{t.categories.spiritual}</option>
                <option value="health">{t.categories.health}</option>
                <option value="birthday">{t.categories.birthday}</option>
                <option value="festival">{t.categories.festival}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={`${inputCls} cursor-pointer`}
              >
                <option value="low">{t.priorities.low}</option>
                <option value="medium">{t.priorities.medium}</option>
                <option value="high">{t.priorities.high}</option>
              </select>
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Repeat
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="none">{t.recurrence.none}</option>
              <option value="daily">{t.recurrence.daily}</option>
              <option value="weekly">{t.recurrence.weekly}</option>
              <option value="monthly">{t.recurrence.monthly}</option>
              <option value="yearly">{t.recurrence.yearly}</option>
            </select>
          </div>

          {/* Faith Tag / Mode Visibility */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Religious Mode Visibility</span>
            </label>
            <select
              value={faithTag}
              onChange={(e) => setFaithTag(e.target.value as 'universal' | 'muslim' | 'hindu' | 'christian')}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="universal">🌐 Universal (Visible in all modes)</option>
              <option value="christian">✝️ Christian Mode Only</option>
              <option value="hindu">🕉️ Hindu Mode Only</option>
              <option value="muslim">🌙 Muslim Mode Only</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Office / Home / Jamia Masjid / Connaught Place"
              className={inputCls}
            />
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Event Color Tag
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-xl transition-all cursor-pointer ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-700 dark:ring-white scale-110 shadow-sm' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.events.description}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Notes, agenda, or reminders..."
              className={inputCls}
            />
          </div>

          {/* Footer Buttons */}
          <div className={`flex items-center justify-between pt-4 border-t ${modeTheme.gridDivider}`}>
            {initialEvent && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialEvent.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.actions.delete}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t.actions.cancel}
              </button>
              <button
                type="submit"
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${modeTheme.primaryBtn}`}
              >
                {t.actions.save}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
