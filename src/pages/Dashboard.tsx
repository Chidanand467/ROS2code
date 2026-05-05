import { modules, isModuleUnlocked, type Module } from '../data/curriculum';
import { challenges } from '../data/challenges';

interface DashboardProps {
  modules: Module[];
  completedLessonIds: Set<string>;
  getModuleProgress: (lessonIds: string[]) => number;
  onNavigate: (id: string) => void;
  totalXp: number;
  streak: number;
  loading: boolean;
  solvedChallenges: Set<string>;
}

const moduleIcons: Record<string, string> = {
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

export function Dashboard({ modules: mods, completedLessonIds, getModuleProgress, onNavigate, totalXp, streak, loading, solvedChallenges }: DashboardProps) {
  const totalLessons = mods.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = mods.reduce((sum, m) => sum + m.lessons.filter(l => completedLessonIds.has(l.id)).length, 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-surface-50 mb-3">
          Learn ROS2, Step by Step
        </h1>
        <p className="text-surface-400 text-lg max-w-2xl">
          From absolute beginner to building autonomous robots. Every concept explained in plain English with real-world analogies before any code.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-50">{totalXp}</p>
              <p className="text-xs text-surface-500">Total XP</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-400" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-50">{streak}</p>
              <p className="text-xs text-surface-500">Day Streak</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-50">{completedLessons}/{totalLessons}</p>
              <p className="text-xs text-surface-500">Lessons Complete</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10 bg-surface-900 border border-surface-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-surface-300">Overall Progress</h2>
          <span className="text-sm text-primary-400 font-bold">{overallProgress}%</span>
        </div>
        <div className="h-3 bg-surface-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-700"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-bold text-surface-100 mb-5">Learning Path</h2>

      {/* ROS2Code Practice Section */}
      <div className="mb-10 bg-gradient-to-r from-surface-900 to-surface-900/50 border border-primary-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-surface-50 mb-1 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              ROS2Code
            </h2>
            <p className="text-surface-400 text-sm">Practice what you have learned. Write real Python code, run it in the browser, and watch the robot respond.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-400">{solvedChallenges.size}</p>
              <p className="text-xs text-surface-500">Solved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-surface-300">{challenges.length - solvedChallenges.size}</p>
              <p className="text-xs text-surface-500">Remaining</p>
            </div>
            <button
              onClick={() => onNavigate('challenges')}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-surface-50 rounded-lg font-medium transition-colors text-sm"
            >
              Start Practicing
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mods.map(mod => {
          const unlocked = isModuleUnlocked(mod.id, completedLessonIds);
          const lessonIds = mod.lessons.map(l => l.id);
          const progress = getModuleProgress(lessonIds);
          const completedCount = mod.lessons.filter(l => completedLessonIds.has(l.id)).length;

          return (
            <button
              key={mod.id}
              onClick={() => unlocked && onNavigate(mod.id)}
              disabled={!unlocked}
              className={`text-left bg-surface-900 border rounded-xl p-5 transition-all group ${
                unlocked
                  ? 'border-surface-800 hover:border-primary-600 hover:shadow-lg hover:shadow-primary-500/5'
                  : 'border-surface-800/50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  progress === 100 ? 'bg-primary-500/20' : unlocked ? 'bg-surface-800' : 'bg-surface-800/50'
                }`}>
                  <svg className={`w-5 h-5 ${progress === 100 ? 'text-primary-400' : unlocked ? 'text-surface-400' : 'text-surface-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={moduleIcons[mod.icon] || moduleIcons.Box} />
                  </svg>
                </div>
                {!unlocked && (
                  <svg className="w-5 h-5 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                )}
                {progress === 100 && (
                  <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full font-medium">Complete</span>
                )}
              </div>

              <h3 className={`font-semibold mb-1 ${unlocked ? 'text-surface-100 group-hover:text-primary-400' : 'text-surface-500'} transition-colors`}>
                {mod.order + 1}. {mod.title}
              </h3>
              <p className="text-surface-500 text-sm mb-3 line-clamp-2">{mod.description}</p>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-surface-500">{completedCount}/{mod.lessons.length}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
