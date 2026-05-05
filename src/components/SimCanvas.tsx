import { useEffect, useRef, useCallback } from 'react';
import { type Ros2Sim, type TurtleState } from '../lib/ros2sim';

interface SimCanvasProps {
  sim: Ros2Sim;
  className?: string;
}

const CANVAS_SIZE = 11.0;
const PADDING = 20;

export function SimCanvas({ sim, className }: SimCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const toCanvasX = useCallback((x: number, width: number) => {
    return PADDING + (x / CANVAS_SIZE) * (width - 2 * PADDING);
  }, []);

  const toCanvasY = useCallback((y: number, height: number) => {
    return PADDING + ((CANVAS_SIZE - y) / CANVAS_SIZE) * (height - 2 * PADDING);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Background
    ctx.fillStyle = '#0c1629';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#1a2744';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= CANVAS_SIZE; i++) {
      const x = toCanvasX(i, width);
      const y = toCanvasY(i, height);
      ctx.beginPath();
      ctx.moveTo(x, PADDING);
      ctx.lineTo(x, height - PADDING);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PADDING, y);
      ctx.lineTo(width - PADDING, y);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = '#2a3f5f';
    ctx.lineWidth = 1;
    ctx.strokeRect(PADDING, PADDING, width - 2 * PADDING, height - 2 * PADDING);

    // Draw turtles
    for (const [, turtle] of sim.turtles) {
      // Trail
      if (turtle.penOn && turtle.trail.length > 1) {
        ctx.strokeStyle = `rgb(${turtle.penColor.r}, ${turtle.penColor.g}, ${turtle.penColor.b})`;
        ctx.lineWidth = turtle.penWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(toCanvasX(turtle.trail[0].x, width), toCanvasY(turtle.trail[0].y, height));
        for (let i = 1; i < turtle.trail.length; i++) {
          ctx.lineTo(toCanvasX(turtle.trail[i].x, width), toCanvasY(turtle.trail[i].y, height));
        }
        ctx.stroke();
      }

      // Turtle body
      const cx = toCanvasX(turtle.x, width);
      const cy = toCanvasY(turtle.y, height);
      const radius = 12;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-turtle.theta);

      // Shell
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Shell pattern
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      // Head direction indicator
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(radius + 4, 0);
      ctx.lineTo(radius - 2, -5);
      ctx.lineTo(radius - 2, 5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Position label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `(${turtle.x.toFixed(1)}, ${turtle.y.toFixed(1)})`,
        cx, cy + radius + 14
      );
    }

    // Telemetry overlay
    const turtle1 = sim.turtles.get('turtle1');
    if (turtle1) {
      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      const tx = PADDING + 4;
      const ty = height - PADDING - 4;
      ctx.fillText(
        `x: ${turtle1.x.toFixed(2)}  y: ${turtle1.y.toFixed(2)}  θ: ${turtle1.theta.toFixed(2)}  v: ${turtle1.linearX.toFixed(2)}  ω: ${turtle1.angularZ.toFixed(2)}`,
        tx, ty
      );
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, [sim, toCanvasX, toCanvasY]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  return (
    <div className={`bg-[#0c1629] rounded-lg overflow-hidden border border-surface-800 ${className || ''}`}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-800 border-b border-surface-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          <span className="text-xs text-surface-500 font-mono">Turtlesim</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => sim.setSimSpeed(0.5)}
            className="text-xs text-surface-500 hover:text-surface-300 px-1.5 py-0.5 rounded transition-colors"
          >0.5x</button>
          <button
            onClick={() => sim.setSimSpeed(1.0)}
            className="text-xs text-surface-500 hover:text-surface-300 px-1.5 py-0.5 rounded transition-colors"
          >1x</button>
          <button
            onClick={() => sim.setSimSpeed(2.0)}
            className="text-xs text-surface-500 hover:text-surface-300 px-1.5 py-0.5 rounded transition-colors"
          >2x</button>
          <button
            onClick={() => {
              sim.reset();
              sim.init();
            }}
            className="text-xs text-surface-500 hover:text-surface-300 px-1.5 py-0.5 rounded transition-colors"
          >Reset</button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: 'calc(100% - 28px)', minHeight: '200px' }}
      />
    </div>
  );
}
