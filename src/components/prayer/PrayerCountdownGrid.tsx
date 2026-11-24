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

  return (
    <>
      {/* Cleaner & More Prominent Next Prayer Countdown Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-800/80 to-emerald-950/90 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase font-bold text-emerald-300 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{language === 'ur' ? 'اگلی نماز کا وقت' : 'Next Prayer'}</span>
              {isTomorrowFajr && (
                <span className="text-[10px] normal-case font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-700/50">
                  {language === 'ur' ? 'کل صبح' : 'Tomorrow'}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-2.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {nextPrayerLabel}
              </span>
              <span className="text-sm sm:text-base font-mono font-extrabold text-emerald-200 bg-emerald-950/90 px-2.5 py-0.5 rounded-lg border border-emerald-700/60">
                {formattedNextTime}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-emerald-700/40">
          <div className="sm:text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {language === 'ur' ? 'باقی وقت' : 'Time Remaining'}
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-emerald-300 tracking-tight leading-tight">
              {countdownFormatted}
            </div>
          </div>
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
                  ? 'bg-emerald-900/50 border-emerald-400 ring-1 ring-emerald-400/50 shadow-md'
                  : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                <span>{language === 'ur' ? slot.nameUr : slot.nameEn}</span>
                <span className="font-serif text-xs text-emerald-400">{slot.nameAr}</span>
              </div>
              <div className="text-base font-black font-mono text-white">
                {formatTimePreference(slot.timeStr, timeFormat, selectedCountryCode)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
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
        <div className="p-3 rounded-2xl bg-amber-950/35 border border-amber-700/50">
          <div className="text-[11px] font-bold text-amber-300 mb-1">
            {language === 'ur' ? 'سحری ختم (امساک)' : 'Sehri Ends'}
          </div>
          <div className="text-base font-black font-mono text-amber-200">
            {formatTimePreference(prayerTimes.sehriEnds, timeFormat, selectedCountryCode)}
          </div>
          <div className="text-[10px] text-amber-300/80 mt-1">
            {language === 'ur' ? 'فجر سے 10 منٹ قبل' : '10 min before Fajr'}
          </div>
        </div>

        {/* Iftar Time */}
        <div className="p-3 rounded-2xl bg-rose-950/35 border border-rose-700/50">
          <div className="text-[11px] font-bold text-rose-300 mb-1">
            {language === 'ur' ? 'افطار کا وقت' : 'Iftar Time'}
          </div>
          <div className="text-base font-black font-mono text-rose-200">
            {formatTimePreference(prayerTimes.iftarTime, timeFormat, selectedCountryCode)}
          </div>
          <div className="text-[10px] text-rose-300/80 mt-1">
            {language === 'ur' ? 'وقتِ مغرب' : 'At Maghrib Adhan'}
          </div>
        </div>
      </div>

      {/* Subtle Adhan Astronomical Confirmation + Non-Intrusive Mosque Disclaimer */}
      <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/85 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between gap-2 flex-wrap">
        <span className="flex items-center gap-2 text-emerald-300/95 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            {language === 'ur'
              ? `Adhan فلکیاتی انجن سے حساب شدہ (${prayerData.methodShortName} • ${prayerData.asrShortName})`
              : `Calculated using Adhan astronomical engine (${prayerData.methodShortName} • ${prayerData.asrShortName})`}
          </span>
        </span>
        <span className="text-slate-400 flex items-center gap-1.5">
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
