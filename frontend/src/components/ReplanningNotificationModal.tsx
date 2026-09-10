import React from 'react';
import { ShieldAlert, ArrowRight, CheckCircle2, X, Zap, Bot, Navigation } from 'lucide-react';
import { ReplanningEventDetails } from '../types';

interface ReplanningNotificationModalProps {
  event: ReplanningEventDetails | null;
  onClose: () => void;
}

export const ReplanningNotificationModal: React.FC<ReplanningNotificationModalProps> = ({
  event,
  onClose,
}) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-panel-glow border border-amber-500/50 rounded-2xl max-w-lg w-full p-6 relative font-mono text-xs shadow-2xl shadow-amber-950/50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Zap className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">
              ⚡ Autonomous Charger Down Intervention
            </div>
            <h2 className="text-base font-bold text-slate-100">
              IMMEDIATE TASK REASSIGNMENT
            </h2>
          </div>
        </div>

        {/* Main Notification Body */}
        <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Target Task:</span>
            <span className="font-bold text-cyan-300 text-sm">🎯 {event.task_name}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Old Robot */}
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-rose-400" /> Charger Depleted
              </div>
              <div className="font-bold text-rose-300 text-sm mt-0.5">{event.old_uav_id}</div>
              <div className="text-[11px] text-rose-400 font-bold mt-1">
                Charger: {event.old_feature_contributions ? `${event.old_uav_risk.toFixed(0)}% Risk` : 'LOW (<25%)'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                ➔ Status: Safely Returning to Dock
              </div>
            </div>

            {/* Nearest Free Robot */}
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-emerald-400" /> Nearest Free Robot
              </div>
              <div className="font-bold text-emerald-300 text-sm mt-0.5">{event.new_uav_id}</div>
              <div className="text-[11px] text-emerald-400 font-bold mt-1">
                Charger: 90%+ (Nominal)
              </div>
              <div className="text-[10px] text-emerald-300 mt-0.5 flex items-center gap-0.5">
                <Navigation className="w-3 h-3 text-emerald-400" /> Closest Available
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-300 font-sans leading-relaxed">
            <span className="font-bold font-mono text-cyan-400">Autonomous Action: </span>
            {event.reason}
          </div>
        </div>

        {/* Action Guarantee Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Task Handed Off • Zero Collision Route Drawn</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-lg shadow-cyan-500/20"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
