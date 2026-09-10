import React from 'react';
import { PlannerComparisonResult } from '../types';
import { Scale, CheckCircle2, XCircle, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';

interface ComparisonPanelProps {
  comparison: PlannerComparisonResult | null;
  onRefresh: () => void;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ comparison, onRefresh }) => {
  if (!comparison) {
    return (
      <div className="glass-panel rounded-xl p-4 flex items-center justify-between text-slate-500 font-mono text-xs">
        <span>Loading baseline comparison metrics...</span>
        <button onClick={onRefresh} className="p-1 text-cyan-400 hover:text-cyan-300">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const { reactive, predictive, summary } = comparison;

  return (
    <div className="glass-panel rounded-xl p-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Evaluation: Reactive Baseline vs Proposed Predictive Planner
          </h2>
        </div>
        <button
          onClick={onRefresh}
          title="Re-run empirical evaluation"
          className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-run Dual Sim
        </button>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400">
              <th className="py-2 px-3 font-medium">Evaluation Metric</th>
              <th className="py-2 px-3 font-medium text-slate-300">Reactive Baseline (Post-Failure)</th>
              <th className="py-2 px-3 font-bold text-cyan-400">Proposed Predictive Planner</th>
              <th className="py-2 px-3 font-medium text-emerald-400">Improvement Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {/* Completion Rate */}
            <tr className="hover:bg-slate-900/30">
              <td className="py-2.5 px-3 text-slate-300 font-medium">Mission Completion Rate</td>
              <td className="py-2.5 px-3 text-rose-300">{reactive.completion_rate.toFixed(1)}%</td>
              <td className="py-2.5 px-3 font-bold text-emerald-400">{predictive.completion_rate.toFixed(1)}%</td>
              <td className="py-2.5 px-3 text-emerald-400 font-bold">
                +{summary.completion_advantage.toFixed(1)}%
              </td>
            </tr>

            {/* UAV Failures */}
            <tr className="hover:bg-slate-900/30">
              <td className="py-2.5 px-3 text-slate-300 font-medium">UAV Crashes / Failures</td>
              <td className="py-2.5 px-3 text-rose-400 font-bold">{reactive.uav_failures} crashes</td>
              <td className="py-2.5 px-3 text-emerald-400 font-bold">{predictive.uav_failures} crashes</td>
              <td className="py-2.5 px-3 text-emerald-400 font-bold">
                -{summary.failures_prevented} crashes prevented
              </td>
            </tr>

            {/* Failure Prevention Rate */}
            <tr className="hover:bg-slate-900/30">
              <td className="py-2.5 px-3 text-slate-300 font-medium">Failure Prevention Rate</td>
              <td className="py-2.5 px-3 text-slate-400">0.0% (No prediction)</td>
              <td className="py-2.5 px-3 font-bold text-cyan-300">{predictive.failure_prevention_rate.toFixed(1)}%</td>
              <td className="py-2.5 px-3 text-cyan-300 font-bold">Proactive Reassignment</td>
            </tr>

            {/* Energy Consumed */}
            <tr className="hover:bg-slate-900/30">
              <td className="py-2.5 px-3 text-slate-300 font-medium">Total Energy Expended</td>
              <td className="py-2.5 px-3 text-slate-300">{reactive.total_energy_consumed.toFixed(1)}%</td>
              <td className="py-2.5 px-3 text-cyan-300">{predictive.total_energy_consumed.toFixed(1)}%</td>
              <td className="py-2.5 px-3 text-emerald-400 font-bold">
                {summary.energy_savings_pct > 0 ? `-${summary.energy_savings_pct}% optimized` : 'Nominal'}
              </td>
            </tr>

            {/* Mission Duration */}
            <tr className="hover:bg-slate-900/30">
              <td className="py-2.5 px-3 text-slate-300 font-medium">Mission Duration</td>
              <td className="py-2.5 px-3 text-slate-300">{reactive.mission_duration_seconds.toFixed(1)}s</td>
              <td className="py-2.5 px-3 text-cyan-300">{predictive.mission_duration_seconds.toFixed(1)}s</td>
              <td className="py-2.5 px-3 text-emerald-400 font-bold">
                {summary.time_savings_seconds > 0 ? `-${summary.time_savings_seconds.toFixed(1)}s faster` : 'Synchronized'}
              </td>
            </tr>

            {/* Replanning Events */}
            <tr className="hover:bg-slate-900/30">
              <td className="py-2.5 px-3 text-slate-300 font-medium">Replanning Trigger Mode</td>
              <td className="py-2.5 px-3 text-amber-300">Reactive (After Crash)</td>
              <td className="py-2.5 px-3 text-emerald-400 font-bold">Predictive (Before Failure)</td>
              <td className="py-2.5 px-3 text-cyan-400">Zero Mission Stall</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-slate-300 font-sans flex items-start gap-2">
        <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cyan-300 font-mono">Academic Contribution: </span>
          Traditional mission planners operate reactively by attempting recovery only after a drone experiences battery exhaustion or failsafe trip.
          The proposed system continuously executes <span className="font-mono text-cyan-300 font-bold">Sense → Predict → Decide → Prevent → Replan</span> to maintain 100% fleet integrity.
        </div>
      </div>
    </div>
  );
};
