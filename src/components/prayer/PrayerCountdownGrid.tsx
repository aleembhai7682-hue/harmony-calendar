import React from 'react';
import { Clock, CheckCircle2, Circle } from 'lucide-react';
import { Language, PrayerTimes } from '../../types/calendar';
import { formatTimePreference, TimeFormatOption } from '../../utils/localization';
import { DetailedPrayerInfo } from '../../utils/prayerTimes';
import { PrayerDayRecord, PrayerId } from '../../utils/prayerHistory';
import { PrayerWindowPieChart } from './PrayerWindowPieChart';

export interface PrayerSlot {
  id: PrayerId;
  nameEn: string;
  nameHinglish: string;
  nameUr: string;
  nameAr: string;
  timeStr: string;
  minutesFromMidnight: number;
  isJummah?: boolean;
}

interface PrayerCountdownGridProps {
  language: Language;
  slots: PrayerSlot[];
  nextPrayer: PrayerSlot;
  isTomorrowFajr: boolean;
  countdownFormatted: string;
  intervalProgressPct: number;
  prayerTimes: PrayerTimes;
  prayerData: DetailedPrayerInfo;
  timeFormat: TimeFormatOption;
  selectedCountryCode?: string;
  dayRecord?: PrayerDayRecord;
  onTogglePrayer?: (prayerId: PrayerId) => void;
}

