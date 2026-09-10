import React from 'react';
import { UAV } from '../types';
import { ShieldAlert, Cpu, HelpCircle, CheckCircle } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

interface RiskPanelProps {
  selectedUAV?: UAV;
}

export const RiskPanel: React.FC<RiskPanelProps> = ({ selectedUAV }) => {
  if (!selectedUAV) {
    return (
      <div className="glass-panel rounded-xl p-4 flex items-center justify-center text-slate-500 font-mono text-xs h-full">
        Select a UAV from the fleet to inspect real-time risk telemetry and AI explanations.
      </div>
    );
  }

  const contributions = selectedUAV.feature_contributions || {
    'Battery level': 35.0,
    'Distance to task': 25.0,
    'Communication quality': 15.0,
    'Estimated energy': 12.0,
    'UAV health': 8.0,
    'Weather conditions': 5.0,
  };

  const getBarColor = (factor: string) => {
    switch (factor) {
      case 'Battery level': return 'bg-rose-500';
      case 'Distance to task': return 'bg-amber-500';
      case 'Estimated energy': return 'bg-cyan-500';
      case 'Communication quality': return 'bg-blue-500';
      case 'UAV health': return 'bg-purple-500';
      default: return 'bg-emerald-500';
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Explainable AI: Risk Telemetry ({selectedUAV.id})
          </h2>
        </div>
        <RiskBadge level={selectedUAV.risk_level} probability={selectedUAV.risk_probability} size="sm" />
      </div>

      {/* Main Risk Summary Card */}
      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 mb-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Predicted Failure Risk:</span>
          <span className={`text-base font-bold ${
            selectedUAV.risk_level === 'HIGH' ? 'text-rose-400' : selectedUAV.risk_level === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {selectedUAV.risk_probability?.toFixed(1) || 0.0}% ({selectedUAV.risk_level})
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-300 font-sans border-t border-slate-800/80 pt-2">
          <span className="text-cyan-400 font-semibold font-mono">AI Assessment: </span>
          {selectedUAV.risk_level === 'HIGH' ? (
            <span className="text-rose-300">High probability of mid-route mission failure. Proactive replanning triggered to prevent UAV loss.</span>
          ) : selectedUAV.risk_level === 'MEDIUM' ? (
            <span className="text-amber-300">Elevated stress detected on telemetry. Safe envelope maintained with continuous risk monitoring.</span>
          ) : (
            <span className="text-emerald-300">Flight parameters optimal. Battery reserve and comms exceed mission threshold.</span>
          )}
        </div>
      </div>

      {/* Feature Contributions Progress Bars */}
      <div className="space-y-2.5 font-mono text-xs flex-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold uppercase">Risk Factor Contribution (XAI)</span>
          <span>Stress Weight</span>
        </div>

        {Object.entries(contributions).map(([factor, percentage]) => (
          <div key={factor} className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300">{factor}</span>
              <span className="text-slate-200 font-bold">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getBarColor(factor)}`}
                style={{ width: `${Math.min(100, Math.max(2, percentage))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        Normalized feature contributions generated from Random Forest ensemble impact.
      </div>
    </div>
  );
};
