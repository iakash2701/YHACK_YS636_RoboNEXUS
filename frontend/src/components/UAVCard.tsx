import React from 'react';
import { Battery, Heart, Radio, Navigation, Gauge, Bot, Zap, AlertTriangle } from 'lucide-react';
import { UAV } from '../types';
import { RiskBadge } from './RiskBadge';

interface UAVCardProps {
  uav: UAV;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onSimulateLowBattery: (id: string) => void;
  onSimulateCommLoss: (id: string) => void;
  onSimulateFailure: (id: string) => void;
}

export const UAVCard: React.FC<UAVCardProps> = ({
  uav,
  isSelected,
  onSelect,
  onSimulateLowBattery,
  onSimulateCommLoss,
  onSimulateFailure,
}) => {
  const isChargerDown = uav.battery < 25;

  const getBatteryColor = (bat: number) => {
    if (bat > 60) return 'bg-emerald-500 text-emerald-400';
    if (bat > 25) return 'bg-amber-500 text-amber-400';
    return 'bg-rose-500 text-rose-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_ROUTE':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'ASSIGNED':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'RETURNING':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'FAILED':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse';
      case 'IDLE':
        return 'text-slate-400 bg-slate-800/40 border-slate-700/30';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div
      onClick={() => onSelect(uav.id)}
      className={`glass-panel rounded-xl p-4 cursor-pointer transition-all duration-300 relative overflow-hidden ${
        isSelected
          ? 'border-cyan-400 ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/20'
          : isChargerDown
          ? 'border-rose-500/60 bg-rose-950/20'
          : 'hover:border-cyan-500/40'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>{uav.id}</span>
              {isChargerDown && (
                <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold animate-pulse">
                  CHARGER DOWN
                </span>
              )}
            </h3>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getStatusColor(uav.status)}`}>
              {uav.status}
            </span>
          </div>
        </div>
        <RiskBadge level={uav.risk_level} probability={uav.risk_probability} size="sm" />
      </div>

      {/* Progress Bars: Battery/Charger, Health, Comms */}
      <div className="space-y-2 text-xs font-mono">
        {/* Battery / Charger */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center gap-1 text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Robot Charger
            </span>
            <span className={`font-bold ${isChargerDown ? 'text-rose-400 font-extrabold animate-pulse' : 'text-slate-200'}`}>
              {uav.battery.toFixed(1)}% {isChargerDown ? '(CRITICAL)' : ''}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getBatteryColor(uav.battery).split(' ')[0]}`}
              style={{ width: `${Math.min(100, Math.max(0, uav.battery))}%` }}
            />
          </div>
        </div>

        {/* Health */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center gap-1 text-slate-400">
              <Heart className="w-3.5 h-3.5" /> Hardware Health
            </span>
            <span className="text-slate-200 font-bold">{uav.health.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, uav.health))}%` }}
            />
          </div>
        </div>

        {/* Communication */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center gap-1 text-slate-400">
              <Radio className="w-3.5 h-3.5" /> Telemetry Link
            </span>
            <span className="text-slate-200 font-bold">{uav.communication.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, uav.communication))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Position & Current Task */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-cyan-400" /> Pos
          </span>
          <span className="text-slate-200 font-bold">
            ({uav.x.toFixed(1)}, {uav.y.toFixed(1)})
          </span>
        </div>
        <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800 truncate">
          <span className="text-slate-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-amber-400" /> Target
          </span>
          <span className="text-cyan-300 font-bold truncate block">
            {uav.current_task_id || 'Free / Idle'}
          </span>
        </div>
      </div>

      {/* Quick What-If Actions */}
      <div className="mt-3 pt-2 flex items-center justify-between gap-1 text-[10px] font-mono">
        <span className="text-slate-400">Simulate:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSimulateLowBattery(uav.id);
            }}
            title="Drop charger to 20% to trigger immediate hand-off"
            className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition font-bold"
          >
            ⚡ Charger Down
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSimulateCommLoss(uav.id);
            }}
            title="Drop comms link to 15%"
            className="px-1.5 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition"
          >
            Comms
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSimulateFailure(uav.id);
            }}
            title="Trigger robot hardware shutdown"
            className="px-1.5 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition"
          >
            Fail
          </button>
        </div>
      </div>
    </div>
  );
};
