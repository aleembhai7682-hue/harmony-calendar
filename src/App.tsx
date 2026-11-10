import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ViewMode,
  Language,
  Theme,
  CalendarEvent,
  CalendarTask,
  CalendarFilterSettings,
  CalendarFaithMode,
  IndianFestival,
  IslamicOccasion,
} from './types/calendar';
import {
  loadEvents,
  saveEvents,
  loadTasks,
  saveTasks,
  loadFilters,
  saveFilters,
  loadTheme,
  saveTheme,
  loadLanguage,
  saveLanguage,
  loadActiveMode,
  saveActiveMode,
  DEFAULT_FILTERS,
} from './utils/storage';
import { getHijriDate, getIslamicOccasionForDate } from './utils/hijri';
import { INDIAN_FESTIVALS_DATABASE } from './utils/indianFestivals';
import { exportEventsToIcs } from './utils/icsExport';

// Calendar Views & Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { DayView } from './components/DayView';
import { YearView } from './components/YearView';
import { AgendaView } from './components/AgendaView';
import { EventModal } from './components/EventModal';
import { TaskModal } from './components/TaskModal';
import { FestivalDetailModal } from './components/FestivalDetailModal';
import { IslamicOccasionModal } from './components/IslamicOccasionModal';
import { QuickAddModal } from './components/QuickAddModal';
import { SettingsModal } from './components/SettingsModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

// Dedicated Lifestyle & Productivity Widgets
import { IslamicPrayerWidget } from './components/IslamicPrayerWidget';
import { HinduPanchangWidget } from './components/HinduPanchangWidget';
import { ChristianLifestyleWidget } from './components/ChristianLifestyleWidget';
import { ProductivityTimerWidget } from './components/ProductivityTimerWidget';

