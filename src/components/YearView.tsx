import React from 'react';
import {
  CalendarEvent,
  CalendarFilterSettings,
  Language,
} from '../types/calendar';
import { translations } from '../translations/i18n';
import { getFestivalsForDate, getCategoryBadgeStyle } from '../utils/indianFestivals';
import { getIslamicOccasionForDate } from '../utils/hijri';
import { getChristianObservancesForDate } from '../utils/christianData';

interface YearViewProps {
  currentDate: Date;
  onSelectDate: (d: Date) => void;
  onNavigateToMonth: (year: number, month: number) => void;
  events: CalendarEvent[];
  filters: CalendarFilterSettings;
  language: Language;
}

export const YearView: React.FC<YearViewProps> = ({
  currentDate,
  onSelectDate,
  onNavigateToMonth,
  events,
  filters,
  language,
}) => {
  const t = translations[language];
  const year = currentDate.getFullYear();

  const months = Array.from({ length: 12 }).map((_, i) => i);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  const isChristianModeView = filters.calendarMode === 'christian';

  return (
    <div
      className={`flex-1 overflow-y-auto p-4 sm:p-6 rounded-2xl ${
        isChristianModeView
          ? 'bg-[#FAF8F3]/70 dark:bg-[#080F1E]/70'
          : 'bg-slate-50 dark:bg-slate-950'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className={
                isChristianModeView
                  ? 'font-editorial text-3xl sm:text-4xl font-semibold text-[#10203B] dark:text-[#FAF7F0]'
                  : 'text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white'
              }
            >
              {year}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isChristianModeView
                ? 'Annual overview of Christian feasts, liturgical observances, national holidays, and scheduled events'
                : language === 'en'
                ? 'Overview of festivals, Islamic occasions, and scheduled events across the year'
                : 'वर्ष भर के प्रमुख त्यौहार, इस्लामी पर्व और निर्धारित कार्यक्रमों का दृश्य'}
            </p>
          </div>
        </div>

        {/* 12 Months Grid (3x4 or 4x3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {months.map((monthIndex) => {
            const firstDay = new Date(year, monthIndex, 1).getDay();
            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

            return (
              <div
                key={monthIndex}
                onClick={() => onNavigateToMonth(year, monthIndex)}
                className={`rounded-2xl p-4 border transition-all cursor-pointer group ${
                  isChristianModeView
                    ? 'bg-[#FCFBF8] dark:bg-[#0D182D] border-[#E4DDD0] dark:border-slate-800 hover:border-[#C69C44]/70 dark:hover:border-sky-500/60 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                {/* Month Name */}
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className={`text-sm transition-colors ${
                      isChristianModeView
                        ? 'font-editorial text-base font-semibold text-[#14284B] dark:text-[#FAF7F0] group-hover:text-[#1E40AF] dark:group-hover:text-sky-300'
                        : 'font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    }`}
                  >
                    {t.months[monthIndex]}
                  </h3>
                  <span className="text-[10px] font-mono-tabular text-slate-400 font-bold uppercase">
                    {monthIndex + 1}
                  </span>
                </div>

                {/* Days of week */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {t.daysMin.map((d, i) => (
                    <span key={i} className="text-[10px] font-bold text-slate-400">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-6 w-6" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(
                      dayNum
                    ).padStart(2, '0')}`;
                    const isToday = dateStr === todayStr;

                    const isMuslimMode = filters.calendarMode === 'muslim';
                    const isHinduMode = filters.calendarMode === 'hindu';
                    const isChristianMode = filters.calendarMode === 'christian';

                    let dayFestivals: ReturnType<typeof getFestivalsForDate> = [];
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

                    const cellDateObj = new Date(year, monthIndex, dayNum);
                    const islamicOccasion = isMuslimMode
                      ? getIslamicOccasionForDate(cellDateObj, filters.hijriAdjustmentDays)
                      : null;
                    const hasChristianObs =
                      isChristianMode && getChristianObservancesForDate(cellDateObj).length > 0;
                    const hasEvents = events.some((e) => e.startDate === dateStr);

                    return (
                      <div
                        key={dayNum}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDate(cellDateObj);
                        }}
                        className={`h-6 w-6 mx-auto rounded-md flex flex-col items-center justify-center relative font-mono-tabular font-semibold transition-all ${
                          isToday
                            ? isChristianMode
                              ? 'bg-[#14284B] dark:bg-sky-500 text-white font-bold'
                              : 'bg-indigo-600 text-white font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-[11px]">{dayNum}</span>

                        {/* Dot indicator for festival or event */}
                        <div className="flex items-center gap-0.5 absolute -bottom-0.5">
                          {islamicOccasion && (
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          )}
                          {hasChristianObs && (
                            <span className="w-1 h-1 rounded-full bg-[#C69C44]" />
                          )}
                          {dayFestivals.length > 0 && (
                            <span
                              className="w-1 h-1 rounded-full"
                              style={{
                                backgroundColor: getCategoryBadgeStyle(dayFestivals[0].category).dotColor,
                              }}
                            />
                          )}
                          {hasEvents && <span className="w-1 h-1 rounded-full bg-indigo-500" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
