import { useState, useRef, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Ros2Sim } from '../lib/ros2sim';
import { globalRepl, isPyodideReady, loadPyodide } from '../lib/pyrepl';
import { Terminal } from '../components/Terminal';
import { SimCanvas } from '../components/SimCanvas';
import { CodespacesSetup } from '../components/CodespacesSetup';

type RightTab = 'simulation' | 'editor';
type EnvMode = 'simulated' | 'codespaces';

const QUICK_COMMANDS = [
  { label: 'Start turtlesim', cmd: 'ros2 run turtlesim turtlesim_node' },
  { label: 'List nodes', cmd: 'ros2 node list' },
  { label: 'List topics', cmd: 'ros2 topic list' },
  { label: 'Show pose', cmd: 'ros2 topic echo /turtle1/pose' },
  { label: 'Move forward', cmd: 'ros2 topic pub /turtle1/cmd_vel geometry_msgs/msg/Twist "{linear: {x: 2.0}, angular: {z: 0.0}}"' },
  { label: 'Turn left', cmd: 'ros2 topic pub /turtle1/cmd_vel geometry_msgs/msg/Twist "{linear: {x: 0.0}, angular: {z: 1.5}}"' },
  { label: 'Circle', cmd: 'ros2 topic pub /turtle1/cmd_vel geometry_msgs/msg/Twist "{linear: {x: 2.0}, angular: {z: 1.0}}"' },
  { label: 'Stop', cmd: 'ros2 topic pub /turtle1/cmd_vel geometry_msgs/msg/Twist "{linear: {x: 0.0}, angular: {z: 0.0}}"' },
];

const PYTHON_SCRIPT_TEMPLATE = `# ROS2 Python Script
# Write your ROS2 code here and click "Run Script"

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

rclpy.init()
node = Node('playground_node')
pub = node.create_publisher(Twist, '/turtle1/cmd_vel', 10)

# Make the turtle move in a circle
msg = Twist()
msg.linear.x = 2.0
msg.angular.z = 1.0
pub.publish(msg)
node.get_logger().info('Publishing velocity command!')

node.destroy_node()
rclpy.shutdown()
`;

export function PlaygroundPage({ onBack }: { onBack: () => void }) {
  const [rightTab, setRightTab] = useState<RightTab>('simulation');
  const [envMode, setEnvMode] = useState<EnvMode>('simulated');
  const [showCodespaces, setShowCodespaces] = useState(false);
  const [scriptCode, setScriptCode] = useState(PYTHON_SCRIPT_TEMPLATE);
  const [scriptRunning, setScriptRunning] = useState(false);
  const [scriptOutput, setScriptOutput] = useState('');
  const [showQuickCmds, setShowQuickCmds] = useState(false);
  const simRef = useRef(new Ros2Sim());

  useEffect(() => {
    const sim = simRef.current;
    sim.init();
    return () => { sim.shutdown(); };
  }, []);

  const handleRunScript = useCallback(async () => {
    setScriptRunning(true);
    setScriptOutput('');

    try {
      if (!isPyodideReady()) {
        setScriptOutput('Loading Python runtime...\n');
        await loadPyodide();
      }
      await globalRepl.start();

      const result = await globalRepl.executeBlock(scriptCode);
      setScriptOutput(result.output || '(no output)');
    } catch (err: any) {
      setScriptOutput(`Error: ${String(err)}`);
    } finally {
      setScriptRunning(false);
    }
  }, [scriptCode]);

  const handleResetSim = useCallback(() => {
    const sim = simRef.current;
    sim.reset();
    sim.init();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-surface-950">
      {showCodespaces && (
        <CodespacesSetup onClose={() => setShowCodespaces(false)} />
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-900 border-b border-surface-800 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-surface-400 hover:text-surface-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-sm font-semibold text-surface-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Playground
          </h2>
          <span className="text-xs text-surface-600">|</span>
          <span className="text-xs text-surface-500">Free-form ROS2 sandbox</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Environment Mode Toggle */}
          <div className="flex items-center gap-1 bg-surface-800 rounded-lg p-0.5 border border-surface-700">
            <button
              onClick={() => setEnvMode('simulated')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                envMode === 'simulated' ? 'bg-primary-600 text-surface-50' : 'text-surface-400 hover:text-surface-200'
              }`}
            >Simulated</button>
            <button
              onClick={() => {
                setEnvMode('codespaces');
                setShowCodespaces(true);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                envMode === 'codespaces' ? 'bg-primary-600 text-surface-50' : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Codespaces
            </button>
          </div>

          <button
            onClick={handleResetSim}
            className="px-3 py-1.5 text-xs text-surface-400 hover:text-surface-200 bg-surface-800 hover:bg-surface-700 rounded-lg transition-colors border border-surface-700"
          >
            Reset Sim
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Terminal */}
        <div className="w-[55%] flex flex-col border-r border-surface-800">
          {/* Quick Commands Bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-900 border-b border-surface-800 shrink-0">
            <button
              onClick={() => setShowQuickCmds(!showQuickCmds)}
              className="text-xs text-surface-400 hover:text-surface-200 flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Quick Commands
              <svg className={`w-3 h-3 transition-transform ${showQuickCmds ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>

          {showQuickCmds && (
            <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-surface-900/50 border-b border-surface-800 shrink-0">
              {QUICK_COMMANDS.map(qc => (
                <button
                  key={qc.label}
                  onClick={() => {
                    const sim = simRef.current;
                    if (!sim.isRunning()) sim.init();
                    const output = sim.handleCliCommand(qc.cmd);
                    // The terminal will handle the output via the log listener
                  }}
                  className="px-2 py-1 text-xs bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-surface-100 rounded-md transition-colors border border-surface-700"
                >
                  {qc.label}
                </button>
              ))}
            </div>
          )}

          {/* Terminal */}
          <div className="flex-1 overflow-hidden">
            <Terminal sim={simRef.current} className="h-full" showModeToggle={true} />
          </div>
        </div>

        {/* Right Panel - Simulation / Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-surface-900 border-b border-surface-800 shrink-0">
            {(['simulation', 'editor'] as RightTab[]).map(tab => (
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
            {rightTab === 'simulation' && (
              <SimCanvas sim={simRef.current} className="h-full" />
            )}

            {rightTab === 'editor' && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-3 py-1.5 bg-surface-900 border-b border-surface-800 shrink-0">
                  <span className="text-xs text-surface-500 font-mono">Python Script</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScriptCode(PYTHON_SCRIPT_TEMPLATE)}
                      className="px-2 py-1 text-xs text-surface-400 hover:text-surface-200 bg-surface-800 hover:bg-surface-700 rounded transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleRunScript}
                      disabled={scriptRunning}
                      className="px-3 py-1 text-xs font-medium text-surface-50 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-700 disabled:text-surface-500 rounded transition-colors flex items-center gap-1"
                    >
                      {scriptRunning ? (
                        <>
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          Running...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          Run Script
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <Editor
                    height="100%"
                    language="python"
                    theme="vs-dark"
                    value={scriptCode}
                    onChange={(val) => setScriptCode(val || '')}
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

                {scriptOutput && (
                  <div className="border-t border-surface-800 bg-surface-900 p-3 shrink-0 max-h-[200px] overflow-y-auto">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-surface-500 font-mono">Output</span>
                      <button
                        onClick={() => setScriptOutput('')}
                        className="text-xs text-surface-500 hover:text-surface-300 transition-colors"
                      >Clear</button>
                    </div>
                    <pre className="text-xs text-surface-200 font-mono whitespace-pre-wrap">{scriptOutput}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