export const PrayerCountdownGrid: React.FC<PrayerCountdownGridProps> = ({
  language,
  slots,
  nextPrayer,
  isTomorrowFajr,
  countdownFormatted,
  intervalProgressPct,
  prayerTimes,
  prayerData,
  timeFormat,
  selectedCountryCode,
  dayRecord,
  onTogglePrayer,
}) => {
  const nextPrayerLabel =
    language === 'ur'
      ? nextPrayer.nameUr
      : language === 'hinglish'
      ? nextPrayer.nameHinglish
      : nextPrayer.nameEn;

  const nextIdx = slots.findIndex((s) => s.id === nextPrayer.id);
  const prevSlot = isTomorrowFajr
    ? slots[slots.length - 1]
    : nextIdx > 0
    ? slots[nextIdx - 1]
    : slots[slots.length - 1];
  const prevPrayerLabel = prevSlot
    ? language === 'ur'
      ? prevSlot.nameUr
      : prevSlot.nameEn
    : 'Isha';

  const formattedNextTime = formatTimePreference(
    nextPrayer.timeStr,
    timeFormat,
    selectedCountryCode
  );

  const [hh = '00', mm = '00', ss = '00'] = countdownFormatted.split(':');

  return (
    <>
      {/* Next Prayer Countdown + D3 Window Progress Pie Chart Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FCFDFC] via-[#F2F8F4] to-[#E8F3EC] dark:from-[#0E211A] dark:via-[#0B1914] dark:to-[#08130F] border border-[#D5E4DC] dark:border-[#1B382E] shadow-xs dark:shadow-lg">
        <div className="p-4 sm:p-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30 dark:border-emerald-400/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase font-bold text-emerald-800 dark:text-emerald-300/95 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                <span>{language === 'ur' ? 'اگلی نماز' : 'Next Prayer'}</span>
                {isTomorrowFajr && (
                  <span className="text-[10px] normal-case font-semibold text-teal-800 dark:text-teal-200 bg-[#EAF7F2] dark:bg-teal-950/70 px-2 py-0.5 rounded-full border border-[#BCE0D2] dark:border-teal-600/50">
                    {language === 'ur' ? 'کل صبح' : 'Tomorrow'}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2.5 flex-wrap">
                <span className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-white tracking-tight">
                  {nextPrayerLabel}
                </span>
                <span className="font-serif text-base text-emerald-800 dark:text-emerald-400/90">
                  {nextPrayer.nameAr}
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold text-emerald-900 dark:text-emerald-200 bg-[#EFF6F2] dark:bg-[#10231C] px-2.5 py-0.5 rounded-lg border border-[#C6DDD1] dark:border-[#1B382E]">
                  {formattedNextTime}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full xl:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between xl:justify-end gap-3">
            {/* D3 SVG Prayer Window Progress Pie Chart */}
            <PrayerWindowPieChart
              progressPct={intervalProgressPct}
              prevPrayerLabel={prevPrayerLabel}
              nextPrayerLabel={language === 'ur' ? nextPrayer.nameUr : nextPrayer.nameEn}
              remainingFormatted={countdownFormatted}
              language={language}
            />

            {/* Segmented Tabular Countdown */}
            <div className="flex items-center justify-between sm:justify-end gap-3 bg-[#EFF6F2]/90 dark:bg-[#08130F]/80 px-3.5 py-2.5 rounded-xl border border-[#D5E4DC] dark:border-[#1B382E]">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider sm:hidden">
                {language === 'ur' ? 'باقی وقت' : 'Starts In'}
              </span>
              <div className="flex items-center gap-1.5" aria-label={`Time remaining ${countdownFormatted}`}>
                {[
                  { val: hh, unit: language === 'ur' ? 'گھنٹے' : 'hrs' },
                  { val: mm, unit: language === 'ur' ? 'منٹ' : 'min' },
                  { val: ss, unit: language === 'ur' ? 'سیکنڈ' : 'sec' },
                ].map((seg, idx) => (
                  <React.Fragment key={seg.unit}>
                    <div className="flex flex-col items-center min-w-[42px] px-2 py-1 rounded-lg bg-[#FCFDFC] dark:bg-[#0E211A] border border-[#D5E4DC] dark:border-[#1B382E] shadow-xs">
                      <span className="text-lg sm:text-xl font-black font-mono tabular-nums text-emerald-800 dark:text-emerald-300 leading-none">
                        {seg.val}
                      </span>
                      <span className="text-[9px] uppercase font-semibold text-slate-500 dark:text-slate-400 mt-0.5 tracking-wider">
                        {seg.unit}
                      </span>
                    </div>
                    {idx < 2 && (
                      <span className="text-emerald-700/70 dark:text-emerald-500/70 font-black font-mono text-base -mt-2">:</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Interval Progress Bar */}
        <div className="h-1.5 w-full bg-[#D7EAE0] dark:bg-[#0B1C16] border-t border-[#C4DDD0] dark:border-teal-500/25">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300 transition-all duration-700"
            style={{ width: `${intervalProgressPct}%` }}
          />
        </div>
      </div>

      {/* 5 Daily Prayer Cards + Sehri Ends / Iftar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {slots.map((slot) => {
          const isNext = slot.id === nextPrayer.id && !isTomorrowFajr;
          const isCompleted = Boolean(dayRecord?.[slot.id]);
          return (
            <div
              key={slot.id}
              className={`p-3 rounded-2xl border transition-all ${
                isNext
                  ? 'bg-[#E6F4EC] dark:bg-emerald-900/45 border-emerald-600 dark:border-emerald-400 ring-1 ring-emerald-500/35 shadow-sm'
                  : isCompleted
                  ? 'bg-[#EDF8F2] dark:bg-[#0F2A21] border-emerald-500/70 dark:border-emerald-400/55 shadow-xs'
                  : 'bg-[#FCFDFC] dark:bg-[#10231C]/80 border-[#D5E4DC] dark:border-[#1B382E] hover:border-emerald-400/70 dark:hover:border-emerald-700 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                <span>{language === 'ur' ? slot.nameUr : slot.nameEn}</span>
                <span className="font-serif text-xs text-emerald-800 dark:text-emerald-300">{slot.nameAr}</span>
              </div>
              <div className="text-base font-black font-mono text-emerald-950 dark:text-white">
                {formatTimePreference(slot.timeStr, timeFormat, selectedCountryCode)}
              </div>
              <div className="flex items-center justify-between gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
                <span className="truncate">
                  {isNext
                    ? language === 'ur'
                      ? 'اگلی نماز'
                      : 'Up next'
                    : slot.isJummah
                    ? 'Jummah Adhan'
                    : 'Adhan Time'}
                </span>
                {onTogglePrayer && (
                  <button
                    type="button"
                    onClick={() => onTogglePrayer(slot.id)}
                    aria-pressed={isCompleted}
                    title={
                      isCompleted
                        ? language === 'ur'
                          ? 'مکمل شدہ — ہٹانے کے لیے کلک کریں'
                          : 'Completed — click to unmark'
                        : language === 'ur'
                        ? 'مکمل نشان زد کریں'
                        : 'Mark prayer completed'
                    }
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-700 dark:bg-emerald-400 text-white dark:text-emerald-950'
                        : 'bg-[#EFF6F2] dark:bg-[#0B1914] text-emerald-800 dark:text-teal-200 border border-[#C6DDD1] dark:border-teal-500/35 hover:bg-[#E1F0E8] dark:hover:bg-[#15352B]'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 shrink-0" />
                    )}
                    <span>{isCompleted ? (language === 'ur' ? 'ادا' : 'Done') : language === 'ur' ? 'نشان' : 'Log'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Sehri Ends — Soft Mint-Cream Dawn */}
        <div className="p-3 rounded-2xl bg-[#F2FAF6] dark:bg-[#0D211B] border border-[#BEE3D2] dark:border-teal-800/60 shadow-xs">
          <div className="text-[11px] font-bold text-teal-800 dark:text-teal-300 mb-1">
            {language === 'ur' ? 'سحری ختم (امساک)' : 'Sehri Ends'}
          </div>
          <div className="text-base font-black font-mono text-emerald-950 dark:text-teal-100">
            {formatTimePreference(prayerTimes.sehriEnds, timeFormat, selectedCountryCode)}
          </div>
          <div className="text-[10px] text-teal-800/80 dark:text-teal-300/80 mt-1">
            {language === 'ur' ? 'فجر سے 10 منٹ قبل' : '10 min before Fajr'}
          </div>
        </div>

        {/* Iftar Time — Deep Emerald-Teal Dusk */}
        <div className="p-3 rounded-2xl bg-[#EAF7F2] dark:bg-[#0B231E] border border-[#A8D8C6] dark:border-emerald-700/60 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">
            {language === 'ur' ? 'افطار کا وقت' : 'Iftar Time'}
          </div>
          <div className="text-base font-black font-mono text-emerald-950 dark:text-emerald-100">
            {formatTimePreference(prayerTimes.iftarTime, timeFormat, selectedCountryCode)}
          </div>
          <div className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 mt-1">
            {language === 'ur' ? 'وقتِ مغرب' : 'At Maghrib Adhan'}
          </div>
        </div>
      </div>

      {/* Subtle Adhan Astronomical Confirmation + Non-Intrusive Mosque Disclaimer */}
      <div className="px-3.5 py-2.5 rounded-xl bg-[#FCFDFC]/90 dark:bg-[#0B1914]/85 border border-[#D5E4DC] dark:border-[#1B382E] text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2 flex-wrap">
        <span className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-medium flex-wrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span>
            {language === 'ur'
              ? `Adhan فلکیاتی انجن سے حساب شدہ (${prayerData.methodShortName} • ${prayerData.asrShortName})`
              : `Calculated using Adhan astronomical engine (${prayerData.methodShortName} • ${prayerData.asrShortName})`}
          </span>
          {prayerData.offsetMinutes !== 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF7F2] dark:bg-teal-950/70 text-teal-800 dark:text-teal-200 border border-[#BCE0D2] dark:border-teal-700/50">
              {language === 'ur'
                ? `${prayerData.offsetMinutes > 0 ? `+${prayerData.offsetMinutes}` : prayerData.offsetMinutes} منٹ کی تبدیلی`
                : `Adjusted by ${prayerData.offsetMinutes > 0 ? `+${prayerData.offsetMinutes}` : prayerData.offsetMinutes} min`}
            </span>
          )}
        </span>
        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span>🕌</span>
          <span>
            {language === 'ur'
              ? 'حتمی اوقات کے لیے ہمیشہ اپنی مقامی مسجد سے تصدیق کریں۔'
              : 'Always confirm final times with your local mosque.'}
          </span>
        </span>
      </div>
    </>
  );
};
