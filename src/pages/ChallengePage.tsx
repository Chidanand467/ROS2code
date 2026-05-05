import { useState, useCallback, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { type Challenge, difficultyColors, categoryColors } from '../data/challenges';
import { globalSim, Ros2Sim } from '../lib/ros2sim';
import { runPythonCode, loadPyodide, isPyodideReady, isPyodideLoading } from '../lib/pyrunner';
import { Terminal } from '../components/Terminal';
import { SimCanvas } from '../components/SimCanvas';

interface ChallengePageProps {
  challenge: Challenge;
  isSolved: boolean;
  onSolved: () => void;
  onBack: () => void;
}

type RightTab = 'terminal' | 'simulation';
type LeftTab = 'description' | 'hints' | 'solution';

export function ChallengePage({ challenge, isSolved, onSolved, onBack }: ChallengePageProps) {
  const [code, setCode] = useState(challenge.starterCode);
  const [leftTab, setLeftTab] = useState<LeftTab>('description');
  const [rightTab, setRightTab] = useState<RightTab>('terminal');
  const [running, setRunning] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<{ name: string; passed: boolean; message: string }[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const simRef = useRef(globalSim);

  useEffect(() => {
    timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setPyodideLoading(true);
    setOutput('');
    setTestResults([]);

    try {
      if (!isPyodideReady()) {
        setOutput('Loading Python runtime (first time may take 10-20 seconds)...\n');
        await loadPyodide();
      }
      setPyodideLoading(false);

      const sim = new Ros2Sim();
      simRef.current = sim;
      sim.init();

      const result = await runPythonCode(code, sim, challenge.testCode, 15000);

      setOutput(result.output + (result.error ? '\n' + result.error : ''));
      setTestResults(result.testResults);

      if (result.testResults.length > 0 && result.testResults.every(t => t.passed)) {
        onSolved();
      }
    } catch (err: any) {
      setOutput(`Error: ${String(err)}`);
    } finally {
      setRunning(false);
      setPyodideLoading(false);
    }
  }, [code, challenge, onSolved]);

  const handleReset = useCallback(() => {
    setCode(challenge.starterCode);
    setOutput('');
    setTestResults([]);
  }, [challenge]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-surface-950">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-900 border-b border-surface-800 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-surface-400 hover:text-surface-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-sm font-semibold text-surface-100">{challenge.title}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[challenge.difficulty]}`}>
            {challenge.difficulty}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[challenge.category]}`}>
            {challenge.category}
          </span>
          {isSolved && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-success-500/10 text-success-500">Solved</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-surface-500 font-mono">{formatTime(elapsed)}</span>
          <span className="text-xs text-surface-500">+{challenge.xp} XP</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Description */}
        <div className="w-[40%] min-w-[320px] border-r border-surface-800 flex flex-col">
          <div className="flex gap-1 p-2 bg-surface-900 border-b border-surface-800">
            {(['description', 'hints', 'solution'] as LeftTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setLeftTab(tab)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors capitalize ${
                  leftTab === tab ? 'bg-surface-800 text-primary-400' : 'text-surface-400 hover:text-surface-200'
                }`}
              >
                {tab}
                {tab === 'solution' && isSolved && (
                  <svg className="w-3 h-3 inline ml-1 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {leftTab === 'description' && (
              <div className="space-y-4">
                <div className="prose prose-invert prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{
                    __html: challenge.description
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/`([^`]+)`/g, '<code class="bg-surface-800 px-1 rounded text-primary-300">$1</code>')
                      .replace(/\n/g, '<br/>')
                  }} />
                </div>

                {challenge.examples.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-surface-200 mb-2">Examples</h4>
                    {challenge.examples.map((ex, i) => (
                      <div key={i} className="bg-surface-900 border border-surface-800 rounded-lg p-3 mb-2">
                        <div className="text-xs text-surface-500 mb-1">Input: <span className="text-surface-300">{ex.input}</span></div>
                        <div className="text-xs text-surface-500 mb-1">Output: <span className="text-surface-300">{ex.output}</span></div>
                        {ex.explanation && <div className="text-xs text-surface-500">Note: <span className="text-surface-400">{ex.explanation}</span></div>}
                      </div>
                    ))}
                  </div>
                )}

                {challenge.prerequisiteLessons.length > 0 && (
                  <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-3">
                    <p className="text-xs text-primary-400 font-medium mb-1">Prerequisites</p>
                    <p className="text-xs text-surface-400">Complete the related lessons in ROS2Learn before attempting this challenge.</p>
                  </div>
                )}
              </div>
            )}

            {leftTab === 'hints' && (
              <div className="space-y-3">
                <p className="text-sm text-surface-400">Progressive hints - reveal one at a time:</p>
                {challenge.hints.map((hint, i) => (
                  <div key={i} className="bg-surface-900 border border-surface-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-surface-300">Hint {i + 1}</span>
                      {i >= hintIndex && (
                        <button
                          onClick={() => setHintIndex(i + 1)}
                          className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                        >Reveal</button>
                      )}
                    </div>
                    {i < hintIndex ? (
                      <p className="text-sm text-surface-300">{hint}</p>
                    ) : (
                      <p className="text-sm text-surface-600">Click to reveal...</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {leftTab === 'solution' && (
              <div>
                {isSolved || showSolution ? (
                  <div>
                    <pre className="bg-surface-900 border border-surface-800 rounded-lg p-4 text-sm text-surface-200 font-mono overflow-x-auto whitespace-pre-wrap">
                      {challenge.solutionCode}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-surface-500 mb-3">Solve the challenge to see the solution</p>
                    <button
                      onClick={() => setShowSolution(true)}
                      className="text-xs text-surface-400 hover:text-surface-200 underline transition-colors"
                    >Or reveal anyway</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Editor + Output */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-surface-900 border-b border-surface-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 font-mono">Python</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs text-surface-400 hover:text-surface-200 bg-surface-800 hover:bg-surface-700 rounded-lg transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleRun}
                disabled={running}
                className="px-4 py-1.5 text-xs font-medium text-surface-50 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-700 disabled:text-surface-500 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {running ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    {pyodideLoading ? 'Loading...' : 'Running...'}
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    Run
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="h-[45%] border-b border-surface-800">
            <Editor
              height="100%"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 13,
                fontFamily: '"JetBrains Mono", monospace',
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 8 },
                tabSize: 4,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>

          {/* Output Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-surface-900 border-b border-surface-800 shrink-0">
              {(['terminal', 'simulation'] as RightTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${
                    rightTab === tab ? 'bg-surface-800 text-primary-400' : 'text-surface-400 hover:text-surface-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              {rightTab === 'terminal' && (
                <Terminal sim={simRef.current} className="h-full" />
              )}
              {rightTab === 'simulation' && (
                <SimCanvas sim={simRef.current} className="h-full" />
              )}
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="border-t border-surface-800 bg-surface-900 p-3 shrink-0 max-h-[150px] overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                {testResults.every(t => t.passed) ? (
                  <span className="text-success-500 text-sm font-semibold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    All Tests Passed!
                  </span>
                ) : (
                  <span className="text-error-500 text-sm font-semibold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    Some Tests Failed
                  </span>
                )}
              </div>
              {testResults.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs mb-1">
                  <span className={t.passed ? 'text-success-500' : 'text-error-500'}>
                    {t.passed ? 'PASS' : 'FAIL'}
                  </span>
                  <span className="text-surface-300">{t.name}</span>
                  {!t.passed && <span className="text-surface-500">- {t.message}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
