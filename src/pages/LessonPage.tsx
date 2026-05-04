import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { type Lesson, getModule } from '../data/curriculum';
import { AIHelper } from '../components/AIHelper';

interface LessonPageProps {
  lesson: Lesson;
  isComplete: boolean;
  onComplete: (quizScore: number | null) => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  onBack: () => void;
}

type Tab = 'learn' | 'code' | 'try' | 'quiz';

export function LessonPage({ lesson, isComplete, onComplete, onNext, onPrevious, hasNext, hasPrevious, onBack }: LessonPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const mod = getModule(lesson.module_id);

  const handleQuizSubmit = useCallback(() => {
    if (quizAnswer === null) return;
    setQuizSubmitted(true);
    const isCorrect = quizAnswer === lesson.quiz?.correct_index;
    onComplete(isCorrect ? 100 : 0);
  }, [quizAnswer, lesson, onComplete]);

  const handleMarkComplete = useCallback(() => {
    onComplete(null);
  }, [onComplete]);

  const copyToClipboard = useCallback(async (text: string, blockId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedBlock(blockId);
    setTimeout(() => setCopiedBlock(null), 2000);
  }, []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'learn', label: 'Learn', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'code', label: 'Code', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { id: 'try', label: 'Try It', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.87-.34-1.703-.956-2.348z' },
  ];

  if (lesson.quiz) {
    tabs.push({ id: 'quiz', label: 'Quiz', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-surface-500 mb-6">
        <button onClick={onBack} className="hover:text-surface-300 transition-colors">{mod?.title}</button>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-surface-300">{lesson.title}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-surface-50 mb-1">{lesson.title}</h1>
          <div className="flex items-center gap-3 text-sm text-surface-500">
            <span>+{lesson.xp} XP</span>
            {isComplete && (
              <span className="flex items-center gap-1 text-primary-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Completed
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAI(!showAI)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.87-.34-1.703-.956-2.348z" /></svg>
          Explain This
        </button>
      </div>

      {showAI && (
        <AIHelper lessonTitle={lesson.title} onClose={() => setShowAI(false)} />
      )}

      <div className="flex gap-1 bg-surface-900 border border-surface-800 rounded-xl p-1 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-surface-800 text-primary-400'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="prose prose-invert prose-sm max-w-none bg-surface-900 border border-surface-800 rounded-xl p-6">
              <ReactMarkdown>{lesson.theory}</ReactMarkdown>
            </div>

            {lesson.key_terms.length > 0 && (
              <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  Key Terms
                </h3>
                <div className="space-y-3">
                  {lesson.key_terms.map((kt, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-primary-400 font-mono text-sm font-bold shrink-0">{kt.term}</span>
                      <span className="text-surface-400 text-sm">{kt.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6">
            {lesson.code_example ? (
              <>
                <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-surface-800 border-b border-surface-700">
                    <span className="text-xs text-surface-400 font-mono">{lesson.code_example.language}</span>
                    <button
                      onClick={() => copyToClipboard(lesson.code_example!.code, 'main')}
                      className="text-xs text-surface-500 hover:text-surface-300 transition-colors flex items-center gap-1"
                    >
                      {copiedBlock === 'main' ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                    <code className="text-surface-200 font-mono">{lesson.code_example.code}</code>
                  </pre>
                </div>

                <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-primary-400 mb-2">What this code does</h4>
                  <p className="text-surface-300 text-sm">{lesson.code_example.explanation}</p>
                </div>

                {lesson.terminal_output && (
                  <div className="bg-surface-950 border border-surface-800 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface-800 border-b border-surface-700">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-error-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-warning-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-success-500/60" />
                      </div>
                      <span className="text-xs text-surface-500 font-mono">Terminal Output</span>
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                      <code className="text-surface-300 font-mono">{lesson.terminal_output}</code>
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-surface-900 border border-surface-800 rounded-xl p-8 text-center">
                <svg className="w-12 h-12 text-surface-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                <p className="text-surface-500">No code example for this lesson.</p>
                <p className="text-surface-600 text-sm mt-1">This is a concept lesson - focus on understanding the theory first!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'try' && (
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.87-.34-1.703-.956-2.348z" /></svg>
              Try It Yourself
            </h3>
            <p className="text-surface-400 text-sm mb-4">Hands-on practice is how you really learn. Complete each task:</p>
            <div className="space-y-3">
              {lesson.try_it.map((task, i) => (
                <div key={i} className="flex gap-3 items-start bg-surface-800/50 rounded-lg p-3">
                  <span className="w-6 h-6 rounded-full bg-surface-700 flex items-center justify-center text-xs font-bold text-surface-400 shrink-0">{i + 1}</span>
                  <p className="text-surface-300 text-sm">{task}</p>
                </div>
              ))}
            </div>
            {!isComplete && (
              <button
                onClick={handleMarkComplete}
                className="mt-6 w-full py-3 bg-primary-600 hover:bg-primary-500 text-surface-50 rounded-lg font-medium transition-colors"
              >
                Mark as Complete (+{lesson.xp} XP)
              </button>
            )}
          </div>
        )}

        {activeTab === 'quiz' && lesson.quiz && (
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Check Your Understanding
            </h3>
            <p className="text-surface-300 mb-5">{lesson.quiz.question}</p>

            <div className="space-y-2 mb-6">
              {lesson.quiz.options.map((option, i) => {
                let optionStyle = 'bg-surface-800 border-surface-700 hover:border-surface-500 text-surface-300';
                if (quizSubmitted) {
                  if (i === lesson.quiz!.correct_index) {
                    optionStyle = 'bg-success-500/10 border-success-500/40 text-success-500';
                  } else if (i === quizAnswer && i !== lesson.quiz!.correct_index) {
                    optionStyle = 'bg-error-500/10 border-error-500/40 text-error-500';
                  } else {
                    optionStyle = 'bg-surface-800 border-surface-700 text-surface-500';
                  }
                } else if (quizAnswer === i) {
                  optionStyle = 'bg-primary-500/10 border-primary-500/40 text-primary-400';
                }

                return (
                  <button
                    key={i}
                    onClick={() => !quizSubmitted && setQuizAnswer(i)}
                    disabled={quizSubmitted}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${optionStyle}`}
                  >
                    <span className="font-mono mr-2 text-surface-500">{String.fromCharCode(65 + i)}.</span>
                    {option}
                  </button>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                disabled={quizAnswer === null}
                className="w-full py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-700 disabled:text-surface-500 text-surface-50 rounded-lg font-medium transition-colors"
              >
                Submit Answer
              </button>
            ) : (
              <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-primary-400 mb-2">Explanation</h4>
                <p className="text-surface-300 text-sm">{lesson.quiz.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-surface-800">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="flex items-center gap-2 px-4 py-2 text-surface-400 hover:text-surface-200 disabled:text-surface-700 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-700 disabled:text-surface-500 text-surface-50 rounded-lg font-medium transition-colors"
        >
          Next Lesson
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
