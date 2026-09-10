import React from 'react';
import { UAV } from '../types';
import { UAVCard } from './UAVCard';
import { Bot, Zap } from 'lucide-react';

interface UAVGridProps {
  uavs: UAV[];
  selectedUAVId: string | null;
  onSelectUAV: (id: string) => void;
  onSimulateLowBattery: (id: string) => void;
  onSimulateCommLoss: (id: string) => void;
  onSimulateFailure: (id: string) => void;
}

export const UAVGrid: React.FC<UAVGridProps> = ({
  uavs,
  selectedUAVId,
  onSelectUAV,
  onSimulateLowBattery,
  onSimulateCommLoss,
  onSimulateFailure,
}) => {
  return (
    <div className="space-y-3 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-cyan-400" />
          5-Robot Fleet & Charging Telemetry ({uavs.length} Units)
        </h2>
        <span className="text-[11px] text-cyan-400/90 font-medium">
          💡 Click "⚡ Bat = 10%" to trigger Robot 1 ➔ Robot 4 Handover & Charging
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {uavs.map((uav) => (
          <UAVCard
            key={uav.id}
            uav={uav}
            isSelected={uav.id === selectedUAVId}
            onSelect={onSelectUAV}
            onSimulateLowBattery={onSimulateLowBattery}
            onSimulateCommLoss={onSimulateCommLoss}
            onSimulateFailure={onSimulateFailure}
          />
        ))}
      </div>
    </div>
  );
};
