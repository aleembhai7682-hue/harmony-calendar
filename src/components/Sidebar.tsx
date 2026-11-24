import React, { useState } from 'react';
import {
  CalendarFilterSettings,
  CalendarTask,
  Language,
  IndianFestival,
  IslamicOccasion,
} from '../types/calendar';
import { translations, INDIAN_STATES } from '../translations/i18n';
import { getCategoryBadgeStyle } from '../utils/indianFestivals';
import { getDailyWisdom } from '../utils/hijri';
import { filterTasksByMode } from '../utils/taskFilter';
import {
  CheckCircle2,
  Circle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Compass,
  Moon,
  Globe,
  CalendarCheck2,
} from 'lucide-react';
import {
  getLocaleTag,
  resolveWeekStartDay,
  getWeekdayOrder,
  formatDateLocalized,
  formatNumberLocalized,
} from '../utils/localization';
import { getCountryHolidaySummary } from '../utils/globalHolidays';
import { getConfirmedCountryCode } from '../utils/storage';
import { getModeTheme } from '../utils/modeTheme';

interface SidebarProps {
  currentDate: Date;
  onSelectDate: (d: Date) => void;
  filters: CalendarFilterSettings;
  onFilterChange: (newFilters: CalendarFilterSettings) => void;
  tasks: CalendarTask[];
  onToggleTask: (taskId: string) => void;
  onOpenNewTask: () => void;
  language: Language;
  upcomingFestivals: IndianFestival[];
  upcomingIslamic: IslamicOccasion[];
  onSelectFestival: (fest: IndianFestival) => void;
  onSelectIslamic: (occ: IslamicOccasion) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentDate,
  onSelectDate,
  filters,
  onFilterChange,
  tasks,
  onToggleTask,
  onOpenNewTask,
  language,
  upcomingFestivals,
  upcomingIslamic,
  onSelectFestival,
  onSelectIslamic,
}) => {
  const t = translations[language];
  const [miniCalMonth, setMiniCalMonth] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));

  // Mini calendar helpers
  const miniYear = miniCalMonth.getFullYear();
  const miniMonthIndex = miniCalMonth.getMonth();
  const daysInMiniMonth = new Date(miniYear, miniMonthIndex + 1, 0).getDate();
  const locale = getLocaleTag(language, filters.selectedCountryCode);
  const weekStartDay = resolveWeekStartDay(filters.weekStartDay, filters.selectedCountryCode);
  const weekdayOrder = getWeekdayOrder(weekStartDay);
  const firstDayRaw = new Date(miniYear, miniMonthIndex, 1).getDay();
  const firstDayOfWeek = (firstDayRaw - weekStartDay + 7) % 7;

  const handleMiniMonthChange = (offset: number) => {
    setMiniCalMonth(new Date(miniYear, miniMonthIndex + offset, 1));
  };

  const confirmedCountryCode = getConfirmedCountryCode(filters);

  const handleHijriOffsetChange = (val: number) => {
    onFilterChange({
      ...filters,
      hijriAdjustmentDays: Math.min(2, Math.max(-2, val)),
    });
  };

  const dailyWisdom = getDailyWisdom(currentDate);

  const isChristianMode = filters.calendarMode === 'christian';
  const modeTheme = getModeTheme(filters.calendarMode);

  return (
    <aside
      className={`w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-4 p-4 sm:p-5 overflow-y-auto transition-colors rounded-2xl border shadow-xs ${modeTheme.cardSurface} ${modeTheme.cardBorder} text-slate-800 dark:text-slate-200`}
    >
      
      {/* Mini Calendar Widget */}
      <div
        className={`rounded-2xl p-4 border shadow-xs ${modeTheme.cardSubSurface} ${modeTheme.cardBorder}`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs uppercase tracking-wider font-bold ${modeTheme.accentText}`}>
            {t.months[miniMonthIndex]} {formatNumberLocalized(miniYear, locale)}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleMiniMonthChange(-1)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleMiniMonthChange(1)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {weekdayOrder.map((dow) => (
            <span key={dow} className="text-[10px] font-bold text-slate-400">
              {t.daysMin[dow]}
            </span>
          ))}
        </div>

        {/* Mini Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-7 w-7" />
          ))}
          {Array.from({ length: daysInMiniMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected =
              currentDate.getDate() === dayNum &&
              currentDate.getMonth() === miniMonthIndex &&
              currentDate.getFullYear() === miniYear;

            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() === miniMonthIndex &&
              new Date().getFullYear() === miniYear;

            return (
              <button
                key={dayNum}
                onClick={() => onSelectDate(new Date(miniYear, miniMonthIndex, dayNum))}
                className={`h-7 w-7 rounded-lg text-xs font-semibold font-mono-tabular flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? `${modeTheme.todayCircle} font-bold`
                    : isToday
                    ? `border ${modeTheme.cardBorder} ${modeTheme.accentTextMuted} font-bold bg-white/60 dark:bg-black/20`
                    : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* Regional State Holidays Selector (India) or Active Country Holiday Notice */}
      {(() => {
        const countrySummary = getCountryHolidaySummary(confirmedCountryCode);
        if (confirmedCountryCode === 'IN') {
          return (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Compass className={`w-3.5 h-3.5 ${modeTheme.accentText}`} />
                  <span>Regional Holidays & State</span>
                </span>
              </div>
              <select
                value={filters.selectedState}
                onChange={(e) => onFilterChange({ ...filters, selectedState: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl ${modeTheme.cardSubSurface} border ${modeTheme.cardBorder} text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${modeTheme.focusRing}`}
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.nameEn} ({st.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          );
        }
        return (
          <div className={`rounded-xl p-3 ${modeTheme.cardSubSurface} border ${modeTheme.cardBorder} text-[11px] text-slate-600 dark:text-slate-300 space-y-1`}>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Globe className={`w-3.5 h-3.5 shrink-0 ${modeTheme.accentText}`} />
              <span>
                {countrySummary.countryName ? `${countrySummary.countryName} Holidays` : 'Global Holidays'}
              </span>
            </div>
            <p className="leading-relaxed text-[10.5px] opacity-90">{countrySummary.notice}</p>
          </div>
        );
      })()}

      {/* Hijri Moon Sighting Adjustment - visible in Muslim Mode */}
      {filters.calendarMode === 'muslim' && (
        <div className={`${modeTheme.cardSubSurface} rounded-2xl p-3.5 border ${modeTheme.cardBorder}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Moon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Hijri Moon Offset</span>
            </div>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/40">
              {filters.hijriAdjustmentDays > 0
                ? `+${filters.hijriAdjustmentDays} Day`
                : filters.hijriAdjustmentDays < 0
                ? `${filters.hijriAdjustmentDays} Day`
                : '0 (Default)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
            Adjust Hijri calendar by ±1 or ±2 days for regional moon sightings.
          </p>
          <div className="flex items-center gap-1 justify-center">
            {[-2, -1, 0, 1, 2].map((val) => (
              <button
                key={val}
                onClick={() => handleHijriOffsetChange(val)}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filters.hijriAdjustmentDays === val
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white dark:bg-[#0B1914] text-slate-700 dark:text-slate-300 border border-[#D5E4DC] dark:border-[#1B382E] hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                {val > 0 ? `+${val}` : val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Occasions Spotlight - Segregated by Mode */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Sparkles className={`w-3.5 h-3.5 ${modeTheme.accentTextMuted}`} />
          <span>
            {filters.calendarMode === 'muslim'
              ? 'Upcoming Islamic Occasions'
              : filters.calendarMode === 'hindu'
              ? 'Upcoming Hindu Festivals & Fasts'
              : 'Upcoming Christian Feasts & Sundays'}
          </span>
        </div>

        <div className="space-y-2">
          {/* Islamic Mode Occasions */}
          {filters.calendarMode === 'muslim' &&
            upcomingIslamic.slice(0, 4).map((occ) => (
              <div
                key={occ.id}
                onClick={() => onSelectIslamic(occ)}
                className="p-2.5 rounded-xl border border-[#D5E4DC] dark:border-[#1B382E] bg-[#F1F8F4] dark:bg-emerald-950/40 cursor-pointer hover:shadow-xs transition-all group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
                  <span>{formatDateLocalized(occ.estimatedDate, filters.dateFormat || 'auto', locale, 'medium')}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/40 font-bold">
                    {occ.hijriDay}{' '}
                    {occ.hijriMonth === 9
                      ? 'Ramadan'
                      : occ.hijriMonth === 10
                      ? 'Shawwal'
                      : occ.hijriMonth === 12
                      ? 'Dhul Hijjah'
                      : 'Hijri'}
                  </span>
                </div>
                <div className="text-xs font-bold text-emerald-950 dark:text-emerald-100 group-hover:underline">
                  {occ.nameEn}
                </div>
                <div className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 line-clamp-1 mt-0.5">
                  {occ.spiritualSignificance}
                </div>
              </div>
            ))}

          {/* Hindu Mode Festivals */}
          {filters.calendarMode === 'hindu' &&
            upcomingFestivals
              .filter((f) => f.category === 'hindu' || f.category === 'national')
              .slice(0, 4)
              .map((f) => {
                const style = getCategoryBadgeStyle(f.category);
                return (
                  <div
                    key={f.id}
                    onClick={() => onSelectFestival(f)}
                    className={`p-2.5 rounded-xl border ${style.border} ${style.bg} cursor-pointer hover:shadow-xs transition-all group`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                      <span>{formatDateLocalized(f.date, filters.dateFormat || 'auto', locale, 'medium')}</span>
                      <span className="capitalize text-[10px] px-1.5 py-0.2 rounded bg-white/75 dark:bg-black/30 font-bold">
                        {f.category}
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${style.text} group-hover:underline`}>
                      {f.nameEn}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {f.descriptionEn}
                    </div>
                  </div>
                );
              })}

          {/* Christian Mode Festivals & Sundays */}
          {filters.calendarMode === 'christian' &&
            upcomingFestivals
              .filter((f) => f.category === 'christian' || f.category === 'national')
              .slice(0, 4)
              .map((f) => (
                <div
                  key={f.id}
                  onClick={() => onSelectFestival(f)}
                  className="p-3 rounded-xl border border-[#E4DDD0] dark:border-slate-700/80 bg-gradient-to-br from-white to-[#F7F9FD] dark:from-[#101D36] dark:to-[#0C1629] cursor-pointer hover:border-[#C69C44]/60 dark:hover:border-sky-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono-tabular text-slate-500 dark:text-slate-400 mb-1">
                    <span>{formatDateLocalized(f.date, filters.dateFormat || 'auto', locale, 'medium')}</span>
                    <span className="capitalize font-sans text-[10px] font-semibold text-[#8C6418] dark:text-amber-300">
                      {f.category === 'christian' ? 'Christian Observance' : 'Public Holiday'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#14284B] dark:text-sky-200 group-hover:underline">
                    {f.nameEn}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {f.descriptionEn}
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Personal Tasks Widget */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <CalendarCheck2 className={`w-3.5 h-3.5 ${modeTheme.accentText}`} />
            <span>Personal To-Do List</span>
          </span>
          <button
            onClick={onOpenNewTask}
            className={`p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:${modeTheme.accentText} cursor-pointer`}
            title="Add New Task"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5">
          {(() => {
            const visibleTasks = filterTasksByMode(tasks, filters.calendarMode);
            if (visibleTasks.length === 0) {
              return (
                <div className="text-[11px] text-slate-400 text-center py-2">
                  {filters.calendarMode === 'muslim'
                    ? 'No pending Islamic or lifestyle tasks'
                    : filters.calendarMode === 'hindu'
                    ? 'No pending Hindu or lifestyle tasks'
                    : 'No pending Christian or lifestyle tasks'}
                </div>
              );
            }
            return visibleTasks.slice(0, 6).map((task) => (
              <div
                key={task.id}
                className={`flex items-start gap-2 p-2 rounded-xl border transition-all ${modeTheme.cardBorder} ${
                  task.completed
                    ? `${modeTheme.cardSubSurface} opacity-60`
                    : `${modeTheme.cardSubSurface} hover:brightness-98 dark:hover:brightness-110`
                }`}
              >
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`mt-0.5 text-slate-400 transition-colors cursor-pointer ${modeTheme.accentText}`}
                >
                  {task.completed ? (
                    <CheckCircle2 className={`w-4 h-4 ${modeTheme.accentText}`} />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-semibold leading-snug line-clamp-1 ${
                      task.completed
                        ? 'line-through text-slate-400'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{task.dueDate}</span>
                    {task.priority === 'high' && (
                      <span className="text-red-500 font-bold">• High</span>
                    )}
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

    </aside>
  );
};
