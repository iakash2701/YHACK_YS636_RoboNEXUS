import React, { useState } from 'react';
import { UAV, Task, Obstacle, ChargingStation } from '../types';
import {
  Crosshair,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Flame,
  Layers,
  Bot,
  Zap,
  BatteryCharging,
  Clock,
} from 'lucide-react';

interface MissionMapProps {
  uavs: UAV[];
  tasks: Task[];
  obstacles: Obstacle[];
  chargingStation?: ChargingStation;
  weather?: string;
  mapWidth?: number;
  mapHeight?: number;
  selectedUAVId: string | null;
  onSelectUAV: (id: string) => void;
  onAddObstacleAt?: (x: number, y: number) => void;
  onAddTaskAt?: (x: number, y: number) => void;
}

export const MissionMap: React.FC<MissionMapProps> = ({
  uavs,
  tasks,
  obstacles,
  chargingStation = { id: 'CS-ALPHA', name: 'CHARGING STATION', x: 25, y: 25, currently_charging_uav_id: null, queue: [] },
  weather = 'NORMAL',
  mapWidth = 50,
  mapHeight = 50,
  selectedUAVId,
  onSelectUAV,
  onAddObstacleAt,
  onAddTaskAt,
}) => {
  const [hoveredEntity, setHoveredEntity] = useState<any | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [clickMode, setClickMode] = useState<'inspect' | 'obstacle' | 'task'>('inspect');

  const scale = 20; // 50 * 20 = 1000

  const getRobotColor = (uav: UAV) => {
    if (uav.status === 'FAILED') return '#f43f5e';
    if (uav.status === 'CHARGING') return '#10b981';
    if (uav.status === 'WAITING_FOR_CHARGER') return '#a855f7';
    if (uav.status === 'MOVING_TO_CHARGER' || uav.status === 'LOW_BATTERY' || uav.battery <= 10) return '#f43f5e';
    if (uav.battery < 25) return '#f59e0b';
    if (uav.risk_level === 'HIGH') return '#f43f5e';
    if (uav.risk_level === 'MEDIUM') return '#f59e0b';
    return '#00f0ff';
  };

  const getTaskColor = (task: Task) => {
    switch (task.status) {
      case 'COMPLETED': return '#10b981';
      case 'ASSIGNED': return '#3b82f6';
      case 'REASSIGNED': return '#00f0ff';
      default: return '#e2e8f0';
    }
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * mapWidth);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * mapHeight);

    if (clickMode === 'obstacle' && onAddObstacleAt) {
      onAddObstacleAt(clickX, clickY);
    } else if (clickMode === 'task' && onAddTaskAt) {
      onAddTaskAt(clickX, clickY);
    }
  };

  const csX = chargingStation.x * scale;
  const csY = chargingStation.y * scale;

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full relative overflow-hidden font-mono text-xs">
      {/* Map Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400 animate-bounce" />
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Autonomous 5-Robot Fleet Grid & Tactical Airspace (50 × 50)
          </h2>
        </div>

        {/* Map Layer Controls */}
        <div className="flex items-center gap-2 text-[11px]">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setClickMode('inspect')}
              className={`px-2 py-1 rounded transition ${clickMode === 'inspect' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
              title="Inspect Autonomous Robots and Targets"
            >
              Inspect
            </button>
            <button
              onClick={() => setClickMode('obstacle')}
              className={`px-2 py-1 rounded transition ${clickMode === 'obstacle' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400'}`}
              title="Click map to drop No-Fly Barrier"
            >
              + Obstacle
            </button>
            <button
              onClick={() => setClickMode('task')}
              className={`px-2 py-1 rounded transition ${clickMode === 'task' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-400'}`}
              title="Click map to drop new Robot Target"
            >
              + Target
            </button>
          </div>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
              showHeatmap
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap</span>
          </button>

          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
              showRoutes
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Routes</span>
          </button>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative flex-1 min-h-[460px] bg-[#050811] rounded-lg border border-cyan-500/20 overflow-hidden grid-bg flex items-center justify-center">
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full max-h-[580px] cursor-crosshair"
          onClick={handleMapClick}
        >
          <defs>
            <pattern id="diagonalHatch" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="20" stroke="#f43f5e" strokeWidth="4" opacity="0.6" />
            </pattern>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="stationGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <radialGradient id="threatGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#050811" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="chargerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#050811" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Heatmap overlay */}
          {showHeatmap && (
            <g className="pointer-events-none">
              {obstacles.map((obs) => (
                <circle
                  key={`heat-${obs.id}`}
                  cx={(obs.x + obs.width / 2) * scale}
                  cy={(obs.y + obs.height / 2) * scale}
                  r={(Math.max(obs.width, obs.height) + 12) * scale}
                  fill="url(#threatGlow)"
                />
              ))}
            </g>
          )}

          {/* Grid lines */}
          {Array.from({ length: 11 }).map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * 100} y1={0} x2={i * 100} y2={1000} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={0} y1={i * 100} x2={1000} y2={i * 100} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              <text x={i * 100 + 4} y="16" fill="#475569" fontSize="11" fontFamily="monospace">{i * 5}</text>
              <text x="4" y={i * 100 + 16} fill="#475569" fontSize="11" fontFamily="monospace">{i * 5}</text>
            </React.Fragment>
          ))}

          {/* Obstacle Zones */}
          {obstacles.map((obs) => (
            <g key={obs.id}>
              <rect
                x={obs.x * scale}
                y={obs.y * scale}
                width={obs.width * scale}
                height={obs.height * scale}
                fill="url(#diagonalHatch)"
                stroke="#f43f5e"
                strokeWidth="2"
                rx="4"
              />
              <rect
                x={obs.x * scale}
                y={obs.y * scale}
                width={obs.width * scale}
                height={obs.height * scale}
                fill="rgba(244, 63, 94, 0.15)"
                rx="4"
              />
              <text
                x={obs.x * scale + 6}
                y={obs.y * scale + 18}
                fill="#fca5a5"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {obs.id} [NO-FLY]
              </text>
            </g>
          ))}

          {/* ========================================================= */}
          {/* ⚡ CENTRAL CHARGING STATION (Clearly Visible on Map) */}
          {/* ========================================================= */}
          <g
            transform={`translate(${csX}, ${csY})`}
            onMouseEnter={() =>
              setHoveredEntity({
                type: 'station',
                data: chargingStation
              })
            }
            onMouseLeave={() => setHoveredEntity(null)}
            className="cursor-pointer"
          >
            {/* Background Halo */}
            <circle r="60" fill="url(#chargerGlow)" />

            {/* Pulsing Outer Charge Radar Ring */}
            <circle
              r="44"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              className="animate-spin"
              style={{ transformOrigin: '0 0', animationDuration: '10s' }}
            />

            {/* Inner Docking Platform */}
            <rect
              x="-34"
              y="-34"
              width="68"
              height="68"
              rx="12"
              fill="#061226"
              stroke={chargingStation.currently_charging_uav_id ? '#10b981' : '#00f0ff'}
              strokeWidth="2.5"
              filter="url(#stationGlow)"
            />

            {/* Lightning Charging Bolt Icon */}
            <path
              d="M -4 -16 L -16 2 L -2 2 L -8 18 L 16 -2 L 2 -2 L 8 -16 Z"
              fill={chargingStation.currently_charging_uav_id ? '#10b981' : '#f59e0b'}
              className={chargingStation.currently_charging_uav_id ? 'animate-pulse' : ''}
            />

            {/* Charging Pad Core Ring */}
            <circle
              r="22"
              fill="none"
              stroke={chargingStation.currently_charging_uav_id ? '#10b981' : '#00f0ff'}
              strokeWidth="1.5"
            />

            {/* Banner Labels */}
            <g transform="translate(0, 48)">
              {/* Main Badge Background */}
              <rect
                x="-95"
                y="0"
                width="190"
                height="46"
                rx="6"
                fill="#030816"
                stroke={chargingStation.currently_charging_uav_id ? '#10b981' : '#00f0ff'}
                strokeWidth="1.5"
                opacity="0.95"
              />
              <text
                x="0"
                y="15"
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="900"
                letterSpacing="1"
              >
                ⚡ CHARGING STATION
              </text>
              <text
                x="0"
                y="29"
                textAnchor="middle"
                fill={chargingStation.currently_charging_uav_id ? '#34d399' : '#94a3b8'}
                fontSize="9.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {chargingStation.currently_charging_uav_id
                  ? `Charging: ${chargingStation.currently_charging_uav_id}`
                  : 'Status: DOCK AVAILABLE'}
              </text>
              <text
                x="0"
                y="41"
                textAnchor="middle"
                fill={chargingStation.queue && chargingStation.queue.length > 0 ? '#f59e0b' : '#64748b'}
                fontSize="8.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {chargingStation.queue && chargingStation.queue.length > 0
                  ? `Queue: ${chargingStation.queue.join(', ')} (${chargingStation.queue.length} waiting)`
                  : 'Queue: Empty'}
              </text>
            </g>
          </g>

          {/* Base Dock Stations for Individual Robots */}
          {uavs.map((uav) => (
            <g key={`base-${uav.id}`}>
              <rect
                x={uav.base_x * scale - 12}
                y={uav.base_y * scale - 12}
                width="24"
                height="24"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="1.2"
                rx="4"
              />
              <path
                d={`M ${uav.base_x * scale - 2} ${uav.base_y * scale - 6} L ${uav.base_x * scale - 5} ${uav.base_y * scale} L ${uav.base_x * scale} ${uav.base_y * scale} L ${uav.base_x * scale - 3} ${uav.base_y * scale + 6} L ${uav.base_x * scale + 5} ${uav.base_y * scale - 1} L ${uav.base_x * scale} ${uav.base_y * scale - 1} Z`}
                fill="#38bdf8"
              />
              <text
                x={uav.base_x * scale - 10}
                y={uav.base_y * scale + 20}
                fill="#64748b"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {uav.id.replace('Robot ', 'R')} PAD
              </text>
            </g>
          ))}

          {/* Planned Routes */}
          {showRoutes &&
            uavs.map((uav) => {
              if (!uav.route || uav.route.length < 2) return null;
              const pathPoints = uav.route.map((pt) => `${pt[0] * scale},${pt[1] * scale}`).join(' ');
              const isSelected = uav.id === selectedUAVId;
              const color = getRobotColor(uav);

              return (
                <g key={`route-${uav.id}`}>
                  <polyline
                    points={pathPoints}
                    fill="none"
                    stroke={color}
                    strokeWidth={isSelected ? '3.5' : '2'}
                    strokeDasharray={uav.status === 'MOVING_TO_CHARGER' || uav.status === 'RETURNING' ? '6 6' : 'none'}
                    opacity={isSelected ? 0.95 : 0.65}
                    filter={isSelected ? 'url(#glow)' : undefined}
                  />
                </g>
              );
            })}

          {/* Task Destination Markers */}
          {tasks.map((task) => {
            const color = getTaskColor(task);
            const isCompleted = task.status === 'COMPLETED';

            return (
              <g
                key={task.id}
                transform={`translate(${task.x * scale}, ${task.y * scale})`}
                onMouseEnter={() => setHoveredEntity({ type: 'task', data: task })}
                onMouseLeave={() => setHoveredEntity(null)}
                className="cursor-pointer"
              >
                {!isCompleted && (
                  <circle
                    r="16"
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    opacity="0.5"
                    className="animate-ping"
                    style={{ transformOrigin: '0 0' }}
                  />
                )}
                <circle r="10" fill="#070b14" stroke={color} strokeWidth="2.5" />
                <circle r="4" fill={color} />
                <text
                  x="14"
                  y="4"
                  fill="#f8fafc"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow"
                >
                  {task.name} (P{task.priority})
                </text>
              </g>
            );
          })}

          {/* ========================================================= */}
          {/* 🤖 5-ROBOT FLEET AVATARS (With Dynamic Status & Charging) */}
          {/* ========================================================= */}
          {uavs.map((uav) => {
            const color = getRobotColor(uav);
            const isSelected = uav.id === selectedUAVId;
            const isLowBattery = uav.battery <= 10 || uav.status === 'LOW_BATTERY' || uav.status === 'MOVING_TO_CHARGER';
            const isCharging = uav.status === 'CHARGING';
            const isQueued = uav.status === 'WAITING_FOR_CHARGER';

            return (
              <g
                key={uav.id}
                transform={`translate(${uav.x * scale}, ${uav.y * scale})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectUAV(uav.id);
                }}
                onMouseEnter={() => setHoveredEntity({ type: 'uav', data: uav })}
                onMouseLeave={() => setHoveredEntity(null)}
                className="cursor-pointer transition-transform duration-200"
              >
                {/* Selection Reticle */}
                {isSelected && (
                  <circle
                    r="26"
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    style={{ transformOrigin: '0 0', animationDuration: '6s' }}
                  />
                )}

                {/* ⚡ Charging Animation Ring Effect */}
                {isCharging && (
                  <g>
                    <circle
                      r="28"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeDasharray="8 4"
                      className="animate-spin"
                      style={{ transformOrigin: '0 0', animationDuration: '3s' }}
                    />
                    <circle
                      r="32"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1"
                      className="animate-ping"
                      style={{ transformOrigin: '0 0' }}
                    />
                  </g>
                )}

                {/* Low Battery Warning Pulse */}
                {isLowBattery && (
                  <circle
                    r="24"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    className="animate-ping"
                    style={{ transformOrigin: '0 0' }}
                  />
                )}

                {/* Robot Base Chassis */}
                <circle
                  r="16"
                  fill="#0b1329"
                  stroke={color}
                  strokeWidth="2.5"
                  filter={isSelected || isCharging ? 'url(#glow)' : undefined}
                />

                {/* Custom Vector Robot Graphic */}
                <g transform="translate(-10, -10)">
                  <rect x="2" y="4" width="16" height="13" rx="3" fill="#0d1b38" stroke={color} strokeWidth="1.5" />
                  <circle cx="7" cy="9" r="1.8" fill={isLowBattery ? '#f43f5e' : isCharging ? '#10b981' : color} />
                  <circle cx="13" cy="9" r="1.8" fill={isLowBattery ? '#f43f5e' : isCharging ? '#10b981' : color} />
                  <line x1="6" y1="13.5" x2="14" y2="13.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="10" y1="4" x2="10" y2="1" stroke={color} strokeWidth="1.5" />
                  <circle cx="10" cy="1" r="1.5" fill={isLowBattery ? '#f43f5e' : isCharging ? '#10b981' : '#00f0ff'} />
                  <rect x="0" y="7" width="2" height="4" rx="1" fill={color} />
                  <rect x="18" y="7" width="2" height="4" rx="1" fill={color} />
                </g>

                {/* Status Badge & Battery Tag */}
                <g transform="translate(20, -14)">
                  <rect
                    x="0"
                    y="0"
                    width="96"
                    height="32"
                    fill="#0a0f1d"
                    stroke={color}
                    strokeWidth="1"
                    rx="4"
                    opacity="0.95"
                  />
                  <text
                    x="6"
                    y="13"
                    fill="#ffffff"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    🤖 {uav.id}
                  </text>
                  <text
                    x="6"
                    y="25"
                    fill={isCharging ? '#34d399' : isLowBattery ? '#f43f5e' : uav.battery < 40 ? '#fbbf24' : '#38bdf8'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isCharging ? '⚡ CHARGING ' : isQueued ? '⏳ QUEUED ' : '🔋 '}
                    {uav.battery.toFixed(0)}%
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredEntity && (
          <div className="absolute top-4 right-4 glass-panel-glow p-3 rounded-lg text-xs font-mono max-w-xs pointer-events-none z-20">
            {hoveredEntity.type === 'station' ? (
              <div className="space-y-1">
                <div className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>CHARGING STATION</span>
                </div>
                <div className="text-slate-300">Location: (25.0, 25.0)</div>
                <div className="text-slate-300">
                  Currently Charging:{' '}
                  <span className="font-bold text-emerald-400">
                    {hoveredEntity.data.currently_charging_uav_id || 'Dock Free'}
                  </span>
                </div>
                <div className="text-slate-300">
                  Waiting Queue:{' '}
                  <span className="font-bold text-purple-300">
                    {hoveredEntity.data.queue && hoveredEntity.data.queue.length > 0
                      ? hoveredEntity.data.queue.join(', ')
                      : '0 robots'}
                  </span>
                </div>
              </div>
            ) : hoveredEntity.type === 'uav' ? (
              <div className="space-y-1">
                <div className="font-bold text-cyan-300 text-sm flex items-center justify-between">
                  <span>🤖 {hoveredEntity.data.id}</span>
                  <span className="text-[10px] text-slate-400">{hoveredEntity.data.status}</span>
                </div>
                <div className="text-slate-300">Position: ({hoveredEntity.data.x.toFixed(1)}, {hoveredEntity.data.y.toFixed(1)})</div>
                <div className="text-slate-300">
                  Battery:{' '}
                  <span className={`font-bold ${hoveredEntity.data.battery <= 10 ? 'text-rose-400 font-extrabold animate-pulse' : 'text-emerald-400'}`}>
                    {hoveredEntity.data.battery.toFixed(1)}% {hoveredEntity.data.battery <= 10 ? '(EMERGENCY LOW)' : ''}
                  </span>
                </div>
                <div className="text-slate-300">Action: <span className="text-amber-300 font-bold">{hoveredEntity.data.current_action || 'Patrol'}</span></div>
                <div className="text-slate-300">Assigned Task: <span className="text-blue-300 font-bold">{hoveredEntity.data.current_task_id || 'Available Pool'}</span></div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-bold text-blue-300 text-sm">{hoveredEntity.data.name}</div>
                <div className="text-slate-300">Target Pos: ({hoveredEntity.data.x}, {hoveredEntity.data.y})</div>
                <div className="text-slate-300">Priority: <span className="font-bold text-amber-400">{hoveredEntity.data.priority} / 5</span></div>
                <div className="text-slate-300">Status: <span className="font-bold text-cyan-400">{hoveredEntity.data.status}</span></div>
                <div className="text-slate-300">Assigned Robot: <span className="font-bold text-slate-100">{hoveredEntity.data.assigned_uav_id || 'None'}</span></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
