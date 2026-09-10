import React from 'react';
import { UAV } from '../types';
import { UAVCard } from './UAVCard';
import { Bot } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Bot className="w-4 h-4 text-cyan-400" />
          Autonomous Robot Fleet & Charger Status ({uavs.length})
        </h2>
        <span className="text-[11px] text-slate-400">
          Click "Charger Down" to test immediate reassignment to nearest free robot
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
