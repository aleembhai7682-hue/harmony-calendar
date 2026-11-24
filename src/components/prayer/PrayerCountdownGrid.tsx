import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Language, PrayerTimes } from '../../types/calendar';
import { formatTimePreference, TimeFormatOption } from '../../utils/localization';
import { DetailedPrayerInfo } from '../../utils/prayerTimes';

export interface PrayerSlot {
  id: string;
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
}) => {
  const nextPrayerLabel =
    language === 'ur'
      ? nextPrayer.nameUr
      : language === 'hinglish'
      ? nextPrayer.nameHinglish
      : nextPrayer.nameEn;

  const formattedNextTime = formatTimePreference(
    nextPrayer.timeStr,
    timeFormat,
    selectedCountryCode
  );

  const [hh = '00', mm = '00', ss = '00'] = countdownFormatted.split(':');

  return (
    <>
      {/* Cleaner Next Prayer Countdown Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50/70 dark:from-emerald-950/90 dark:via-slate-900 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/35 shadow-sm dark:shadow-lg">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-400/35 flex items-center justify-center shrink-0 shadow-inner">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase font-bold text-emerald-700 dark:text-emerald-300/95 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span>{language === 'ur' ? 'اگلی نماز' : 'Next Prayer'}</span>
                {isTomorrowFajr && (
                  <span className="text-[10px] normal-case font-semibold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-600/50">
                    {language === 'ur' ? 'کل صبح' : 'Tomorrow'}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2.5 flex-wrap">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {nextPrayerLabel}
                </span>
                <span className="font-serif text-base text-emerald-700 dark:text-emerald-400/90">
                  {nextPrayer.nameAr}
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/90 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700/50">
                  {formattedNextTime}
                </span>
              </div>
            </div>
          </div>

          {/* Segmented Tabular Countdown */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 bg-emerald-50/90 dark:bg-slate-950/75 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
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
                  <div className="flex flex-col items-center min-w-[42px] px-2 py-1 rounded-lg bg-white dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-700/40 shadow-xs">
                    <span className="text-lg sm:text-xl font-black font-mono tabular-nums text-emerald-700 dark:text-emerald-300 leading-none">
                      {seg.val}
                    </span>
                    <span className="text-[9px] uppercase font-semibold text-slate-500 dark:text-slate-400 mt-0.5 tracking-wider">
                      {seg.unit}
                    </span>
                  </div>
                  {idx < 2 && (
                    <span className="text-emerald-600/70 dark:text-emerald-500/70 font-black font-mono text-base -mt-2">:</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Subtle Interval Progress Bar */}
        <div className="h-1 w-full bg-emerald-100 dark:bg-slate-950/80">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-700"
            style={{ width: `${intervalProgressPct}%` }}
          />
        </div>
      </div>

      {/* 5 Daily Prayer Cards + Sehri Ends / Iftar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {slots.map((slot) => {
          const isNext = slot.id === nextPrayer.id && !isTomorrowFajr;
          return (
            <div
              key={slot.id}
              className={`p-3 rounded-2xl border transition-all ${
                isNext
                  ? 'bg-emerald-100/80 dark:bg-emerald-900/50 border-emerald-500 dark:border-emerald-400 ring-1 ring-emerald-400/50 shadow-sm'
                  : 'bg-white/90 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-slate-600 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                <span>{language === 'ur' ? slot.nameUr : slot.nameEn}</span>
                <span className="font-serif text-xs text-emerald-700 dark:text-emerald-400">{slot.nameAr}</span>
              </div>
              <div className="text-base font-black font-mono text-slate-900 dark:text-white">
                {formatTimePreference(slot.timeStr, timeFormat, selectedCountryCode)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {isNext
                  ? language === 'ur'
                    ? 'اگلی نماز'
                    : 'Up next'
                  : slot.isJummah
                  ? 'Jummah Adhan'
                  : 'Adhan Time'}
              </div>
            </div>
          );
        })}

        {/* Sehri Ends */}
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-700/50 shadow-xs">
          <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">
            {language === 'ur' ? 'سحری ختم (امساک)' : 'Sehri Ends'}
          </div>
          <div className="text-base font-black font-mono text-amber-900 dark:text-amber-200">
            {formatTimePreference(prayerTimes.sehriEnds, timeFormat, selectedCountryCode)}
          </div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300/80 mt-1">
            {language === 'ur' ? 'فجر سے 10 منٹ قبل' : '10 min before Fajr'}
          </div>
        </div>

        {/* Iftar Time */}
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-700/50 shadow-xs">
          <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 mb-1">
            {language === 'ur' ? 'افطار کا وقت' : 'Iftar Time'}
          </div>
          <div className="text-base font-black font-mono text-rose-900 dark:text-rose-200">
            {formatTimePreference(prayerTimes.iftarTime, timeFormat, selectedCountryCode)}
          </div>
          <div className="text-[10px] text-rose-700 dark:text-rose-300/80 mt-1">
            {language === 'ur' ? 'وقتِ مغرب' : 'At Maghrib Adhan'}
          </div>
        </div>
      </div>

      {/* Subtle Adhan Astronomical Confirmation + Non-Intrusive Mosque Disclaimer */}
      <div className="px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/85 border border-emerald-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2 flex-wrap">
        <span className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300/95 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {language === 'ur'
              ? `Adhan فلکیاتی انجن سے حساب شدہ (${prayerData.methodShortName} • ${prayerData.asrShortName})`
              : `Calculated using Adhan astronomical engine (${prayerData.methodShortName} • ${prayerData.asrShortName})`}
          </span>
        </span>
        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span>🕌</span>
          <span>
            {language === 'ur'
              ? 'حتمی اوقات کے لیے ہمیشہ مقامی مسجد سے تصدیق کریں۔'
              : 'Always confirm with your local mosque.'}
          </span>
        </span>
      </div>
    </>
  );
};
