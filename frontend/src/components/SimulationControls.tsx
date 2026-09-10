import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Navigation2, RefreshCw, Compass } from 'lucide-react';

interface SimulationControlsProps {
  isPlaying: boolean;
  status: string;
  speed: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onPlan: () => void;
  onReplan: () => void;
  onStep: () => void;
  onSpeedChange: (speed: number) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPlaying,
  status,
  speed,
  onStart,
  onPause,
  onReset,
  onPlan,
  onReplan,
  onStep,
  onSpeedChange,
}) => {
  return (
    <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
      {/* Primary Action Buttons */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Plan Mission */}
        <button
          onClick={onPlan}
          className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-500/10"
        >
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>Plan Mission (A* + Risk)</span>
        </button>

        {/* Start / Pause */}
        {isPlaying ? (
          <button
            onClick={onPause}
            className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <Pause className="w-4 h-4 text-amber-400" />
            <span>Pause Simulation</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/10"
          >
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Start Simulation</span>
          </button>
        )}

        {/* Step */}
        <button
          onClick={onStep}
          disabled={isPlaying}
          className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <FastForward className="w-3.5 h-3.5 text-slate-300" />
          <span>Step</span>
        </button>

        {/* Force Replan Now */}
        <button
          onClick={onReplan}
          className="px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
          <span>Evaluate Replan</span>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Speed Controls */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-[11px]">Speed:</span>
        <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
          {[1, 2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                speed === s
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
