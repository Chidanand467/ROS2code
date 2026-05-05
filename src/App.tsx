import { useState, useCallback } from 'react';
import { useProgress } from './hooks/useProgress';
import { modules, getModule, getLesson, getNextLesson, getPreviousLesson, isModuleUnlocked, type Lesson, type Module } from './data/curriculum';
import { getChallenge } from './data/challenges';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LessonPage } from './pages/LessonPage';
import { ChallengeList } from './pages/ChallengeList';
import { ChallengePage } from './pages/ChallengePage';

type View =
  | { type: 'dashboard' }
  | { type: 'module'; moduleId: string }
  | { type: 'lesson'; lessonId: string }
  | { type: 'challengeList' }
  | { type: 'challenge'; challengeId: string };

export default function App() {
  const { isLessonComplete, getModuleProgress, totalXp, streak, markLessonComplete, markChallengeSolved, solvedChallenges, loading } = useProgress();
  const [view, setView] = useState<View>({ type: 'dashboard' });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const completedLessonIds = new Set(
    modules.flatMap(m => m.lessons).filter(l => isLessonComplete(l.id)).map(l => l.id)
  );

  const handleNavigate = useCallback((target: string) => {
    if (target === 'dashboard') {
      setView({ type: 'dashboard' });
    } else if (target === 'challenges') {
      setView({ type: 'challengeList' });
    } else if (target.startsWith('mod-')) {
      setView({ type: 'module', moduleId: target });
    } else if (target.startsWith('les-')) {
      setView({ type: 'lesson', lessonId: target });
    } else if (target.startsWith('ch-')) {
      setView({ type: 'challenge', challengeId: target });
    }
  }, []);

  const handleCompleteLesson = useCallback(async (lessonId: string, xp: number, quizScore: number | null) => {
    await markLessonComplete(lessonId, xp, quizScore);
  }, [markLessonComplete]);

  const currentLesson = view.type === 'lesson' ? getLesson(view.lessonId) : null;
  const currentModule = view.type === 'module' ? getModule(view.moduleId) :
    currentLesson ? getModule(currentLesson.module_id) : null;
  const currentChallenge = view.type === 'challenge' ? getChallenge(view.challengeId) : null;

  const showSidebar = view.type !== 'challenge';

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {showSidebar && (
        <Sidebar
          modules={modules}
          currentView={view}
          completedLessonIds={completedLessonIds}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          totalXp={totalXp}
          streak={streak}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        {view.type === 'dashboard' && (
          <Dashboard
            modules={modules}
            completedLessonIds={completedLessonIds}
            getModuleProgress={getModuleProgress}
            onNavigate={handleNavigate}
            totalXp={totalXp}
            streak={streak}
            loading={loading}
            solvedChallenges={solvedChallenges}
          />
        )}

        {view.type === 'module' && currentModule && (
          <ModuleOverview
            module={currentModule}
            completedLessonIds={completedLessonIds}
            isUnlocked={isModuleUnlocked(currentModule.id, completedLessonIds)}
            onNavigate={handleNavigate}
            onBack={() => setView({ type: 'dashboard' })}
          />
        )}

        {view.type === 'lesson' && currentLesson && (
          <LessonPage
            lesson={currentLesson}
            isComplete={isLessonComplete(currentLesson.id)}
            onComplete={(quizScore) => handleCompleteLesson(currentLesson.id, currentLesson.xp, quizScore)}
            onNext={() => {
              const next = getNextLesson(currentLesson.id);
              if (next) setView({ type: 'lesson', lessonId: next.id });
            }}
            onPrevious={() => {
              const prev = getPreviousLesson(currentLesson.id);
              if (prev) setView({ type: 'lesson', lessonId: prev.id });
            }}
            hasNext={!!getNextLesson(currentLesson.id)}
            hasPrevious={!!getPreviousLesson(currentLesson.id)}
            onBack={() => {
              const mod = getModule(currentLesson.module_id);
              if (mod) setView({ type: 'module', moduleId: mod.id });
            }}
          />
        )}

        {view.type === 'challengeList' && (
          <ChallengeList
            solvedIds={solvedChallenges}
            onSelect={(id) => setView({ type: 'challenge', challengeId: id })}
            onBack={() => setView({ type: 'dashboard' })}
            totalXp={totalXp}
          />
        )}

        {view.type === 'challenge' && currentChallenge && (
          <ChallengePage
            challenge={currentChallenge}
            isSolved={solvedChallenges.has(currentChallenge.id)}
            onSolved={() => markChallengeSolved(currentChallenge.id, currentChallenge.xp)}
            onBack={() => setView({ type: 'challengeList' })}
          />
        )}
      </main>
    </div>
  );
}

function ModuleOverview({ module, completedLessonIds, isUnlocked, onNavigate, onBack }: {
  module: Module;
  completedLessonIds: Set<string>;
  isUnlocked: boolean;
  onNavigate: (id: string) => void;
  onBack: () => void;
}) {
  const completedCount = module.lessons.filter(l => completedLessonIds.has(l.id)).length;
  const progress = module.lessons.length > 0 ? Math.round((completedCount / module.lessons.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={onBack} className="text-surface-400 hover:text-surface-200 mb-6 flex items-center gap-2 text-sm transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-50 mb-2">{module.title}</h1>
        <p className="text-surface-400 text-lg">{module.description}</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm text-surface-400">{completedCount}/{module.lessons.length} lessons</span>
        </div>
      </div>

      {!isUnlocked && (
        <div className="bg-surface-800/50 border border-surface-700 rounded-xl p-6 text-center">
          <p className="text-surface-300 text-lg mb-2">This module is locked</p>
          <p className="text-surface-500 text-sm">Complete all lessons in the previous module to unlock this one.</p>
        </div>
      )}

      {isUnlocked && (
        <div className="space-y-3">
          {module.lessons.map((lesson, idx) => {
            const isComplete = completedLessonIds.has(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => onNavigate(lesson.id)}
                className="w-full text-left bg-surface-900 border border-surface-800 hover:border-primary-600 rounded-xl p-5 flex items-center gap-4 transition-all group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  isComplete ? 'bg-primary-500 text-surface-950' : 'bg-surface-800 text-surface-400 group-hover:bg-surface-700'
                }`}>
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-surface-100 font-medium group-hover:text-primary-400 transition-colors">{lesson.title}</p>
                  <p className="text-surface-500 text-sm">+{lesson.xp} XP</p>
                </div>
                <svg className="w-5 h-5 text-surface-600 group-hover:text-primary-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
