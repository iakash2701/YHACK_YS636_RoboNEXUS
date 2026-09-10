import React from 'react';
import { Heart, Radio, Navigation, Gauge, Bot, Zap, BatteryCharging, Clock, Activity } from 'lucide-react';
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
  const isLowBattery = uav.battery <= 10 || uav.status === 'LOW_BATTERY' || uav.status === 'MOVING_TO_CHARGER';
  const isCharging = uav.status === 'CHARGING';
  const isQueued = uav.status === 'WAITING_FOR_CHARGER';

  const getBatteryColor = (bat: number) => {
    if (bat > 50) return 'bg-emerald-500 text-emerald-400';
    if (bat > 15) return 'bg-amber-500 text-amber-400';
    return 'bg-rose-500 text-rose-400';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CHARGING':
        return { text: '⚡ CHARGING', style: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40 font-bold animate-pulse' };
      case 'WAITING_FOR_CHARGER':
        return { text: `⏳ QUEUE #${uav.queue_position || 1}`, style: 'text-purple-300 bg-purple-500/20 border-purple-500/40 font-bold' };
      case 'MOVING_TO_CHARGER':
        return { text: '🔋 TO CHARGER', style: 'text-amber-300 bg-amber-500/20 border-amber-500/40 font-bold' };
      case 'LOW_BATTERY':
        return { text: '⚠️ LOW BATTERY', style: 'text-rose-300 bg-rose-500/20 border-rose-500/40 font-bold animate-pulse' };
      case 'WORKING':
      case 'EN_ROUTE':
      case 'ASSIGNED':
        return { text: 'WORKING', style: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30 font-bold' };
      case 'AVAILABLE':
      case 'IDLE':
        return { text: 'AVAILABLE', style: 'text-slate-300 bg-slate-800/60 border-slate-700/50' };
      case 'FAILED':
        return { text: 'FAILED', style: 'text-rose-400 bg-rose-500/20 border-rose-500/40 font-bold' };
      default:
        return { text: status, style: 'text-slate-300 bg-slate-800 border-slate-700' };
    }
  };

  const badge = getStatusBadge(uav.status);

  return (
    <div
      onClick={() => onSelect(uav.id)}
      className={`glass-panel rounded-xl p-3.5 cursor-pointer transition-all duration-300 relative overflow-hidden font-mono ${
        isSelected
          ? 'border-cyan-400 ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/20 bg-cyan-950/20'
          : isCharging
          ? 'border-emerald-500/60 bg-emerald-950/20'
          : isQueued
          ? 'border-purple-500/50 bg-purple-950/20'
          : isLowBattery
          ? 'border-rose-500/60 bg-rose-950/20'
          : 'hover:border-cyan-500/40'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
            isCharging
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
              : isLowBattery
              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse'
              : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
          }`}>
            {isCharging ? <BatteryCharging className="w-5 h-5 animate-pulse" /> : <Bot className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>{uav.id}</span>
            </h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border inline-block mt-0.5 ${badge.style}`}>
              {badge.text}
            </span>
          </div>
        </div>
        <RiskBadge level={uav.risk_level} probability={uav.risk_probability} size="sm" />
      </div>

      {/* Progress Bars: Battery, Health, Comms */}
      <div className="space-y-2 text-xs">
        {/* Battery */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center gap-1 text-slate-400">
              <Zap className={`w-3.5 h-3.5 ${isCharging ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
              Battery:
            </span>
            <span className={`font-bold ${isCharging ? 'text-emerald-400 font-extrabold' : isLowBattery ? 'text-rose-400 font-extrabold animate-pulse' : 'text-slate-200'}`}>
              {uav.battery.toFixed(1)}% {isCharging ? '(CHARGING...)' : isLowBattery ? '(<= 10% CRITICAL)' : ''}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getBatteryColor(uav.battery).split(' ')[0]}`}
              style={{ width: `${Math.min(100, Math.max(0, uav.battery))}%` }}
            />
          </div>
        </div>

        {/* Health */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center gap-1 text-slate-400">
              <Heart className="w-3.5 h-3.5 text-blue-400" /> Health:
            </span>
            <span className="text-slate-200 font-bold">{uav.health.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, uav.health))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Task & Action */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-amber-400" /> Task:
          </span>
          <span className="text-cyan-300 font-bold truncate max-w-[140px]">
            {uav.current_task_id || 'Available Pool'}
          </span>
        </div>

        <div className="bg-slate-900/80 px-2 py-1 rounded border border-slate-800/80 text-[10.5px]">
          <span className="text-slate-400 flex items-center gap-1 mb-0.5">
            <Activity className="w-3 h-3 text-cyan-400" /> Action:
          </span>
          <span className={`font-semibold block truncate ${
            isCharging
              ? 'text-emerald-300 font-bold'
              : isLowBattery
              ? 'text-rose-300 font-bold'
              : 'text-slate-200'
          }`}>
            {uav.current_action || (uav.current_task_id ? `Assigned to ${uav.current_task_id}` : 'Standby in Fleet Pool')}
          </span>
        </div>
      </div>

      {/* Quick Simulate Buttons */}
      <div className="mt-2.5 pt-2 flex items-center justify-between gap-1 text-[10px]">
        <span className="text-slate-400">Simulate:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSimulateLowBattery(uav.id);
            }}
            title="Drop battery to 10% to trigger low battery handover"
            className="px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition font-bold"
          >
            ⚡ Bat = 10%
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
            title="Trigger robot failure"
            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Fail
          </button>
        </div>
      </div>
    </div>
  );
};
