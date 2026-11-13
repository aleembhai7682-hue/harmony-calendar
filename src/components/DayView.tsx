import React from 'react';
import {
  CalendarEvent,
  CalendarTask,
  CalendarFilterSettings,
  Language,
  IndianFestival,
  IslamicOccasion,
} from '../types/calendar';
import { translations } from '../translations/i18n';
import { getHijriDate, getIslamicOccasionForDate, getMoonPhase } from '../utils/hijri';
import { getFestivalsForDate, getCategoryBadgeStyle } from '../utils/indianFestivals';
import { checkFridayFestivalCoincidence } from '../utils/coincidenceAlert';
import { isTaskVisibleInMode } from '../utils/taskFilter';
import { getEventsForDateAndMode } from '../utils/eventUtils';
import { getLiturgicalSeason, getChristianObservancesForDate } from '../utils/christianData';
import {
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  MapPin,
  Sparkles,
  CalendarCheck,
  BookOpen,
  AlertOctagon,
} from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: CalendarTask[];
  filters: CalendarFilterSettings;
  language: Language;
  onOpenCreateEventOnDateAndTime: (dateStr: string, timeStr: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectFestival: (festival: IndianFestival) => void;
  onSelectIslamic: (occasion: IslamicOccasion) => void;
  onToggleTask: (taskId: string) => void;
  onOpenNewTask: () => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  tasks,
  filters,
  language,
  onOpenCreateEventOnDateAndTime,
  onSelectEvent,
  onSelectFestival,
  onSelectIslamic,
  onToggleTask,
  onOpenNewTask,
}) => {
  const t = translations[language];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const dayOfWeekIndex = currentDate.getDay();
  const hijri = getHijriDate(currentDate, filters.hijriAdjustmentDays);
  const moon = getMoonPhase(currentDate);

  const isMuslimMode = filters.calendarMode === 'muslim';
  const isHinduMode = filters.calendarMode === 'hindu';
  const isChristianMode = filters.calendarMode === 'christian';

  let dayFestivals: IndianFestival[] = [];
  if (isMuslimMode) {
    dayFestivals = [];
  } else if (isHinduMode) {
    dayFestivals = getFestivalsForDate(
      dateStr,
      filters.selectedState,
      filters.enabledCategories,
      filters.showGazettedOnly
    ).filter((f) => f.category === 'hindu' || f.category === 'national');
  } else if (isChristianMode) {
    dayFestivals = getFestivalsForDate(
      dateStr,
      filters.selectedState,
      filters.enabledCategories,
      filters.showGazettedOnly
    ).filter((f) => f.category === 'christian' || f.category === 'national');
  }

  const islamicOccasion = isMuslimMode
    ? getIslamicOccasionForDate(currentDate, filters.hijriAdjustmentDays)
    : null;
  const fridayAlert = isMuslimMode ? checkFridayFestivalCoincidence(currentDate) : null;

  const liturgicalSeason = isChristianMode ? getLiturgicalSeason(currentDate) : null;
  const christianObservances = isChristianMode
    ? getChristianObservancesForDate(currentDate).filter(
        (obs) => !dayFestivals.some((f) => f.nameEn.toLowerCase() === obs.name.toLowerCase())
      )
    : [];

  // Events for this date (supporting recurring events and mode filtering)
  const dayEvents = getEventsForDateAndMode(events, dateStr, filters.calendarMode);

  // Tasks due this date (Strictly mode-filtered)
  const dayTasks = tasks.filter(
    (task) => task.dueDate === dateStr && isTaskVisibleInMode(task, filters.calendarMode)
  );

  const hours = Array.from({ length: 18 }).map((_, i) => i + 6); // 6 AM to 11 PM

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
      
      {/* 🚨 Friday & Holi Coincidence Red Alert Banner */}
      {fridayAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 border border-red-400 text-white shadow-xl flex items-start gap-3 animate-pulse">
          <AlertOctagon className="w-6 h-6 text-red-200 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-sm flex items-center gap-2">
              <span>🚨 {language === 'ur' ? 'خاص انتباہ: جمعۃ المبارک اور ہولی کا اتفاق' : language === 'hinglish' ? 'Alert: Jumma & Holi Ek Sath' : 'Special Advisory: Jummah & Holi Coincidence'}</span>
            </div>
            <p className="text-xs text-red-100 mt-1 leading-relaxed font-medium">
              {language === 'ur' ? fridayAlert.warningUr : language === 'hinglish' ? fridayAlert.warningHinglish : fridayAlert.warningEn}
            </p>
          </div>
        </div>
      )}

      {/* Day Overview Hero Card */}
      <div
        className={`rounded-3xl p-6 relative overflow-hidden transition-colors ${
          isChristianMode
            ? 'bg-gradient-to-br from-[#FCFBF8] via-[#F3F8FE] to-[#EAF1FA] dark:from-[#0E1B33] dark:via-[#11203D] dark:to-[#0B1528] border border-[#E4DDD0] dark:border-slate-700/80 text-[#10203B] dark:text-[#FAF7F0] shadow-[0_8px_28px_-12px_rgba(20,40,75,0.1)]'
            : 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-amber-900 text-white shadow-lg'
        }`}
      >
        {/* Background glow & aesthetic motifs */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 ${
                isChristianMode
                  ? 'text-[#8C6418] dark:text-amber-300'
                  : 'text-indigo-200'
              }`}
            >
              <span>{t.days[dayOfWeekIndex]}</span>
              <span>·</span>
              <span className="font-mono-tabular">{dateStr}</span>
              {isChristianMode && dayOfWeekIndex === 0 && (
                <>
                  <span>·</span>
                  <span className="text-[#1E40AF] dark:text-sky-300">The Lord&apos;s Day</span>
                </>
              )}
            </div>
            <h1
              className={
                isChristianMode
                  ? 'font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#10203B] dark:text-[#FAF7F0]'
                  : 'text-2xl sm:text-3xl font-extrabold tracking-tight'
              }
            >
              {t.months[month]} {day}, {year}
            </h1>
            
            {isChristianMode && liturgicalSeason ? (
              <div className="flex items-center gap-2 flex-wrap mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: liturgicalSeason.colorHex }}
                />
                <span className="font-semibold text-[#14284B] dark:text-sky-200">
                  {liturgicalSeason.seasonName}
                </span>
                <span aria-hidden="true">·</span>
                <span>{liturgicalSeason.spiritualFocus}</span>
              </div>
            ) : (
              /* Hijri Banner (Hindu & Muslim modes preserved) */
              <div className="flex items-center gap-2 mt-2 text-amber-200 text-sm font-semibold">
                <span className="text-base">{moon.icon}</span>
                <span>
                  {language === 'en'
                    ? hijri.formattedEn
                    : language === 'ur'
                    ? hijri.formattedUr
                    : hijri.formattedHi}
                </span>
                <span className="text-xs text-amber-300/80 font-normal">
                  ({language === 'en' ? moon.nameEn : language === 'ur' ? moon.nameUr : moon.nameHi})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCreateEventOnDateAndTime(dateStr, '09:00')}
              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                isChristianMode
                  ? 'bg-[#14284B] hover:bg-[#1E3A6E] text-white dark:bg-sky-600 dark:hover:bg-sky-500'
                  : 'bg-white text-indigo-900 hover:bg-indigo-50 shadow-md'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{t.actions.addEvent}</span>
            </button>
            <button
              onClick={onOpenNewTask}
              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                isChristianMode
                  ? 'bg-white/90 hover:bg-white text-[#14284B] border border-[#DED8CA] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700'
                  : 'bg-emerald-500/90 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{t.actions.addTask}</span>
            </button>
          </div>
        </div>

        {/* Highlighted Occasions on this day */}
        {(islamicOccasion || dayFestivals.length > 0 || christianObservances.length > 0) && (
          <div
            className={`mt-5 pt-4 border-t flex flex-wrap gap-2.5 ${
              isChristianMode
                ? 'border-[#E4DDD0] dark:border-slate-700/80'
                : 'border-white/10'
            }`}
          >
            {islamicOccasion && (
              <div
                onClick={() => onSelectIslamic(islamicOccasion)}
                className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400/40 rounded-xl px-3 py-2 cursor-pointer transition-all flex items-center gap-2 text-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <div>
                  <div className="font-bold text-emerald-100">
                    {language === 'en' ? islamicOccasion.nameEn : islamicOccasion.nameHi}
                  </div>
                  <div className="text-[10px] text-emerald-300/90 line-clamp-1">
                    {islamicOccasion.spiritualSignificance}
                  </div>
                </div>
              </div>
            )}

            {christianObservances.map((obs) => (
              <div
                key={obs.id}
                className="bg-[#FBF4E4] dark:bg-amber-950/40 border border-[#E6D3A3] dark:border-amber-700/60 rounded-xl px-3.5 py-2 flex items-center gap-2.5 text-xs"
              >
                <BookOpen className="w-4 h-4 text-[#8C6418] dark:text-amber-300 shrink-0" />
                <div>
                  <div className="font-bold text-[#14284B] dark:text-amber-200">{obs.name}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                    {obs.description}
                  </div>
                </div>
              </div>
            ))}

            {dayFestivals.map((fest) => (
              <div
                key={fest.id}
                onClick={() => onSelectFestival(fest)}
                className={
                  isChristianMode
                    ? 'bg-white/90 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-[#D8E2F0] dark:border-sky-800/60 rounded-xl px-3.5 py-2 cursor-pointer transition-all flex items-center gap-2.5 text-xs'
                    : 'bg-black/30 hover:bg-black/40 border border-amber-300/40 rounded-xl px-3 py-2 cursor-pointer transition-all flex items-center gap-2 text-xs'
                }
              >
                <BookOpen
                  className={`w-4 h-4 shrink-0 ${
                    isChristianMode ? 'text-[#1E3A6E] dark:text-sky-300' : 'text-amber-300'
                  }`}
                />
                <div>
                  <div
                    className={`font-bold ${
                      isChristianMode ? 'text-[#14284B] dark:text-sky-200' : 'text-amber-100'
                    }`}
                  >
                    {isChristianMode ? fest.nameEn : language === 'en' ? fest.nameEn : fest.nameHi}
                  </div>
                  <div
                    className={`text-[10px] line-clamp-1 ${
                      isChristianMode ? 'text-slate-600 dark:text-slate-300' : 'text-amber-200/90'
                    }`}
                  >
                    {fest.significance}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Hourly Schedule + Tasks Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Hourly Timeline (2 columns on wide screens) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>{t.events.title}</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {dayEvents.length} scheduled
            </span>
          </div>

          <div className="space-y-1">
            {hours.map((hour) => {
              const timeLabel = `${String(hour).padStart(2, '0')}:00`;
              const slotEvents = dayEvents.filter((e) => {
                if (!e.startTime) return false;
                const h = parseInt(e.startTime.split(':')[0], 10);
                return h === hour;
              });

              return (
                <div
                  key={hour}
                  className="flex items-start gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80 group"
                >
                  <div className="w-14 text-right text-xs font-bold text-slate-400 py-1">
                    {timeLabel}
                  </div>

                  <div
                    onClick={() => onOpenCreateEventOnDateAndTime(dateStr, timeLabel)}
                    className="flex-1 min-h-[44px] rounded-xl p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    {slotEvents.length === 0 ? (
                      <div className="text-[11px] text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 flex items-center gap-1 font-medium pt-1">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Click to add event at {timeLabel}</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {slotEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectEvent(evt);
                            }}
                            className="p-2 rounded-xl text-white shadow-sm flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform"
                            style={{ backgroundColor: evt.color || '#4f46e5' }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-black/20">
                                {evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}
                              </span>
                              <span className="text-xs font-bold">{evt.title}</span>
                            </div>
                            {evt.location && (
                              <div className="flex items-center gap-1 text-[11px] opacity-80">
                                <MapPin className="w-3 h-3" />
                                <span>{evt.location}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks & Day Focus Column */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-500" />
                <span>{t.tasks.title}</span>
              </h2>
              <button
                onClick={onOpenNewTask}
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{t.actions.addTask}</span>
              </button>
            </div>

            <div className="space-y-2">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    task.completed
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-xs font-bold leading-snug ${
                        task.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                      {task.dueTime && <span>🕒 {task.dueTime}</span>}
                      <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-semibold">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {dayTasks.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  {t.tasks.emptyState}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
