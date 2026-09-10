import React from 'react';
import { Task } from '../types';
import { Target, CheckCircle2, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

interface TaskPanelProps {
  tasks: Task[];
}

export const TaskPanel: React.FC<TaskPanelProps> = ({ tasks }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED
          </span>
        );
      case 'REASSIGNED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <ArrowRight className="w-3 h-3" /> REASSIGNED
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Clock className="w-3 h-3" /> ASSIGNED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            PENDING
          </span>
        );
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (priority >= 4) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          Mission Tasks ({tasks.length})
        </h2>
        <span className="text-[11px] text-slate-400 font-mono">
          {tasks.filter((t) => t.status === 'COMPLETED').length} / {tasks.length} Completed
        </span>
      </div>

      <div className="space-y-2.5 overflow-y-auto max-h-[320px] pr-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 text-xs font-mono"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100">{task.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] border ${getPriorityColor(task.priority)}`}>
                  Priority {task.priority}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Target: ({task.x}, {task.y}) • UAV: <span className="text-cyan-300 font-bold">{task.assigned_uav_id || 'Unassigned'}</span>
              </div>
            </div>

            <div>{getStatusBadge(task.status)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