export default function App() {
  // Mode Isolation State: 'christian' (default) | 'hindu' | 'muslim'
  const [calendarMode, setCalendarMode] = useState<CalendarFaithMode>(() => loadActiveMode());

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 10, 10)); // Nov 10, 2026 default
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [language, setLanguage] = useState<Language>(() => {
    const mode = loadActiveMode();
    if (mode === 'christian') return 'en';
    if (mode === 'hindu') {
      const l = loadLanguage();
      return l === 'ur' ? 'en' : l;
    }
    return loadLanguage();
  });
  const [theme, setTheme] = useState<Theme>(() => loadTheme());
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadEvents());
  const [tasks, setTasks] = useState<CalendarTask[]>(() => loadTasks());
  const [filters, setFilters] = useState<CalendarFilterSettings>(() => {
    const loaded = loadFilters();
    const activeM = loadActiveMode();
    return {
      ...loaded,
      calendarMode: activeM,
      muslimOnlyMode: activeM === 'muslim',
    };
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventModalDate, setEventModalDate] = useState<string>('');
  const [eventModalTime, setEventModalTime] = useState<string>('10:00');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
  const [taskModalDate, setTaskModalDate] = useState<string>('');

  const [isFestivalModalOpen, setIsFestivalModalOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<IndianFestival | null>(null);

  const [isIslamicModalOpen, setIsIslamicModalOpen] = useState(false);
  const [selectedIslamic, setSelectedIslamic] = useState<IslamicOccasion | null>(null);

  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Synchronize Theme & Language in localStorage and DOM
  useEffect(() => {
    saveTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  // Handle Mode Change with Strict Segregation & Persistence
  const handleModeChange = (newMode: CalendarFaithMode) => {
    setCalendarMode(newMode);
    saveActiveMode(newMode);

    // Strict language isolation:
    // Christian Mode: English exclusively, no Urdu
    // Hindu Mode: Hindi / Sanskrit / English, no Urdu
    // Muslim Mode: Preserve existing Urdu support
    if (newMode === 'christian') {
      setLanguage('en');
      saveLanguage('en');
    } else if (newMode === 'hindu') {
      if (language === 'ur') {
        setLanguage('en');
        saveLanguage('en');
      }
    } else if (newMode === 'muslim') {
      const savedLang = loadLanguage();
      if (savedLang === 'ur' || savedLang === 'hinglish') {
        setLanguage(savedLang);
      } else {
        setLanguage('ur');
        saveLanguage('ur');
      }
    }

    const updatedFilters: CalendarFilterSettings = {
      ...filters,
      calendarMode: newMode,
      muslimOnlyMode: newMode === 'muslim',
    };
    setFilters(updatedFilters);
    saveFilters(updatedFilters);
  };

  // Calendar persistence handlers
  const handleUpdateEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    saveEvents(newEvents);
  };

  const handleUpdateTasks = (newTasks: CalendarTask[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const handleUpdateFilters = (newFilters: CalendarFilterSettings) => {
    setFilters(newFilters);
    saveFilters(newFilters);
  };

  // Upcoming items calculation
  const upcomingFestivals = useMemo(() => {
    const todayStr = currentDate.toISOString().slice(0, 10);
    return INDIAN_FESTIVALS_DATABASE
      .filter((f) => f.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);
  }, [currentDate]);

  const upcomingIslamic = useMemo(() => {
    const list: IslamicOccasion[] = [];
    for (let i = 0; i < 60; i++) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + i);
      const occ = getIslamicOccasionForDate(d, filters.hijriAdjustmentDays);
      if (occ && !list.some((x) => x.id === occ.id)) {
        list.push(occ);
      }
    }
    return list.slice(0, 8);
  }, [currentDate, filters.hijriAdjustmentDays]);

  // Date navigation
  const handleNavigate = useCallback(
    (direction: 'prev' | 'next' | 'today') => {
      if (direction === 'today') {
        setCurrentDate(new Date(2026, 10, 10));
        return;
      }

      setCurrentDate((prev) => {
        const d = new Date(prev);
        const delta = direction === 'next' ? 1 : -1;

        switch (viewMode) {
          case 'month':
            d.setMonth(d.getMonth() + delta);
            break;
          case 'week':
            d.setDate(d.getDate() + delta * 7);
            break;
          case 'day':
            d.setDate(d.getDate() + delta);
            break;
          case 'year':
            d.setFullYear(d.getFullYear() + delta);
            break;
          case 'agenda':
            d.setMonth(d.getMonth() + delta);
            break;
        }
        return d;
      });
    },
    [viewMode]
  );

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 't') {
        handleNavigate('today');
      } else if (key === 'm') {
        setViewMode('month');
      } else if (key === 'w') {
        setViewMode('week');
      } else if (key === 'd') {
        setViewMode('day');
      } else if (key === 'y') {
        setViewMode('year');
      } else if (key === 'a') {
        setViewMode('agenda');
      } else if (key === 'c' || key === 'n') {
        e.preventDefault();
        setSelectedEvent(null);
        setEventModalDate(currentDate.toISOString().slice(0, 10));
        setEventModalTime('10:00');
        setIsEventModalOpen(true);
      } else if (key === 'k') {
        e.preventDefault();
        setIsQuickAddModalOpen(true);
      } else if (key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen(true);
      } else if (e.key === 'ArrowLeft') {
        handleNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        handleNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDate, handleNavigate]);

  // Event & Task Handlers
  const handleSaveEvent = (savedEvent: CalendarEvent) => {
    const exists = events.some((e) => e.id === savedEvent.id);
    if (exists) {
      handleUpdateEvents(events.map((e) => (e.id === savedEvent.id ? savedEvent : e)));
    } else {
      handleUpdateEvents([savedEvent, ...events]);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    handleUpdateEvents(events.filter((e) => e.id !== eventId));
  };

  const handleSaveTask = (savedTask: CalendarTask) => {
    const taskWithTag: CalendarTask = {
      ...savedTask,
      faithTag: savedTask.faithTag || 'universal',
    };

    const exists = tasks.some((t) => t.id === taskWithTag.id);
    if (exists) {
      handleUpdateTasks(tasks.map((t) => (t.id === taskWithTag.id ? taskWithTag : t)));
    } else {
      handleUpdateTasks([taskWithTag, ...tasks]);
    }
  };

  const handleToggleTask = (taskId: string) => {
    handleUpdateTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    handleUpdateTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleExportIcs = () => {
    exportEventsToIcs(events);
  };

  const handleExportBackup = () => {
    const data = {
      app: 'Almanac Pro Calendar',
      version: '2.5',
      exportDate: new Date().toISOString(),
      activeMode: calendarMode,
      events,
      tasks,
      filters,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `almanac_calendar_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.events)) {
        handleUpdateEvents(data.events);
      }
      if (Array.isArray(data.tasks)) {
        handleUpdateTasks(data.tasks);
      }
      if (data.filters) {
        handleUpdateFilters(data.filters);
      }
      if (data.activeMode) {
        handleModeChange(data.activeMode);
      }
    } catch (e) {
      console.error('Failed to import backup JSON:', e);
    }
  };

  const todayHijri = getHijriDate(currentDate, filters.hijriAdjustmentDays);

  return (
    <div
      className={`min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors relative overflow-x-hidden ${
        calendarMode === 'christian'
          ? 'bg-gradient-to-b from-slate-100 via-sky-50/40 to-indigo-50/25 dark:bg-gradient-to-b dark:from-[#070b16] dark:via-[#0c1326] dark:to-slate-950'
          : calendarMode === 'hindu'
          ? 'bg-gradient-to-b from-amber-50/40 via-orange-50/20 to-slate-50 dark:bg-gradient-to-b dark:from-slate-950 dark:via-[#191107] dark:to-slate-950'
          : 'bg-slate-50 dark:bg-slate-950'
      }`}
    >
      {/* Ambient background light glow for peaceful Christian / Hindu themes */}
      {calendarMode === 'christian' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-gradient-to-b from-blue-500/10 via-amber-200/5 to-transparent blur-3xl pointer-events-none -z-0" />
      )}
      {calendarMode === 'hindu' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-gradient-to-b from-amber-500/10 via-orange-400/5 to-transparent blur-3xl pointer-events-none -z-0" />
      )}
      
      {/* 🌟 Unified Clean Navbar with 3-Way Mode Switcher */}
      <Navbar
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNavigate={handleNavigate}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeToggle={() => {
          const next = theme === 'dark' ? 'light' : 'dark';
          setTheme(next);
          saveTheme(next);
        }}
        todayHijri={todayHijri}
        calendarMode={calendarMode}
        onModeChange={handleModeChange}
        onOpenQuickAdd={() => setIsQuickAddModalOpen(true)}
        onOpenNewEvent={() => {
          setSelectedEvent(null);
          setEventModalDate(currentDate.toISOString().slice(0, 10));
          setEventModalTime('10:00');
          setIsEventModalOpen(true);
        }}
        onOpenNewTask={() => {
          setSelectedTask(null);
          setTaskModalDate(currentDate.toISOString().slice(0, 10));
          setIsTaskModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-5">
        
        {/* 🌟 Dedicated Multi-Faith Mode Hero Card */}
        {calendarMode === 'muslim' && (
          <IslamicPrayerWidget
            currentDate={currentDate}
            hijriOffset={filters.hijriAdjustmentDays}
            language={language}
          />
        )}

        {calendarMode === 'hindu' && (
          <HinduPanchangWidget currentDate={currentDate} />
        )}

        {calendarMode === 'christian' && (
          <ChristianLifestyleWidget currentDate={currentDate} />
        )}

        {/* ⚡ Lifestyle & Daily Routine Productivity Focus Timer */}
        <ProductivityTimerWidget />

        {/* Calendar Grid + Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left Interactive Sidebar */}
          <Sidebar
            currentDate={currentDate}
            onSelectDate={(d) => setCurrentDate(d)}
            filters={filters}
            onFilterChange={handleUpdateFilters}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onOpenNewTask={() => {
              setSelectedTask(null);
              setTaskModalDate(currentDate.toISOString().slice(0, 10));
              setIsTaskModalOpen(true);
            }}
            onSelectIslamic={(occ) => {
              setSelectedIslamic(occ);
              setIsIslamicModalOpen(true);
            }}
            onSelectFestival={(fest) => {
              setSelectedFestival(fest);
              setIsFestivalModalOpen(true);
            }}
            language={language}
            upcomingFestivals={upcomingFestivals}
            upcomingIslamic={upcomingIslamic}
          />

          {/* Calendar View Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {viewMode === 'month' && (
              <MonthView
                currentDate={currentDate}
                onSelectDate={(d) => setCurrentDate(d)}
                events={events}
                tasks={tasks}
                filters={filters}
                language={language}
                onOpenCreateEventOnDate={(dStr) => {
                  setSelectedEvent(null);
                  setEventModalDate(dStr);
                  setEventModalTime('10:00');
                  setIsEventModalOpen(true);
                }}
                onSelectEvent={(evt) => {
                  setSelectedEvent(evt);
                  setEventModalDate(evt.startDate);
                  setIsEventModalOpen(true);
                }}
                onSelectFestival={(f) => {
                  setSelectedFestival(f);
                  setIsFestivalModalOpen(true);
                }}
                onSelectIslamic={(occ) => {
                  setSelectedIslamic(occ);
                  setIsIslamicModalOpen(true);
                }}
                onToggleTask={handleToggleTask}
              />
            )}

            {viewMode === 'week' && (
              <WeekView
                currentDate={currentDate}
                onSelectDate={(d) => setCurrentDate(d)}
                events={events}
                tasks={tasks}
                filters={filters}
                language={language}
                onOpenCreateEventOnDateAndTime={(dStr, tStr) => {
                  setSelectedEvent(null);
                  setEventModalDate(dStr);
                  setEventModalTime(tStr);
                  setIsEventModalOpen(true);
                }}
                onSelectEvent={(evt) => {
                  setSelectedEvent(evt);
                  setEventModalDate(evt.startDate);
                  setIsEventModalOpen(true);
                }}
                onSelectFestival={(f) => {
                  setSelectedFestival(f);
                  setIsFestivalModalOpen(true);
                }}
                onSelectIslamic={(occ) => {
                  setSelectedIslamic(occ);
                  setIsIslamicModalOpen(true);
                }}
              />
            )}

            {viewMode === 'day' && (
              <DayView
                currentDate={currentDate}
                events={events}
                tasks={tasks}
                filters={filters}
                language={language}
                onOpenCreateEventOnDateAndTime={(dStr, tStr) => {
                  setSelectedEvent(null);
                  setEventModalDate(dStr);
                  setEventModalTime(tStr);
                  setIsEventModalOpen(true);
                }}
                onSelectEvent={(evt) => {
                  setSelectedEvent(evt);
                  setEventModalDate(evt.startDate);
                  setIsEventModalOpen(true);
                }}
                onSelectFestival={(f) => {
                  setSelectedFestival(f);
                  setIsFestivalModalOpen(true);
                }}
                onSelectIslamic={(occ) => {
                  setSelectedIslamic(occ);
                  setIsIslamicModalOpen(true);
                }}
                onToggleTask={handleToggleTask}
                onOpenNewTask={() => {
                  setSelectedTask(null);
                  setTaskModalDate(currentDate.toISOString().slice(0, 10));
                  setIsTaskModalOpen(true);
                }}
              />
            )}

            {viewMode === 'year' && (
              <YearView
                currentDate={currentDate}
                onSelectDate={(d) => {
                  setCurrentDate(d);
                  setViewMode('day');
                }}
                onNavigateToMonth={(year, month) => {
                  setCurrentDate(new Date(year, month, 1));
                  setViewMode('month');
                }}
                events={events}
                filters={filters}
                language={language}
              />
            )}

            {viewMode === 'agenda' && (
              <AgendaView
                currentDate={currentDate}
                onSelectDate={(d) => {
                  setCurrentDate(d);
                  setViewMode('day');
                }}
                events={events}
                tasks={tasks}
                filters={filters}
                language={language}
                onSelectEvent={(evt) => {
                  setSelectedEvent(evt);
                  setIsEventModalOpen(true);
                }}
                onSelectFestival={(f) => {
                  setSelectedFestival(f);
                  setIsFestivalModalOpen(true);
                }}
                onSelectIslamic={(occ) => {
                  setSelectedIslamic(occ);
                  setIsIslamicModalOpen(true);
                }}
                onToggleTask={handleToggleTask}
                searchQuery={searchQuery}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialEvent={selectedEvent}
        defaultDate={eventModalDate}
        defaultTime={eventModalTime}
        language={language}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={selectedTask}
        defaultDate={taskModalDate}
        language={language}
      />

      <FestivalDetailModal
        isOpen={isFestivalModalOpen}
        onClose={() => setIsFestivalModalOpen(false)}
        festival={selectedFestival}
        language={language}
        onAddToEvents={(fest) => {
          handleSaveEvent({
            id: `fest-evt-${Date.now()}`,
            title: fest.nameEn,
            description: `${fest.significance}\n\nRituals: ${fest.rituals.join(', ')}`,
            startDate: fest.date,
            endDate: fest.endDate || fest.date,
            allDay: true,
            category: 'festival',
            priority: 'medium',
            recurrence: 'yearly',
            color: '#f59e0b',
            createdAt: Date.now(),
          });
        }}
      />

      <IslamicOccasionModal
        isOpen={isIslamicModalOpen}
        onClose={() => setIsIslamicModalOpen(false)}
        occasion={selectedIslamic}
        language={language}
        onAddToEvents={(occ) => {
          handleSaveEvent({
            id: `islamic-evt-${Date.now()}`,
            title: occ.nameEn,
            description: `${occ.spiritualSignificance}\n\nPractices: ${occ.practices.join(', ')}`,
            startDate: occ.estimatedDate,
            endDate: occ.estimatedDate,
            allDay: true,
            category: 'spiritual',
            priority: 'high',
            recurrence: 'none',
            color: '#10b981',
            createdAt: Date.now(),
          });
        }}
      />

      <QuickAddModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        onAddEvent={handleSaveEvent}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        filters={filters}
        onFilterChange={handleUpdateFilters}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
        onExportIcs={handleExportIcs}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetDefaults={() => {
          handleUpdateFilters(DEFAULT_FILTERS);
        }}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        language={language}
      />

    </div>
  );
}
