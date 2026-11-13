import React, { useState } from 'react';
import { CalendarEvent, CalendarFaithMode, Language, EventCategory } from '../types/calendar';
import { translations } from '../translations/i18n';
import { formatDateToLocalYMD } from '../utils/dateUtils';
import { Sparkles, X, Clock } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: CalendarEvent) => void;
  language: Language;
  calendarMode?: CalendarFaithMode;
}

interface QuickTemplate {
  title: string;
  time: string;
  category: EventCategory;
  color: string;
  faithTag: CalendarFaithMode | 'universal';
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
  language,
  calendarMode = 'christian',
}) => {
  const t = translations[language];
  const [input, setInput] = useState('');
  const [selectedCategory] = useState<EventCategory>('personal');

  if (!isOpen) return null;

  const modeTemplate: QuickTemplate =
    calendarMode === 'muslim'
      ? {
          title: 'Friday Jummah Prayer & Khutbah',
          time: '13:00',
          category: 'spiritual',
          color: '#059669',
          faithTag: 'muslim',
        }
      : calendarMode === 'hindu'
      ? {
          title: 'Morning Puja & Aarti',
          time: '07:00',
          category: 'spiritual',
          color: '#d97706',
          faithTag: 'hindu',
        }
      : {
          title: 'Sunday Worship Service & Devotional',
          time: '10:00',
          category: 'spiritual',
          color: '#1E3A6E',
          faithTag: 'christian',
        };

  const quickTemplates: QuickTemplate[] = [
    modeTemplate,
    ...(calendarMode === 'hindu'
      ? [
          {
            title: 'Festival Shopping & Family Prep',
            time: '16:00',
            category: 'festival' as EventCategory,
            color: '#d97706',
            faithTag: 'hindu' as const,
          },
        ]
      : []),
    {
      title: 'Sprint Review & Engineering Sync',
      time: '11:00',
      category: 'work',
      color: '#2563eb',
      faithTag: 'universal',
    },
    {
      title: 'Family Weekend Dinner',
      time: '19:30',
      category: 'family',
      color: '#dc2626',
      faithTag: 'universal',
    },
    {
      title: 'Morning Walk & Wellness Routine',
      time: '06:30',
      category: 'health',
      color: '#0284c7',
      faithTag: 'universal',
    },
  ];

  const handleParseAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const lower = input.toLowerCase();
    const today = new Date();
    let targetDate = new Date(today);

    // Detect "tomorrow" or "today"
    if (lower.includes('tomorrow') || lower.includes('कल')) {
      targetDate.setDate(today.getDate() + 1);
    } else if (lower.includes('next week') || lower.includes('अगले हफ्ते')) {
      targetDate.setDate(today.getDate() + 7);
    }

    const dateStr = formatDateToLocalYMD(targetDate);

    // Detect time e.g. "at 4pm", "at 10:30am", "15:00"
    let timeStr = '10:00';
    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const mins = timeMatch[2] ? timeMatch[2] : '00';
      const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;

      timeStr = `${String(hours).padStart(2, '0')}:${mins}`;
    }

    // Auto category detection
    let category: EventCategory = selectedCategory;
    let color = '#4f46e5';

    if (lower.includes('prayer') || lower.includes('jummah') || lower.includes('puja') || lower.includes('mandir') || lower.includes('masjid')) {
      category = 'spiritual';
      color = '#059669';
    } else if (lower.includes('diwali') || lower.includes('eid') || lower.includes('holi') || lower.includes('festival') || lower.includes('navratri')) {
      category = 'festival';
      color = '#d97706';
    } else if (lower.includes('meeting') || lower.includes('sync') || lower.includes('client') || lower.includes('standup')) {
      category = 'work';
      color = '#2563eb';
    } else if (lower.includes('workout') || lower.includes('gym') || lower.includes('run') || lower.includes('doctor')) {
      category = 'health';
      color = '#0284c7';
    }

    // Clean title from "tomorrow at 4pm"
    let cleanedTitle = input
      .replace(/tomorrow|today|कल|next week/gi, '')
      .replace(/at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi, '')
      .trim();

    if (!cleanedTitle) cleanedTitle = input.trim();

    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: cleanedTitle,
      startDate: dateStr,
      startTime: timeStr,
      endDate: dateStr,
      endTime: `${String(Math.min(23, parseInt(timeStr.split(':')[0], 10) + 1)).padStart(2, '0')}:${timeStr.split(':')[1]}`,
      allDay: false,
      category,
      priority: 'medium',
      recurrence: 'none',
      color,
      faithTag: 'universal',
      createdAt: Date.now(),
    };

    onAddEvent(newEvent);
    setInput('');
    onClose();
  };

  const handleApplyTemplate = (tmpl: QuickTemplate) => {
    const dateStr = formatDateToLocalYMD(new Date());

    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: tmpl.title,
      startDate: dateStr,
      startTime: tmpl.time,
      endDate: dateStr,
      endTime: `${String(Math.min(23, parseInt(tmpl.time.split(':')[0], 10) + 1)).padStart(2, '0')}:00`,
      allDay: false,
      category: tmpl.category,
      priority: 'medium',
      recurrence: 'none',
      color: tmpl.color,
      faithTag: tmpl.faithTag,
      createdAt: Date.now(),
    };

    onAddEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.actions.quickAdd}
              </h2>
              <p className="text-[11px] text-slate-400">
                Natural text scheduling (e.g. "Meeting with team tomorrow at 3pm")
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleParseAndSubmit} className="mt-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What would you like to schedule?"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold pr-24"
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all"
            >
              Add
            </button>
          </div>

          {/* Quick suggestions / 1-click templates */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Instant 1-Click Templates
            </span>
            <div className="space-y-1.5">
              {quickTemplates.map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: tmpl.color }}
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {tmpl.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{tmpl.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
