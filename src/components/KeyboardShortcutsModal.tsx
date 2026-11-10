import React from 'react';
import { Language } from '../types/calendar';
import { translations } from '../translations/i18n';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'T', desc: 'Jump to Today' },
    { key: 'M', desc: 'Switch to Month View' },
    { key: 'W', desc: 'Switch to Week View' },
    { key: 'D', desc: 'Switch to Day View' },
    { key: 'Y', desc: 'Switch to Year View' },
    { key: 'A', desc: 'Switch to Agenda View' },
    { key: 'C or N', desc: 'Create New Event' },
    { key: 'Shift + T', desc: 'Create New Task' },
    { key: 'K', desc: 'Open Smart Quick Add' },
    { key: '/', desc: 'Focus Global Search' },
    { key: '← / →', desc: 'Navigate Previous / Next' },
    { key: '?', desc: 'Open Keyboard Shortcuts' },
    { key: 'Esc', desc: 'Close Active Modal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Command className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.actions.shortcuts}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
            >
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {sc.desc}
              </span>
              <kbd className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-600">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
