import React from 'react';
import { Sparkles, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { ReplanningEventDetails } from '../types';

interface AIDecisionPanelProps {
  lastReplanningEvent?: ReplanningEventDetails | null;
  replanningCount: number;
  preventedFailures: number;
}

export const AIDecisionPanel: React.FC<AIDecisionPanelProps> = ({
  lastReplanningEvent,
  replanningCount,
  preventedFailures,
}) => {
  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            AI Decision Rationale & Novelty
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
          {preventedFailures} Failures Prevented
        </span>
      </div>

      <div className="space-y-3 flex-1">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="text-slate-300 font-bold mb-2 flex items-center gap-1.5 text-[11px] text-cyan-300">
            <span>Why does the Predictive Planner trigger proactive reassignment?</span>
          </div>
          <div className="space-y-1.5 text-slate-300 text-[11px]">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Sense: Real-time telemetry, wind factors, and battery draw.</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Predict: ML model forecasts future failure risk &gt; 70%.</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Decide: Identify alternative UAV with safer energy envelope.</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Prevent: Reassign target BEFORE UAV depletes or crashes.</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Replan: Generate collision-free A* route for replacement.</span>
            </div>
          </div>
        </div>

        {lastReplanningEvent ? (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-rose-300 font-bold">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Latest Autonomous Reassignment
              </span>
              <span className="text-[10px] text-slate-400">Live Decision</span>
            </div>
            <div className="text-[11px] text-slate-200">
              Reassigned <span className="font-bold text-cyan-300">{lastReplanningEvent.task_name}</span>:
            </div>
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded text-[11px]">
              <div>
                <span className="text-slate-400">Old: </span>
                <span className="text-rose-400 font-bold">{lastReplanningEvent.old_uav_id} ({lastReplanningEvent.old_uav_risk}%)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <div>
                <span className="text-slate-400">New: </span>
                <span className="text-emerald-400 font-bold">{lastReplanningEvent.new_uav_id} ({lastReplanningEvent.new_uav_risk}%)</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-300 pt-1">
              <span className="font-bold text-cyan-400">Causal Factor: </span>
              {lastReplanningEvent.reason}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-slate-900/30 border border-slate-800/80 text-[11px] text-slate-400 text-center py-4">
            No active replanning triggers required yet. All UAVs operating in nominal envelope.
          </div>
        )}
      </div>
    </div>
  );
};
