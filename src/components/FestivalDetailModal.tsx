import React from 'react';
import { IndianFestival, Language } from '../types/calendar';
import { translations, INDIAN_STATES } from '../translations/i18n';
import { getCategoryBadgeStyle } from '../utils/indianFestivals';
import confetti from 'canvas-confetti';
import { X, Sparkles, MapPin, Calendar, Heart, Plus } from 'lucide-react';

interface FestivalDetailModalProps {
  festival: IndianFestival | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAddToEvents?: (fest: IndianFestival) => void;
}

export const FestivalDetailModal: React.FC<FestivalDetailModalProps> = ({
  festival,
  isOpen,
  onClose,
  language,
  onAddToEvents,
}) => {
  const t = translations[language];

  if (!isOpen || !festival) return null;

  const badge = getCategoryBadgeStyle(festival.category);

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const stateNames = festival.applicableStates
    ? festival.applicableStates
        .map((code) => {
          const st = INDIAN_STATES.find((s) => s.code === code);
          return st ? (language === 'en' ? st.nameEn : st.nameHi) : code;
        })
        .join(', ')
    : language === 'en'
    ? 'All India (Nationwide)'
    : 'अखिल भारतीय (राष्ट्रीय स्तर पर)';

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
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${badge.bg} ${badge.text} border ${badge.border}`}
          >
            {festival.category} Festival
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {t.holidayTypes[festival.holidayType]}
          </span>
        </div>

        {/* Festival Titles (EN, Urdu, Hindi) */}
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {language === 'ur'
            ? (festival.nameUr || festival.nameEn)
            : festival.nameEn}
        </h1>
        <h2 className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
          {language === 'ur'
            ? festival.nameEn
            : language === 'hinglish'
            ? (festival.nameUr || festival.nameHi)
            : festival.nameHi}
        </h2>

        {/* Date and Region row */}
        <div className="flex flex-wrap items-center gap-4 py-3 my-4 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>
              {festival.date} {festival.endDate ? `to ${festival.endDate}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span className="line-clamp-1">{stateNames}</span>
          </div>
        </div>

        {/* Significance */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {language === 'ur' ? 'اہمیت و مقصد' : 'Cultural Significance'}
            </h4>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
              ✨ {festival.significance}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {language === 'ur' ? 'تفصیل و تاریخ' : 'Overview & History'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'ur' ? (festival.descriptionUr || festival.descriptionEn) : festival.descriptionEn}
            </p>
          </div>

          {/* Traditional Rituals */}
          {festival.rituals && festival.rituals.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {language === 'en' ? 'Traditional Rituals & Celebrations' : 'परंपरागत रीति-रिवाज एवं पूजा विधि'}
              </h4>
              <ul className="space-y-1.5">
                {festival.rituals.map((ritual, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>{ritual}</span>
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
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Celebrate Festive Spirit! 🎉</span>
          </button>

          {onAddToEvents && (
            <button
              onClick={() => {
                onAddToEvents(festival);
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
