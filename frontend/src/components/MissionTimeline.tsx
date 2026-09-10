import React from 'react';
import { MissionEvent } from '../types';
import { Clock, ShieldAlert, CheckCircle2, Navigation, AlertTriangle, Cpu, RotateCcw } from 'lucide-react';

interface MissionTimelineProps {
  events: MissionEvent[];
}

export const MissionTimeline: React.FC<MissionTimelineProps> = ({ events }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PREDICTIVE_REPLANNING':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'TASK_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'TASK_ASSIGNED':
        return <Navigation className="w-4 h-4 text-cyan-400" />;
      case 'UAV_FAILED':
        return <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />;
      case 'SYSTEM_RESET':
        return <RotateCcw className="w-4 h-4 text-slate-400" />;
      default:
        return <Cpu className="w-4 h-4 text-blue-400" />;
    }
  };

  const getEventBorder = (type: string) => {
    switch (type) {
      case 'PREDICTIVE_REPLANNING':
        return 'border-rose-500/40 bg-rose-500/10 text-rose-300';
      case 'TASK_COMPLETED':
        return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
      case 'UAV_FAILED':
        return 'border-rose-600/60 bg-rose-600/20 text-rose-200';
      default:
        return 'border-slate-800 bg-slate-900/60 text-slate-300';
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-cyan-400" />
          Mission Event Stream ({events.length})
        </h2>
        <span className="text-[11px] text-slate-400">Chronological Log</span>
      </div>

      <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
        {events.length === 0 ? (
          <div className="text-slate-500 text-center py-6 text-[11px]">
            No mission events recorded yet. Plan or start simulation to stream live events.
          </div>
        ) : (
          events.map((evt, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border transition ${getEventBorder(evt.event_type)}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  {getEventIcon(evt.event_type)}
                  <span>{evt.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-sans">
                  {evt.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {evt.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
