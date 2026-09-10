import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, X, Zap, Bot, ArrowRight, BatteryCharging, AlertTriangle } from 'lucide-react';
import { LowBatteryAlert } from '../types';

interface LowBatteryAcknowledgementModalProps {
  alert: LowBatteryAlert | null;
  onAcknowledge: (robotId: string) => void;
  onClose: () => void;
}

export const LowBatteryAcknowledgementModal: React.FC<LowBatteryAcknowledgementModalProps> = ({
  alert,
  onAcknowledge,
  onClose,
}) => {
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  if (!alert) return null;

  const handleAcknowledgeClick = () => {
    if (isAcknowledged) return; // Prevent duplicate rapid clicks
    setIsAcknowledged(true);
    onAcknowledge(alert.robot_id);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 font-mono">
      <div className="glass-panel-glow border-2 border-rose-500/60 rounded-2xl max-w-lg w-full p-6 relative text-xs shadow-2xl shadow-rose-950/80 bg-[#090e1a]">
        <button
          onClick={handleAcknowledgeClick}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition p-1 rounded-lg hover:bg-slate-800"
          title="Close and Acknowledge"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="text-[10.5px] text-rose-400 uppercase tracking-widest font-black flex items-center gap-1.5">
              <span>⚠ LOW BATTERY ALERT</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 text-[9px] font-bold">
                CRITICAL THRESHOLD
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-0.5">
              {alert.robot_id} Battery $\le$ 10% Warning
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
          <div className="text-slate-200 text-xs leading-relaxed">
            <strong className="text-rose-400 font-bold">{alert.robot_id}</strong> battery has reached{' '}
            <strong className="text-rose-400 font-bold">{alert.battery.toFixed(1)}%</strong>.
          </div>

          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300">
            <Zap className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <span>{alert.robot_id} requires emergency transit to the Charging Station.</span>
          </div>

          {alert.task_id && (
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Active Mission Task:</span>
                <span className="font-bold text-cyan-200">🎯 {alert.task_name || alert.task_id}</span>
              </div>
              <div className="text-[10.5px] text-slate-300 flex items-center gap-1">
                <span>Autonomous Handover:</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-emerald-400">{alert.replacement_id || 'Robot 4'}</span>
                <span>will take over immediately upon acknowledgement.</span>
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-400 italic">
            Note: Robots not involved in this task will continue their operations uninterrupted.
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Single-event confirmation</span>
          </div>

          <button
            onClick={handleAcknowledgeClick}
            disabled={isAcknowledged}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 active:scale-95"
          >
            <span>ACKNOWLEDGE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
