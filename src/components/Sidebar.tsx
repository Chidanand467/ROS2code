import { modules, isModuleUnlocked, type Module } from '../data/curriculum';

interface SidebarProps {
  modules: Module[];
  currentView: { type: string; lessonId?: string; moduleId?: string };
  completedLessonIds: Set<string>;
  onNavigate: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  totalXp: number;
  streak: number;
}

const iconMap: Record<string, string> = {
  Robot: 'M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 1 1 0 2h-1v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1H2a1 1 0 1 1 0-2h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2zM9 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
  Terminal: 'M4 17l6-6-6-6M12 19h8',
  Box: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  Radio: 'M4.9 19.1A10 10 0 0 1 4.9 4.9M7.8 16.2A6 6 0 0 1 7.8 7.8M19.1 4.9A10 10 0 0 1 19.1 19.1M16.2 7.8a6 6 0 0 1 0 8.4M12 12h.01',
  PhoneCall: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  PlayCircle: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM10 8l6 4-6 4V8z',
  Sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  Rocket: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z',
  FileCode: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13l2 2-2 2M14 17l2-2-2-2',
  Compass: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z',
  Cuboid: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
  Monitor: 'M8 21h8M12 17v4M4 3h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z',
  Navigation: 'M3 11l6-6 6 6M9 5v14M21 3l-6 6-6-6',
  Trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
};

export function Sidebar({ modules: mods, currentView, completedLessonIds, onNavigate, isOpen, onToggle, totalXp, streak }: SidebarProps) {
  return (
    <>
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg p-2 transition-colors"
        >
          <svg className="w-5 h-5 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      )}

      <aside className={`${isOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-surface-900 border-r border-surface-800 flex flex-col overflow-hidden shrink-0`}>
        <div className="p-4 border-b border-surface-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-surface-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <span className="font-bold text-surface-100">ROS2Learn</span>
          </div>
          <button onClick={onToggle} className="text-surface-500 hover:text-surface-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          </button>
        </div>

        <div className="p-4 border-b border-surface-800 shrink-0">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              currentView.type === 'dashboard' ? 'bg-primary-500/10 text-primary-400' : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
            }`}
          >
            Dashboard
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {mods.map(mod => {
            const unlocked = isModuleUnlocked(mod.id, completedLessonIds);
            const isActive = currentView.type === 'module' && currentView.moduleId === mod.id ||
              currentView.type === 'lesson' && mod.lessons.some(l => l.id === currentView.lessonId);

            return (
              <div key={mod.id}>
                <button
                  onClick={() => unlocked && onNavigate(mod.id)}
                  disabled={!unlocked}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    isActive ? 'bg-primary-500/10 text-primary-400' :
                    unlocked ? 'text-surface-400 hover:bg-surface-800 hover:text-surface-200' :
                    'text-surface-600 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconMap[mod.icon] || iconMap.Box} />
                  </svg>
                  <span className="truncate flex-1">{mod.title}</span>
                  {!unlocked && (
                    <svg className="w-3.5 h-3.5 shrink-0 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  )}
                </button>

                {isActive && unlocked && (
                  <div className="ml-6 mt-1 space-y-0.5">
                    {mod.lessons.map(lesson => {
                      const isLessonActive = currentView.type === 'lesson' && currentView.lessonId === lesson.id;
                      const isComplete = completedLessonIds.has(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => onNavigate(lesson.id)}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-2 ${
                            isLessonActive ? 'bg-primary-500/10 text-primary-400' :
                            'text-surface-500 hover:bg-surface-800 hover:text-surface-300'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isComplete ? 'border-primary-500 bg-primary-500' : 'border-surface-700'
                          }`}>
                            {isComplete && (
                              <svg className="w-2.5 h-2.5 text-surface-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                            )}
                          </span>
                          <span className="truncate">{lesson.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-surface-800 shrink-0">
          <div className="flex items-center justify-between text-xs text-surface-500">
            <span>{totalXp} XP</span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-accent-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              {streak} day streak
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
