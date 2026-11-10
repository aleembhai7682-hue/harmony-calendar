import React from 'react';
import { IslamicOccasion, Language } from '../types/calendar';
import { translations } from '../translations/i18n';
import { HIJRI_MONTHS } from '../utils/hijri';
import confetti from 'canvas-confetti';
import { X, Moon, Sparkles, Plus, Calendar, Info, ShieldCheck } from 'lucide-react';

interface IslamicOccasionModalProps {
  occasion: IslamicOccasion | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAddToEvents?: (occ: IslamicOccasion) => void;
}

export const IslamicOccasionModal: React.FC<IslamicOccasionModalProps> = ({
  occasion,
  isOpen,
  onClose,
  language,
  onAddToEvents,
}) => {
  const t = translations[language];

  if (!isOpen || !occasion) return null;

  const monthMeta = HIJRI_MONTHS[occasion.hijriMonth - 1];

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      colors: ['#059669', '#34d399', '#f59e0b', '#fbbf24'],
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Islamic Hijri Occasion</span>
          </span>
          {occasion.isMajor && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              Major Islamic Holiday
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {language === 'ur'
            ? (occasion.nameUr || occasion.nameEn)
            : occasion.nameEn}
        </h1>

        {/* Subtitle & Arabic Calligraphy */}
        <div className="flex items-center justify-between mt-1 mb-4">
          <h2 className="text-base font-bold text-emerald-700 dark:text-emerald-400">
            {language === 'ur'
              ? occasion.nameEn
              : language === 'hinglish'
              ? (occasion.nameUr || occasion.nameHi)
              : occasion.nameHi}
          </h2>
          <div className="text-xl font-serif text-slate-700 dark:text-slate-300 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold tracking-wide" dir="rtl">
            {occasion.nameAr}
          </div>
        </div>

        {/* Hijri & Gregorian date info */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
              {language === 'ur' ? 'ہجری تاریخ' : 'Hijri Date'}
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {occasion.hijriDay} {language === 'ur' ? (monthMeta.nameUr || monthMeta.nameEn) : monthMeta.nameEn}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
              {language === 'ur' ? 'عیسوی تاریخ (تخمینہ)' : 'Gregorian Date (Approx.)'}
            </span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
              {occasion.estimatedDate}
            </span>
          </div>
        </div>

        {/* Moon sighting disclaimer banner */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-300 mb-4">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>{language === 'ur' ? 'رویتِ ہلال (چاند دیکھنا):' : 'Moon Sighting (Rukyat-e-Hilal):'}</strong>{' '}
            {language === 'ur'
              ? 'اسلامی تاریخ کا حتمی دارومدار مقامی رویتِ ہلال پر ہوتا ہے۔ آپ سائیڈ بار سے چاند کے حساب سے +1 یا -1 دن ایڈجسٹ کر سکتے ہیں۔'
              : 'The exact date of this Islamic occasion depends on the physical sighting of the lunar crescent by your regional Hilal Committee. You can adjust the date by +1/-1 day in the sidebar.'}
          </p>
        </div>

        {/* Spiritual Significance & Description */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {language === 'ur' ? 'روحانی فضیلت و اہمیت' : 'Spiritual Significance'}
            </h4>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 leading-relaxed bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
              🕊️ {occasion.spiritualSignificance}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {language === 'ur' ? 'تفصیل و تاریخ' : 'Overview & History'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'ur' ? (occasion.descriptionUr || occasion.descriptionEn) : occasion.descriptionEn}
            </p>
          </div>

          {/* Recommended Practices */}
          {occasion.practices && occasion.practices.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Recommended Sunnah & Spiritual Practices
              </h4>
              <ul className="space-y-1.5">
                {occasion.practices.map((practice, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleCelebrate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mubarak Greetings! 🌙</span>
          </button>

          {onAddToEvents && (
            <button
              onClick={() => {
                onAddToEvents(occasion);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add to My Schedule</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
