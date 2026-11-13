import React, { useState } from 'react';
import {
  CalendarFilterSettings,
  CalendarTask,
  FestivalCategory,
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
  Info,
  CalendarCheck2,
  SlidersHorizontal,
} from 'lucide-react';

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
  const firstDayOfWeek = new Date(miniYear, miniMonthIndex, 1).getDay();

  const handleMiniMonthChange = (offset: number) => {
    setMiniCalMonth(new Date(miniYear, miniMonthIndex + offset, 1));
  };

  const categories: { key: FestivalCategory; label: string; dot: string }[] = [
    { key: 'hindu', label: t.categories.hindu, dot: '#d97706' },
    { key: 'islamic', label: t.categories.islamic, dot: '#059669' },
    { key: 'sikh', label: t.categories.sikh, dot: '#ea580c' },
    { key: 'christian', label: t.categories.christian, dot: '#e11d48' },
    { key: 'jain', label: t.categories.jain, dot: '#ca8a04' },
    { key: 'buddhist', label: t.categories.buddhist, dot: '#4f46e5' },
    { key: 'national', label: t.categories.national, dot: '#2563eb' },
  ];

  const handleCategoryToggle = (cat: FestivalCategory) => {
    onFilterChange({
      ...filters,
      enabledCategories: {
        ...filters.enabledCategories,
        [cat]: !filters.enabledCategories[cat],
      },
    });
  };

  const handleHijriOffsetChange = (val: number) => {
    onFilterChange({
      ...filters,
      hijriAdjustmentDays: Math.min(2, Math.max(-2, val)),
    });
  };

  const dailyWisdom = getDailyWisdom(currentDate);

  return (
    <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 overflow-y-auto">
      
      {/* Mini Calendar Widget */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t.months[miniMonthIndex]} {miniYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleMiniMonthChange(-1)}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleMiniMonthChange(1)}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {t.daysMin.map((d, i) => (
            <span key={i} className="text-[10px] font-bold text-slate-400">
              {d}
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
                className={`h-7 w-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : isToday
                    ? 'border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* Regional State Holidays Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-indigo-500" />
            <span>Regional Holidays & State</span>
          </span>
        </div>
        <select
          value={filters.selectedState}
          onChange={(e) => onFilterChange({ ...filters, selectedState: e.target.value })}
          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {INDIAN_STATES.map((st) => (
            <option key={st.code} value={st.code}>
              {st.nameEn} ({st.code.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Hijri Moon Sighting Adjustment - visible in Muslim Mode */}
      {filters.calendarMode === 'muslim' && (
        <div className="bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Moon className="w-3.5 h-3.5 text-emerald-500" />
              <span>Hijri Moon Offset</span>
            </div>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {filters.hijriAdjustmentDays > 0
                ? `+${filters.hijriAdjustmentDays} Day`
                : filters.hijriAdjustmentDays < 0
                ? `${filters.hijriAdjustmentDays} Day`
                : '0 (Default)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
            Adjust Hijri calendar by ±1 or ±2 days for regional moon sightings.
          </p>
          <div className="flex items-center gap-1 justify-center">
            {[-2, -1, 0, 1, 2].map((val) => (
              <button
                key={val}
                onClick={() => handleHijriOffsetChange(val)}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filters.hijriAdjustmentDays === val
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
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
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
                className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 cursor-pointer hover:shadow-xs transition-all group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-400 mb-0.5">
                  <span>{occ.estimatedDate}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold">
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
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 group-hover:underline">
                  {occ.nameEn}
                </div>
                <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 line-clamp-1 mt-0.5">
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
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                      <span>{f.date}</span>
                      <span className="capitalize text-[10px] px-1 rounded bg-white/70 dark:bg-black/30 font-bold">
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
              .map((f) => {
                const style = getCategoryBadgeStyle(f.category);
                return (
                  <div
                    key={f.id}
                    onClick={() => onSelectFestival(f)}
                    className={`p-2.5 rounded-xl border ${style.border} ${style.bg} cursor-pointer hover:shadow-xs transition-all group`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                      <span>{f.date}</span>
                      <span className="capitalize text-[10px] px-1 rounded bg-white/70 dark:bg-black/30 font-bold">
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
        </div>
      </div>

      {/* Personal Tasks Widget */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Personal To-Do List</span>
          </span>
          <button
            onClick={onOpenNewTask}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 cursor-pointer"
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
                className={`flex items-start gap-2 p-2 rounded-xl transition-all ${
                  task.completed
                    ? 'bg-slate-100/50 dark:bg-slate-800/40 opacity-60'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4" />
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
