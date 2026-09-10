import React from 'react';
import { BatteryWarning, Radio, ZapOff, CloudLightning, ShieldPlus, Zap, Bot } from 'lucide-react';
import { UAV } from '../types';

interface WhatIfSimulatorProps {
  uavs: UAV[];
  selectedUAVId: string | null;
  onSimulateLowBattery: (uavId: string, battery: number) => void;
  onSimulateCommLoss: (uavId: string, comm: number) => void;
  onSimulateFailure: (uavId: string) => void;
  onSimulateWeather: (weather: string) => void;
  onSimulateObstacle: (obstacle: any) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  uavs,
  selectedUAVId,
  onSimulateLowBattery,
  onSimulateCommLoss,
  onSimulateFailure,
  onSimulateWeather,
  onSimulateObstacle,
}) => {
  const targetUavId = selectedUAVId || (uavs[0] ? uavs[0].id : 'UAV-01');

  return (
    <div className="glass-panel rounded-xl p-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-cyan-400" />
          What-If Robot Scenario Injector & Charger Stress Tests
        </h2>
        <span className="text-[11px] text-cyan-300 font-bold">
          Target Robot: {targetUavId}
        </span>
      </div>

      <p className="text-[11px] text-slate-400 font-sans mb-3">
        Simulate robot charger failure or environmental disruptions to test immediate hand-off to the nearest free robot:
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* Charger Down */}
        <button
          onClick={() => onSimulateLowBattery(targetUavId, 20.0)}
          className="p-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-left transition flex flex-col justify-between gap-1 group shadow-md shadow-amber-950/30"
        >
          <div className="flex items-center justify-between">
            <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition animate-pulse" />
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 font-bold">20% BAT</span>
          </div>
          <div>
            <div className="font-bold text-[11px] text-amber-200">⚡ Charger Down</div>
            <div className="text-[10px] text-slate-300 font-sans">Trigger nearest robot handoff</div>
          </div>
        </button>

        {/* Communication Loss */}
        <button
          onClick={() => onSimulateCommLoss(targetUavId, 12.0)}
          className="p-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-left transition flex flex-col justify-between gap-1 group"
        >
          <div className="flex items-center justify-between">
            <Radio className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 font-bold">12% COM</span>
          </div>
          <div>
            <div className="font-bold text-[11px]">Telemetry Loss</div>
            <div className="text-[10px] text-slate-400 font-sans">Degrade link signal</div>
          </div>
        </button>

        {/* Hardware Failure */}
        <button
          onClick={() => onSimulateFailure(targetUavId)}
          className="p-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-left transition flex flex-col justify-between gap-1 group"
        >
          <div className="flex items-center justify-between">
            <ZapOff className="w-4 h-4 text-rose-400 group-hover:scale-110 transition" />
            <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 font-bold">SHUTDOWN</span>
          </div>
          <div>
            <div className="font-bold text-[11px]">Robot Crash</div>
            <div className="text-[10px] text-slate-400 font-sans">Force hardware failure</div>
          </div>
        </button>

        {/* Weather: STORM */}
        <button
          onClick={() => onSimulateWeather('STORM')}
          className="p-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-left transition flex flex-col justify-between gap-1 group"
        >
          <div className="flex items-center justify-between">
            <CloudLightning className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 font-bold">1.6x DRAIN</span>
          </div>
          <div>
            <div className="font-bold text-[11px]">Storm Weather</div>
            <div className="text-[10px] text-slate-400 font-sans">+60% energy drain</div>
          </div>
        </button>

        {/* Dynamic Obstacle */}
        <button
          onClick={() => {
            const obsId = `OBS-${Math.floor(Math.random() * 80 + 10)}`;
            onSimulateObstacle({
              id: obsId,
              x: Math.floor(Math.random() * 30 + 5),
              y: Math.floor(Math.random() * 30 + 5),
              width: 8,
              height: 8,
            });
          }}
          className="p-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-left transition flex flex-col justify-between gap-1 group"
        >
          <div className="flex items-center justify-between">
            <ShieldPlus className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
            <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 font-bold">A*</span>
          </div>
          <div>
            <div className="font-bold text-[11px]">Spawn Obstacle</div>
            <div className="text-[10px] text-slate-400 font-sans">Trigger route reroute</div>
          </div>
        </button>
      </div>
    </div>
  );
};
