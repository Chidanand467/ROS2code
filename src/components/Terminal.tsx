import { useEffect, useRef, useCallback, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { type Ros2Sim } from '../lib/ros2sim';
import { globalRepl, isPyodideReady, isPyodideLoading, loadPyodide } from '../lib/pyrepl';

type TerminalMode = 'cli' | 'python';

interface TerminalProps {
  sim: Ros2Sim;
  onCommand?: (cmd: string) => void;
  className?: string;
  showModeToggle?: boolean;
}

export function Terminal({ sim, onCommand, className, showModeToggle = true }: TerminalProps) {
  const termRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const inputBufferRef = useRef('');
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);
  const [mode, setMode] = useState<TerminalMode>('cli');
  const modeRef = useRef<TerminalMode>('cli');
  const pythonBlockRef = useRef<string[]>([]);
  const inBlockRef = useRef(false);
  const pyodideLoadingRef = useRef(false);

  const writePrompt = useCallback(() => {
    const xterm = xtermRef.current;
    if (!xterm) return;
    if (modeRef.current === 'python') {
      if (inBlockRef.current) {
        xterm.write('\x1b[38;5;220m... \x1b[0m');
      } else {
        xterm.write('\x1b[38;5;76m>>> \x1b[0m');
      }
    } else {
      xterm.write('\x1b[38;5;76m$ \x1b[0m');
    }
  }, []);

  const writeLine = useCallback((text: string, colorCode?: string) => {
    const xterm = xtermRef.current;
    if (!xterm) return;
    if (colorCode) {
      xterm.writeln(`\x1b[38;5;${colorCode}m${text}\x1b[0m`);
    } else {
      xterm.writeln(text);
    }
  }, []);

  const handleCliCommand = useCallback((cmd: string) => {
    const parts = cmd.trim().split(/\s+/);
    if (parts[0] === 'ros2') {
      writeLine(sim.handleCliCommand(cmd));
    } else if (cmd === 'clear') {
      xtermRef.current?.clear();
    } else if (cmd === 'help') {
      writeLine('Available commands:', '252');
      writeLine('  ros2 node list           - List active nodes', '252');
      writeLine('  ros2 node info /name     - Show node details', '252');
      writeLine('  ros2 topic list          - List active topics', '252');
      writeLine('  ros2 topic echo /topic   - Stream topic data', '252');
      writeLine('  ros2 topic pub ...       - Publish to a topic', '252');
      writeLine('  ros2 service list        - List active services', '252');
      writeLine('  ros2 action list        - List active actions', '252');
      writeLine('  ros2 run pkg exec       - Run a node', '252');
      writeLine('  turtlesim               - Start turtlesim', '252');
      writeLine('  clear                   - Clear terminal', '252');
      writeLine('  help                    - Show this help', '252');
    } else if (cmd === 'turtlesim') {
      writeLine('Starting turtlesim node...', '76');
      sim.init();
      writeLine('turtlesim node started. Use the Simulation tab to see the turtle.', '76');
    } else if (cmd.startsWith('ros2 run ')) {
      writeLine(`[INFO] [ros2sim]: Running ${parts.slice(2).join(' ')}`, '76');
      if (cmd.includes('turtlesim')) {
        sim.init();
        writeLine('turtlesim node started.', '76');
      }
    } else if (cmd.startsWith('ros2 topic pub')) {
      const topicMatch = cmd.match(/ros2 topic pub\s+(\S+)\s+(\S+)\s+"(.+)"/);
      if (topicMatch) {
        const [, topic, , dataStr] = topicMatch;
        try {
          const data = JSON.parse(dataStr.replace(/(\w+):/g, '"$1":'));
          sim.publish(topic, 'user_published', data);
          writeLine(`Published to ${topic}`, '76');
        } catch {
          writeLine(`Published to ${topic} (raw)`, '76');
        }
      } else {
        writeLine('Usage: ros2 topic pub /topic type "{data}"', '220');
      }
    } else {
      onCommand?.(cmd);
    }
  }, [sim, onCommand, writeLine]);

  const handlePythonLine = useCallback(async (line: string) => {
    const xterm = xtermRef.current;
    if (!xterm) return;

    // Check if we're starting or continuing a block
    const trimmed = line.trimEnd();
    const startsBlock = trimmed.endsWith(':') && trimmed.length > 0;
    const isBlank = trimmed === '';

    if (startsBlock && !inBlockRef.current) {
      // Start of a new block
      inBlockRef.current = true;
      pythonBlockRef.current = [line];
      return;
    }

    if (inBlockRef.current) {
      if (isBlank || (!startsBlock && !line.startsWith(' ') && !line.startsWith('\t'))) {
        // End of block - execute it
        pythonBlockRef.current.push(line);
        const code = pythonBlockRef.current.join('\n');
        inBlockRef.current = false;
        pythonBlockRef.current = [];

        // Execute the block
        if (!isPyodideReady() && !pyodideLoadingRef.current) {
          pyodideLoadingRef.current = true;
          writeLine('Loading Python runtime...', '220');
          try {
            await loadPyodide();
            await globalRepl.start();
            writeLine('Python runtime ready!', '76');
          } catch (e: any) {
            writeLine(`Failed to load Python: ${e}`, '196');
            pyodideLoadingRef.current = false;
            return;
          }
          pyodideLoadingRef.current = false;
        }

        const result = await globalRepl.executeBlock(code);
        if (result.output.trim()) {
          for (const outLine of result.output.split('\n')) {
            writeLine(outLine, result.error ? '196' : undefined);
          }
        }
      } else {
        // Continue the block
        pythonBlockRef.current.push(line);
        return;
      }
    } else {
      // Single line execution
      if (!isPyodideReady() && !pyodideLoadingRef.current) {
        pyodideLoadingRef.current = true;
        writeLine('Loading Python runtime...', '220');
        try {
          await loadPyodide();
          await globalRepl.start();
          writeLine('Python runtime ready!', '76');
        } catch (e: any) {
          writeLine(`Failed to load Python: ${e}`, '196');
          pyodideLoadingRef.current = false;
          return;
        }
        pyodideLoadingRef.current = false;
      }

      if (trimmed === 'help()') {
        const result = await globalRepl.execute('_repl_help()');
        if (result.output.trim()) {
          for (const outLine of result.output.split('\n')) {
            writeLine(outLine);
          }
        }
        return;
      }

      if (trimmed === 'reset()' || trimmed === '%reset') {
        globalRepl.reset();
        writeLine('Session reset.', '76');
        return;
      }

      const result = await globalRepl.execute(line);
      if (result.output.trim()) {
        for (const outLine of result.output.split('\n')) {
          writeLine(outLine, result.error ? '196' : undefined);
        }
      }
    }
  }, [writeLine]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!termRef.current) return;

    const xterm = new XTerm({
      theme: {
        background: '#0a0e17',
        foreground: '#c8d6e5',
        cursor: '#10b981',
        cursorAccent: '#0a0e17',
        selectionBackground: '#1e293b',
        black: '#1e293b',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#e2e8f0',
        brightBlack: '#475569',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightCyan: '#22d3ee',
        brightWhite: '#f8fafc',
      },
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
    });

    const fit = new FitAddon();
    xterm.loadAddon(fit);
    xterm.open(termRef.current);
    fit.fit();

    xtermRef.current = xterm;
    fitRef.current = fit;

    xterm.writeln('\x1b[38;5;76mROS2Learn Terminal\x1b[0m');
    xterm.writeln('\x1b[38;5;243mType commands or Python code. Use the mode toggle to switch.\x1b[0m');
    xterm.writeln('');
    writePrompt();

    xterm.onData((data: string) => {
      switch (data) {
        case '\r': {
          const input = inputBufferRef.current.trim();
          xterm.writeln('');
          if (input) {
            historyRef.current.push(input);
            historyIdxRef.current = historyRef.current.length;

            if (modeRef.current === 'python') {
              // Handle Python asynchronously
              handlePythonLine(input);
            } else {
              // CLI mode - synchronous
              handleCliCommand(input);
            }
          } else if (modeRef.current === 'python' && inBlockRef.current) {
            // Blank line ends a Python block
            handlePythonLine('');
          }
          inputBufferRef.current = '';
          if (!inBlockRef.current) {
            writePrompt();
          }
          break;
        }
        case '\x7f': {
          if (inputBufferRef.current.length > 0) {
            inputBufferRef.current = inputBufferRef.current.slice(0, -1);
            xterm.write('\b \b');
          }
          break;
        }
        case '\x1b[A': {
          if (historyRef.current.length > 0 && historyIdxRef.current > 0) {
            historyIdxRef.current--;
            const clear = inputBufferRef.current.length;
            xterm.write('\b \b'.repeat(clear));
            inputBufferRef.current = historyRef.current[historyIdxRef.current];
            xterm.write(inputBufferRef.current);
          }
          break;
        }
        case '\x1b[B': {
          if (historyIdxRef.current < historyRef.current.length - 1) {
            historyIdxRef.current++;
            const clear = inputBufferRef.current.length;
            xterm.write('\b \b'.repeat(clear));
            inputBufferRef.current = historyRef.current[historyIdxRef.current];
            xterm.write(inputBufferRef.current);
          }
          break;
        }
        case '\x03': {
          xterm.writeln('^C');
          inputBufferRef.current = '';
          inBlockRef.current = false;
          pythonBlockRef.current = [];
          writePrompt();
          break;
        }
        default: {
          if (data >= ' ' && data.length === 1) {
            inputBufferRef.current += data;
            xterm.write(data);
          } else if (data === '\t') {
            // Tab - could add autocomplete later
          }
        }
      }
    });

    const unsubLog = sim.onLog((log) => {
      const colorMap: Record<string, string> = {
        INFO: '76',
        WARN: '220',
        ERROR: '196',
        DEBUG: '243',
      };
      const color = colorMap[log.level] || '252';
      const prefix = log.nodeName ? `[${log.level}] [${log.nodeName}]: ` : `[${log.level}]: `;
      xterm.writeln(`\x1b[38;5;${color}m${prefix}${log.message}\x1b[0m`);
    });

    const resizeObserver = new ResizeObserver(() => {
      fit.fit();
    });
    if (termRef.current) resizeObserver.observe(termRef.current);

    return () => {
      resizeObserver.disconnect();
      unsubLog();
      xterm.dispose();
    };
  }, [sim, onCommand, writePrompt, handleCliCommand, handlePythonLine]);

  const clearTerminal = useCallback(() => {
    xtermRef.current?.clear();
  }, []);

  return (
    <div className={`bg-[#0a0e17] rounded-lg overflow-hidden flex flex-col ${className || ''}`}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-800 border-b border-surface-700 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-error-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-success-500/60" />
          </div>
          <span className="text-xs text-surface-500 font-mono">Terminal</span>
        </div>
        {showModeToggle && (
          <div className="flex items-center gap-1 bg-surface-900 rounded-md p-0.5">
            <button
              onClick={() => {
                setMode('cli');
                inBlockRef.current = false;
                pythonBlockRef.current = [];
                writeLine('Switched to CLI mode', '243');
                writePrompt();
              }}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                mode === 'cli' ? 'bg-surface-700 text-primary-400' : 'text-surface-500 hover:text-surface-300'
              }`}
            >CLI</button>
            <button
              onClick={() => {
                setMode('python');
                writeLine('Switched to Python mode (type help() for ROS2 commands)', '243');
                writePrompt();
              }}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                mode === 'python' ? 'bg-surface-700 text-primary-400' : 'text-surface-500 hover:text-surface-300'
              }`}
            >Python</button>
          </div>
        )}
      </div>
      <div ref={termRef} className="flex-1 p-1" style={{ minHeight: '100px' }} />
    </div>
  );
}
