import { useEffect, useRef, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { type Ros2Sim } from '../lib/ros2sim';

interface TerminalProps {
  sim: Ros2Sim;
  onCommand?: (cmd: string) => void;
  className?: string;
}

export function Terminal({ sim, onCommand, className }: TerminalProps) {
  const termRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const inputBufferRef = useRef('');
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);

  const writeLine = useCallback((text: string, color?: string) => {
    const xterm = xtermRef.current;
    if (!xterm) return;
    if (color) {
      xterm.writeln(`\x1b[38;5;${color}m${text}\x1b[0m`);
    } else {
      xterm.writeln(text);
    }
  }, []);

  const writePrompt = useCallback(() => {
    const xterm = xtermRef.current;
    if (!xterm) return;
    xterm.write('\x1b[38;5;76m$ \x1b[0m');
  }, []);

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
    xterm.writeln('\x1b[38;5;243mType Python code or ros2 CLI commands. Press Enter to run.\x1b[0m');
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
            if (input.startsWith('ros2 ')) {
              const output = sim.handleCliCommand(input);
              xterm.writeln(output);
            } else if (input === 'clear') {
              xterm.clear();
            } else if (input === 'help') {
              xterm.writeln('Available commands:');
              xterm.writeln('  ros2 node list       - List active nodes');
              xterm.writeln('  ros2 topic list      - List active topics');
              xterm.writeln('  ros2 service list    - List active services');
              xterm.writeln('  ros2 action list     - List active actions');
              xterm.writeln('  clear                - Clear terminal');
              xterm.writeln('  help                 - Show this help');
            } else {
              onCommand?.(input);
            }
          }
          inputBufferRef.current = '';
          writePrompt();
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
          writePrompt();
          break;
        }
        default: {
          if (data >= ' ' && data.length === 1) {
            inputBufferRef.current += data;
            xterm.write(data);
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
  }, [sim, onCommand, writeLine, writePrompt]);

  const writeOutput = useCallback((text: string) => {
    writeLine(text);
  }, [writeLine]);

  const clearTerminal = useCallback(() => {
    xtermRef.current?.clear();
  }, []);

  return (
    <div className={`bg-[#0a0e17] rounded-lg overflow-hidden ${className || ''}`}>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-800 border-b border-surface-700">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-error-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-success-500/60" />
        </div>
        <span className="text-xs text-surface-500 font-mono">Terminal</span>
      </div>
      <div ref={termRef} className="p-1" style={{ height: 'calc(100% - 28px)' }} />
    </div>
  );
}
