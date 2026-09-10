import React from 'react';
import { X, Play, CloudRain, Building2, Layers, ShieldAlert, Wind, Zap } from 'lucide-react';

interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  badge: string;
  badgeColor: string;
  payload: any;
}

interface PresetScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (payload: any) => void;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'standard-recon',
    title: 'Alpha Sector Reconnaissance',
    subtitle: 'Standard Baseline • 3 UAVs • Normal Weather',
    description: 'Nominal operational test with 3 UAVs traversing around perimeter obstacles to inspect 3 high-value targets.',
    icon: Layers,
    badge: 'BASELINE',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    payload: {
      name: 'Alpha Sector Reconnaissance',
      weather: 'NORMAL',
      map_width: 50,
      map_height: 50,
      uavs: [
        { id: 'UAV-01', x: 2, y: 2, base_x: 2, base_y: 2, battery: 48, health: 95, communication: 90, speed: 1.0 },
        { id: 'UAV-02', x: 10, y: 5, base_x: 10, base_y: 5, battery: 92, health: 98, communication: 95, speed: 1.2 },
        { id: 'UAV-03', x: 5, y: 10, base_x: 5, base_y: 10, battery: 75, health: 88, communication: 90, speed: 1.0 },
      ],
      tasks: [
        { id: 'TASK-01', name: 'Inspect Perimeter Alpha', x: 30, y: 20, priority: 5 },
        { id: 'TASK-02', name: 'Surveil Sector Bravo', x: 15, y: 35, priority: 4 },
        { id: 'TASK-03', name: 'Monitor Outpost Charlie', x: 40, y: 40, priority: 3 },
      ],
      obstacles: [
        { id: 'OBS-01', x: 18, y: 8, width: 8, height: 16 },
        { id: 'OBS-02', x: 26, y: 28, width: 10, height: 12 },
        { id: 'OBS-03', x: 8, y: 24, width: 6, height: 10 },
      ],
    },
  },
  {
    id: 'storm-stress',
    title: 'Storm Infiltration & Atmospheric Stress',
    subtitle: 'Severe Storm (1.6x Energy) • 4 UAVs • High Turbulence',
    description: 'Extreme atmospheric conditions amplify battery drain and telemetry loss. Tests the ML risk engine under rapid energy exhaustion.',
    icon: CloudRain,
    badge: 'STORM TEST',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    payload: {
      name: 'Storm Infiltration & Atmospheric Stress',
      weather: 'STORM',
      map_width: 50,
      map_height: 50,
      uavs: [
        { id: 'UAV-01', x: 2, y: 2, base_x: 2, base_y: 2, battery: 42, health: 80, communication: 65, speed: 1.0 },
        { id: 'UAV-02', x: 6, y: 4, base_x: 6, base_y: 4, battery: 88, health: 96, communication: 90, speed: 1.2 },
        { id: 'UAV-03', x: 4, y: 12, base_x: 4, base_y: 12, battery: 85, health: 92, communication: 85, speed: 1.1 },
        { id: 'UAV-04', x: 12, y: 2, base_x: 12, base_y: 2, battery: 95, health: 98, communication: 95, speed: 1.3 },
      ],
      tasks: [
        { id: 'TASK-01', name: 'Offshore Sensor Buoy', x: 38, y: 14, priority: 5 },
        { id: 'TASK-02', name: 'Radar Tower Delta', x: 22, y: 38, priority: 5 },
        { id: 'TASK-03', name: 'Coastal Relay Station', x: 44, y: 36, priority: 4 },
        { id: 'TASK-04', name: 'Emergency Beacon Echo', x: 16, y: 22, priority: 3 },
      ],
      obstacles: [
        { id: 'STORM-CELL-1', x: 14, y: 6, width: 12, height: 14 },
        { id: 'STORM-CELL-2', x: 28, y: 20, width: 10, height: 16 },
      ],
    },
  },
  {
    id: 'urban-canyon',
    title: 'Urban Canyon Dense Obstacle Navigation',
    subtitle: 'High-Density Skyscraper Grid • 4 UAVs • Complex A* Paths',
    description: 'Complex urban no-fly zones requiring intricate 8-directional A* routing with tight obstacle margins and dynamic avoidance.',
    icon: Building2,
    badge: 'COMPLEX A*',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    payload: {
      name: 'Urban Canyon Dense Navigation',
      weather: 'WINDY',
      map_width: 50,
      map_height: 50,
      uavs: [
        { id: 'UAV-01', x: 2, y: 2, base_x: 2, base_y: 2, battery: 50, health: 90, communication: 85, speed: 1.0 },
        { id: 'UAV-02', x: 2, y: 45, base_x: 2, base_y: 45, battery: 95, health: 98, communication: 95, speed: 1.1 },
        { id: 'UAV-03', x: 45, y: 2, base_x: 45, base_y: 2, battery: 85, health: 92, communication: 90, speed: 1.2 },
        { id: 'UAV-04', x: 45, y: 45, base_x: 45, base_y: 45, battery: 90, health: 94, communication: 92, speed: 1.0 },
      ],
      tasks: [
        { id: 'TASK-01', name: 'Rooftop Helipad Alpha', x: 25, y: 25, priority: 5 },
        { id: 'TASK-02', name: 'Commercial Hub Metro', x: 12, y: 28, priority: 4 },
        { id: 'TASK-03', name: 'Financial Tower East', x: 38, y: 16, priority: 4 },
        { id: 'TASK-04', name: 'Transit Center South', x: 32, y: 40, priority: 3 },
      ],
      obstacles: [
        { id: 'TOWER-A', x: 8, y: 8, width: 8, height: 14 },
        { id: 'TOWER-B', x: 22, y: 6, width: 14, height: 8 },
        { id: 'TOWER-C', x: 16, y: 32, width: 8, height: 14 },
        { id: 'TOWER-D', x: 34, y: 26, width: 10, height: 10 },
      ],
    },
  },
  {
    id: 'cascading-failure',
    title: 'Cascading Fleet Failure & Swarm Hand-Off',
    subtitle: '5 UAVs • 6 Targets • Multi-Stage Proactive Replanning',
    description: 'Multiple UAVs experience simultaneous telemetry stress and battery decay. Tests the system capacity for multi-drone sequential handoffs.',
    icon: ShieldAlert,
    badge: 'SWARM REPLAN',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    payload: {
      name: 'Cascading Multi-UAV Swarm Hand-Off',
      weather: 'WINDY',
      map_width: 50,
      map_height: 50,
      uavs: [
        { id: 'UAV-01', x: 2, y: 2, base_x: 2, base_y: 2, battery: 38, health: 75, communication: 70, speed: 1.0 },
        { id: 'UAV-02', x: 4, y: 6, base_x: 4, base_y: 6, battery: 95, health: 98, communication: 95, speed: 1.2 },
        { id: 'UAV-03', x: 8, y: 2, base_x: 8, base_y: 2, battery: 40, health: 80, communication: 75, speed: 1.0 },
        { id: 'UAV-04', x: 10, y: 8, base_x: 10, base_y: 8, battery: 90, health: 96, communication: 92, speed: 1.1 },
        { id: 'UAV-05', x: 6, y: 12, base_x: 6, base_y: 12, battery: 85, health: 94, communication: 90, speed: 1.1 },
      ],
      tasks: [
        { id: 'TASK-01', name: 'Critical Sensor Node 1', x: 35, y: 15, priority: 5 },
        { id: 'TASK-02', name: 'Critical Sensor Node 2', x: 20, y: 38, priority: 5 },
        { id: 'TASK-03', name: 'Perimeter Checkpoint 3', x: 42, y: 35, priority: 4 },
        { id: 'TASK-04', name: 'Surveillance Node 4', x: 15, y: 20, priority: 4 },
        { id: 'TASK-05', name: 'Communications Relay 5', x: 30, y: 45, priority: 3 },
      ],
      obstacles: [
        { id: 'OBS-ALPHA', x: 16, y: 10, width: 8, height: 16 },
        { id: 'OBS-BRAVO', x: 26, y: 25, width: 10, height: 14 },
      ],
    },
  },
];

export const PresetScenariosModal: React.FC<PresetScenariosModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-mono text-xs">
      <div className="glass-panel-glow rounded-2xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Zap className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Select 1-Click Operational Preset Scenario
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">
              Instantly deploy pre-configured mission airspaces, fleets, weather regimes, and obstacle grids:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_SCENARIOS.map((preset) => {
            const Icon = preset.icon;
            return (
              <div
                key={preset.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-100 text-sm">{preset.title}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${preset.badgeColor}`}>
                      {preset.badge}
                    </span>
                  </div>

                  <div className="text-[11px] text-cyan-300 font-semibold mb-1.5">
                    {preset.subtitle}
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {preset.payload.uavs.length} UAVs • {preset.payload.tasks.length} Tasks
                  </span>
                  <button
                    onClick={() => {
                      onSelectPreset(preset.payload);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold border border-cyan-500/40 transition flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Launch Scenario</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
