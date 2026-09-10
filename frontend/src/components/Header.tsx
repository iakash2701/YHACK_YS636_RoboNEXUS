import React, { useState } from 'react';
import {
  Activity,
  Shield,
  Layers,
  CloudRain,
  Wind,
  Sun,
  Cpu,
  Zap,
  Download,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MissionState } from '../types';
import { tacticalAudio } from '../services/soundEffects';

interface HeaderProps {
  missionState: MissionState | null;
  onOpenConfig: () => void;
  onOpenPresets: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  missionState,
  onOpenConfig,
  onOpenPresets,
  onOpenExport,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  const weather = missionState?.weather || 'NORMAL';
  const uavCount = missionState?.uavs.length || 0;
  const missionName = missionState?.mission.name || 'Autonomous Mission Planner';

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    tacticalAudio.setMuted(nextMute);
    if (!nextMute) {
      tacticalAudio.playAlertBeep('click');
      tacticalAudio.speak('Audio alerts enabled.');
    }
  };

  const getWeatherIcon = () => {
    switch (weather) {
      case 'STORM':
        return <CloudRain className="w-4 h-4 text-rose-400 animate-pulse" />;
      case 'WINDY':
        return <Wind className="w-4 h-4 text-amber-400" />;
      default:
        return <Sun className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getStatusBadge = () => {
    const status = missionState?.status || 'CONFIGURED';
    switch (status) {
      case 'RUNNING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE SIMULATION
          </span>
        );
      case 'PAUSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            PAUSED
          </span>
        );
      case 'PLANNED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            MISSION PLANNED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            MISSION COMPLETED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/30">
            CONFIGURED
          </span>
        );
    }
  };

  return (
    <header className="glass-panel border-b border-cyan-500/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
          <Shield className="w-6 h-6 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              Autonomous Mission Planner
            </h1>
            <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              v1.0 AI Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Self-Learning Risk-Aware Multi-UAV Mission Control •{' '}
            <span className="text-cyan-300 font-semibold">{missionName}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-3 text-xs font-mono">
        {/* System Status */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-800">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-slate-400">SYS:</span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>

        {/* Status Badge */}
        {getStatusBadge()}

        {/* UAV Count */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-800">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">FLEET:</span>
          <span className="text-cyan-300 font-bold">{uavCount} UAVs</span>
        </div>

        {/* Weather Indicator */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-800">
          {getWeatherIcon()}
          <span className="text-slate-400">ATMOSPHERE:</span>
          <span className="text-slate-200 font-bold">{weather}</span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute Audio & Voice Alerts' : 'Mute Audio Alerts'}
          className={`p-2 rounded-md border transition ${
            isMuted
              ? 'bg-slate-900 text-slate-500 border-slate-800'
              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Presets Button */}
        <button
          onClick={onOpenPresets}
          className="px-3 py-1.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition flex items-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>

        {/* Export Debrief Report Button */}
        <button
          onClick={onOpenExport}
          className="px-3 py-1.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 transition flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Debrief Report</span>
        </button>

        {/* Config button */}
        <button
          onClick={onOpenConfig}
          className="px-3 py-1.5 rounded-md bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 hover:border-blue-400 transition flex items-center gap-1.5"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Config</span>
        </button>
      </div>
    </header>
  );
};
