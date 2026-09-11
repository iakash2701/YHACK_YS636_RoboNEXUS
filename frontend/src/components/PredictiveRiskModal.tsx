import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, X, Zap, ArrowRight, Clock, Activity, AlertOctagon } from 'lucide-react';
import { PredictiveRiskAlert } from '../types';

interface PredictiveRiskModalProps {
  alert: PredictiveRiskAlert | null;
  onAcknowledge: (robotId: string) => void;
  onClose: () => void;
}

export const PredictiveRiskModal: React.FC<PredictiveRiskModalProps> = ({
  alert,
  onAcknowledge,
  onClose,
}) => {
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  if (!alert) return null;

  const handleAcknowledgeClick = () => {
    if (isAcknowledged) return; // Prevent rapid duplicate clicks
    setIsAcknowledged(true);
    onAcknowledge(alert.robot_id);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 font-mono">
      <div className="glass-panel-glow border-2 border-amber-500/70 rounded-2xl max-w-lg w-full p-6 relative text-xs shadow-2xl shadow-amber-950/80 bg-[#090e1a]">
        <button
          onClick={handleAcknowledgeClick}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition p-1 rounded-lg hover:bg-slate-800"
          title="Close and Prevent"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="text-[10.5px] text-amber-400 uppercase tracking-widest font-black flex items-center gap-1.5">
              <span>⚠️ PREDICTED MISSION FAILURE</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200 text-[9px] font-bold">
                PRE-FAILURE ALERT
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-0.5">
              {alert.robot_id} Failure Predicted in ~{alert.predicted_failure_minutes.toFixed(1)} Min
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-3.5 bg-slate-950/90 p-4 rounded-xl border border-slate-800/80">
          <div className="text-slate-200 text-xs leading-relaxed">
            Predictive Risk Engine forecasts that <strong className="text-amber-400 font-bold">{alert.robot_id}</strong> will be unable to safely complete its assigned task before battery exhaustion.
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-3 gap-2 py-1">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Current Battery</div>
              <div className="text-sm font-black text-amber-400">{alert.battery.toFixed(1)}%</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Predicted Risk</div>
              <div className="text-sm font-black text-rose-400">{alert.risk_probability}% HIGH</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Est. Time to Failure</div>
              <div className="text-sm font-black text-cyan-400">~{alert.predicted_failure_minutes.toFixed(1)}m</div>
            </div>
          </div>

          {/* Task Reassignment Card */}
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 uppercase tracking-wider font-bold">Recommended Preventive Action:</span>
              <span className="font-bold text-amber-300">PREVENTIVE REASSIGNMENT</span>
            </div>
            <div className="text-xs text-slate-200 flex items-center justify-between pt-1 border-t border-cyan-500/20">
              <span className="font-bold text-slate-300">{alert.task_name || 'Active Task'}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">{alert.robot_id}</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-emerald-400">{alert.replacement_id || 'Robot 4'}</span>
              </div>
            </div>
          </div>

          <div className="text-[10.5px] text-slate-400 flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {alert.robot_id} will safely return to the charger without crashing. Mission continues with 0 downtime.
            </span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Preventative Action Flow</span>
          </div>

          <button
            onClick={handleAcknowledgeClick}
            disabled={isAcknowledged}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/25 flex items-center gap-1.5 active:scale-95"
          >
            <span>ACKNOWLEDGE & PREVENT FAILURE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
