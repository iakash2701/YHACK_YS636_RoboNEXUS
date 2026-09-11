import React from 'react';
import { Zap, Users, RotateCcw, AlertTriangle, ShieldCheck, BatteryCharging, ArrowRight } from 'lucide-react';
import { ChargingStation } from '../types';

interface HackathonDemoBarProps {
  onSimulatePredictiveRiskDemo?: () => void;
  onSimulateRobot1LowBattery: () => void;
  onSimulateChargingQueue: () => void;
  onResetFleet: () => void;
  chargingStation?: ChargingStation;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const HackathonDemoBar: React.FC<HackathonDemoBarProps> = ({
  onSimulatePredictiveRiskDemo,
  onSimulateRobot1LowBattery,
  onSimulateChargingQueue,
  onResetFleet,
  chargingStation,
  isPlaying,
  onTogglePlay,
}) => {
  return (
    <div className="glass-panel-glow rounded-xl p-3.5 border border-cyan-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Hackathon Header & Live Station Telemetry */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                Hackathon Demo Control
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                PREDICT ➔ PREVENT ➔ REASSIGN ➔ REPLAN
              </span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
              <span>
                Charging Station:{' '}
                <strong className={chargingStation?.currently_charging_uav_id ? 'text-emerald-400' : 'text-slate-400'}>
                  {chargingStation?.currently_charging_uav_id ? `⚡ ${chargingStation.currently_charging_uav_id}` : '🟢 FREE'}
                </strong>
              </span>
              <span>•</span>
              <span>
                FIFO Queue:{' '}
                <strong className={chargingStation?.queue && chargingStation.queue.length > 0 ? 'text-amber-400' : 'text-slate-400'}>
                  {chargingStation?.queue && chargingStation.queue.length > 0 ? chargingStation.queue.join(', ') : '0 Waiting'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: 1-Click Interactive Demo Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Core Innovation Button: Predict & Prevent (Robot 1 Risk Surge) */}
          {onSimulatePredictiveRiskDemo && (
            <button
              onClick={onSimulatePredictiveRiskDemo}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/30 via-cyan-500/30 to-emerald-500/30 hover:from-amber-500/40 hover:to-emerald-500/40 text-amber-200 border border-amber-500/60 hover:border-amber-400 font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-950/60"
              title="Predicts failure risk on Robot 1 at 28% battery, triggers PREDICT -> PREVENT -> REASSIGN -> REPLAN flow live"
            >
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>⚡ 1-Click Demo: Predict & Prevent (Robot 1)</span>
            </button>
          )}

          {/* Button 1: Robot 1 Emergency Battery = 10% */}
          <button
            onClick={onSimulateRobot1LowBattery}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/50 hover:border-rose-400 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-rose-950/40"
            title="Sets Robot 1 battery to 10% emergency threshold"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Emergency 10% Alert</span>
          </button>

          {/* Button 2: Simulate Charging Queue */}
          <button
            onClick={onSimulateChargingQueue}
            className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/50 hover:border-purple-400 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-purple-950/40"
            title="Sets Robot 5 battery low to demonstrate FIFO queueing behind Robot 1"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Simulate Charging Queue (Robot 5)</span>
          </button>

          {/* Reset Fleet */}
          <button
            onClick={onResetFleet}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition flex items-center gap-1 font-semibold"
            title="Reset 5-Robot Fleet to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Fleet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
