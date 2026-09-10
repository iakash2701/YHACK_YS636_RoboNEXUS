import React, { useState } from 'react';
import { X, Plus, Trash2, Shield, Settings2 } from 'lucide-react';
import { UAV, Task } from '../types';

interface MissionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMission: (payload: any) => void;
}

export const MissionConfigModal: React.FC<MissionConfigModalProps> = ({
  isOpen,
  onClose,
  onCreateMission,
}) => {
  const [name, setName] = useState('Tactical Autonomous Operation Beta');
  const [weather, setWeather] = useState<'NORMAL' | 'WINDY' | 'STORM'>('NORMAL');
  const [numUavs, setNumUavs] = useState(3);
  const [tasks, setTasks] = useState([
    { name: 'Inspect Perimeter Alpha', x: 32, y: 18, priority: 5 },
    { name: 'Surveil Sector Bravo', x: 14, y: 36, priority: 4 },
    { name: 'Recon Outpost Charlie', x: 42, y: 42, priority: 3 },
  ]);

  if (!isOpen) return null;

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        name: `Mission Target ${tasks.length + 1}`,
        x: Math.floor(Math.random() * 40 + 5),
        y: Math.floor(Math.random() * 40 + 5),
        priority: 3,
      },
    ]);
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index: number, field: string, value: any) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate UAVs based on count
    const uavList = [];
    const basePositions = [
      { x: 2, y: 2, bat: 45 },
      { x: 10, y: 5, bat: 90 },
      { x: 5, y: 10, bat: 75 },
      { x: 45, y: 5, bat: 85 },
      { x: 5, y: 45, bat: 95 },
    ];
    
    for (let i = 0; i < numUavs; i++) {
      const b = basePositions[i % basePositions.length];
      uavList.push({
        id: `UAV-0${i + 1}`,
        x: b.x,
        y: b.y,
        base_x: b.x,
        base_y: b.y,
        battery: b.bat,
        health: 95.0,
        communication: 90.0,
        speed: 1.0,
      });
    }

    onCreateMission({
      name,
      weather,
      map_width: 50,
      map_height: 50,
      uavs: uavList,
      tasks: tasks.map((t, idx) => ({
        id: `TASK-0${idx + 1}`,
        name: t.name,
        x: Number(t.x),
        y: Number(t.y),
        priority: Number(t.priority),
      })),
      battery_threshold: 20.0,
      risk_threshold: 70.0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-panel-glow rounded-2xl max-w-2xl w-full p-6 relative font-mono text-xs max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Settings2 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100">
            Configure New Multi-UAV Mission
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mission Name */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Mission Operation Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-sans focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Number of UAVs */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Fleet Size: {numUavs} UAVs
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={numUavs}
                onChange={(e) => setNumUavs(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Weather */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Atmospheric Condition</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="NORMAL">NORMAL (1.0x energy)</option>
                <option value="WINDY">WINDY (1.25x energy)</option>
                <option value="STORM">STORM (1.60x energy)</option>
              </select>
            </div>
          </div>

          {/* Task Configuration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-400 font-semibold">Mission Tasks ({tasks.length})</label>
              <button
                type="button"
                onClick={handleAddTask}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => handleTaskChange(idx, 'name', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-sans"
                    placeholder="Task name"
                    required
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">X:</span>
                    <input
                      type="number"
                      min="0"
                      max="48"
                      value={task.x}
                      onChange={(e) => handleTaskChange(idx, 'x', Number(e.target.value))}
                      className="w-12 bg-slate-950 border border-slate-700 rounded px-1 py-1 text-center text-slate-200 font-mono"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Y:</span>
                    <input
                      type="number"
                      min="0"
                      max="48"
                      value={task.y}
                      onChange={(e) => handleTaskChange(idx, 'y', Number(e.target.value))}
                      className="w-12 bg-slate-950 border border-slate-700 rounded px-1 py-1 text-center text-slate-200 font-mono"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">P:</span>
                    <select
                      value={task.priority}
                      onChange={(e) => handleTaskChange(idx, 'priority', Number(e.target.value))}
                      className="bg-slate-950 border border-slate-700 rounded px-1 py-1 text-slate-200 font-mono"
                    >
                      {[1, 2, 3, 4, 5].map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(idx)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Create & Launch Mission</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
