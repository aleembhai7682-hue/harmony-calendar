import React, { useState } from 'react';
import { BookOpen, RotateCcw } from 'lucide-react';
import { Language } from '../../types/calendar';

interface PrayerWisdomTasbeehProps {
  language: Language;
  wisdom: {
    textUr: string;
    textEn: string;
    source: string;
  };
}

const ZIKR_LIST = [
  { label: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ' },
  { label: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ' },
  { label: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ' },
  { label: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ' },
  { label: 'Darood Sharif', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ' },
];

export const PrayerWisdomTasbeeh: React.FC<PrayerWisdomTasbeehProps> = ({
  language,
  wisdom,
}) => {
  const [tasbeehCount, setTasbeehCount] = useState<number>(0);
  const [selectedZikr, setSelectedZikr] = useState<string>('SubhanAllah');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 pt-1">
      {/* Hadith / Ayat Card */}
      <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <BookOpen className="w-4 h-4" />
              <span>
                {language === 'ur'
                  ? 'فرمانِ نبوی ﷺ / آیتِ مبارکہ'
                  : 'Daily Islamic Spiritual Wisdom'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{wisdom.source}</span>
          </div>

          <p
            className="font-serif text-base sm:text-lg text-emerald-200 mt-1 leading-relaxed text-right"
            dir="rtl"
          >
            "{wisdom.textUr}"
          </p>
          <p className="text-xs text-slate-300 mt-2 font-medium">"{wisdom.textEn}"</p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
          <span>Islamic Lifestyle Harmony</span>
          <span className="text-emerald-400 font-semibold">Peace & Reflection</span>
        </div>
      </div>

      {/* Digital Tasbeeh Counter */}
      <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">
              {language === 'ur' ? 'ڈیجیٹل تسبیح' : 'Digital Tasbeeh'}
            </span>
            <button
              type="button"
              onClick={() => setTasbeehCount(0)}
              title="Reset counter"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 mb-2">
            {ZIKR_LIST.map((z) => (
              <button
                type="button"
                key={z.label}
                onClick={() => setSelectedZikr(z.label)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedZikr === z.label
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>

          <div className="text-center py-1">
            <div className="text-4xl font-black font-mono text-emerald-300">
              {tasbeehCount}
            </div>
            <div className="text-[11px] font-serif text-slate-300 mt-0.5">
              {ZIKR_LIST.find((z) => z.label === selectedZikr)?.arabic}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTasbeehCount((prev) => prev + 1)}
          className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Tap to Count (تسبیح)</span>
          <span className="text-xs font-mono">+{tasbeehCount % 33} / 33</span>
        </button>
      </div>
    </div>
  );
};
