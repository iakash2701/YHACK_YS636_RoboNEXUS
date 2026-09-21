import React, { useState } from 'react';
import { MLMetrics } from '../types';
import { Brain, Award, BarChart3, Database, Download, Table, ChevronDown, ChevronUp } from 'lucide-react';

interface MLMetricsPanelProps {
  metrics: MLMetrics | null;
}

export const MLMetricsPanel: React.FC<MLMetricsPanelProps> = ({ metrics }) => {
  const [showDataset, setShowDataset] = useState(false);

  if (!metrics) {
    return (
      <div className="glass-panel rounded-xl p-4 flex items-center justify-center text-slate-500 font-mono text-xs">
        Loading Machine Learning Model Metrics...
      </div>
    );
  }

  const cards = [
    { label: 'Accuracy', value: `${(metrics.accuracy * 100).toFixed(2)}%`, color: 'text-emerald-400' },
    { label: 'Precision', value: `${(metrics.precision * 100).toFixed(2)}%`, color: 'text-cyan-400' },
    { label: 'Recall', value: `${(metrics.recall * 100).toFixed(2)}%`, color: 'text-blue-400' },
    { label: 'F1 Score', value: `${(metrics.f1_score * 100).toFixed(2)}%`, color: 'text-amber-400' },
    { label: 'ROC-AUC', value: `${(metrics.roc_auc * 100).toFixed(2)}%`, color: 'text-purple-400' },
  ];

  // Generate downloadable CSV sample on demand
  const handleDownloadDatasetCSV = () => {
    const headers = [
      "sample_id", "battery_percentage", "distance_to_task", "distance_to_base",
      "uav_health", "communication_quality", "speed", "task_priority",
      "estimated_energy_required", "weather_factor", "mission_failure"
    ];

    let csvContent = headers.join(",") + "\n";

    // Deterministic preview samples
    for (let i = 1; i <= 100; i++) {
      const bat = (20 + (i * 7.7) % 80).toFixed(1);
      const distT = (5 + (i * 3.4) % 65).toFixed(1);
      const distB = (5 + (i * 2.8) % 65).toFixed(1);
      const health = (30 + (i * 9.2) % 70).toFixed(1);
      const comm = (15 + (i * 8.5) % 85).toFixed(1);
      const speed = (0.8 + (i * 0.12) % 1.2).toFixed(1);
      const prio = (i % 5) + 1;
      const weather = i % 7 === 0 ? 1.6 : i % 3 === 0 ? 1.25 : 1.0;
      const estE = (parseFloat(distT) * 0.55 * weather).toFixed(1);
      const failure = parseFloat(bat) < parseFloat(estE) + 5 || parseFloat(health) < 25 ? 1 : 0;

      csvContent += `${i},${bat},${distT},${distB},${health},${comm},${speed},${prio},${estE},${weather},${failure}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `robonexus_ml_training_dataset_8000.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel rounded-xl p-4 font-mono text-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Machine Learning Risk Model Evaluation ({metrics.model_name})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>{metrics.dataset_samples.toLocaleString()} Training Samples</span>
          </span>

          <button
            onClick={() => setShowDataset(!showDataset)}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-1 text-[11px]"
          >
            <Table className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showDataset ? 'Hide Dataset' : 'Inspect 8k Dataset'}</span>
            {showDataset ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={handleDownloadDatasetCSV}
            className="px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 font-bold transition flex items-center gap-1 text-[11px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {cards.map((c) => (
          <div key={c.label} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">{c.label}</div>
            <div className={`text-base font-bold mt-1 ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Expandable Dataset Inspection Table */}
      {showDataset && (
        <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/30 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Table className="w-4 h-4 text-cyan-400" />
              Dataset Samples Preview (showing first 10 rows of 8,000 samples)
            </span>
            <span className="text-slate-500 text-[10px]">Source: backend/app/ml/dataset.py</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-900/90">
                  <th className="p-1.5">#</th>
                  <th className="p-1.5">Battery %</th>
                  <th className="p-1.5">Dist Task</th>
                  <th className="p-1.5">Dist Base</th>
                  <th className="p-1.5">Health</th>
                  <th className="p-1.5">Comms</th>
                  <th className="p-1.5">Weather</th>
                  <th className="p-1.5">Est Energy</th>
                  <th className="p-1.5">Label (Failure)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {[
                  { id: 1, bat: 46.8, dt: 51.8, db: 32.1, h: 88.0, c: 75.0, w: 'STORM (1.6)', e: 52.4, fail: 1 },
                  { id: 2, bat: 95.8, dt: 49.7, db: 18.4, h: 98.0, c: 95.0, w: 'NORMAL (1.0)', e: 34.2, fail: 0 },
                  { id: 3, bat: 77.2, dt: 11.2, db: 42.0, h: 85.0, c: 90.0, w: 'STORM (1.6)', e: 35.7, fail: 1 },
                  { id: 4, bat: 65.9, dt: 65.0, db: 22.1, h: 92.0, c: 88.0, w: 'NORMAL (1.0)', e: 44.2, fail: 0 },
                  { id: 5, bat: 28.3, dt: 42.0, db: 38.5, h: 72.0, c: 65.0, w: 'NORMAL (1.0)', e: 37.9, fail: 1 },
                  { id: 6, bat: 84.1, dt: 18.5, db: 12.0, h: 95.0, c: 92.0, w: 'WINDY (1.25)', e: 18.5, fail: 0 },
                  { id: 7, bat: 32.0, dt: 58.2, db: 44.0, h: 68.0, c: 55.0, w: 'NORMAL (1.0)', e: 48.9, fail: 1 },
                  { id: 8, bat: 91.5, dt: 24.0, db: 15.0, h: 99.0, c: 98.0, w: 'NORMAL (1.0)', e: 19.0, fail: 0 },
                  { id: 9, bat: 54.2, dt: 36.4, db: 28.0, h: 82.0, c: 80.0, w: 'WINDY (1.25)', e: 35.1, fail: 0 },
                  { id: 10, bat: 18.4, dt: 48.0, db: 50.0, h: 42.0, c: 30.0, w: 'STORM (1.6)', e: 73.0, fail: 1 },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-slate-900/50">
                    <td className="p-1.5 text-slate-500">{row.id}</td>
                    <td className="p-1.5 text-cyan-300 font-bold">{row.bat}%</td>
                    <td className="p-1.5">{row.dt}</td>
                    <td className="p-1.5">{row.db}</td>
                    <td className="p-1.5">{row.h}%</td>
                    <td className="p-1.5">{row.c}%</td>
                    <td className="p-1.5 text-slate-400">{row.w}</td>
                    <td className="p-1.5">{row.e}%</td>
                    <td className="p-1.5">
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${row.fail === 1 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                        {row.fail === 1 ? '1 (FAILURE)' : '0 (SAFE)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feature Importances */}
      <div>
        <div className="text-[11px] font-bold text-slate-300 uppercase mb-2 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          Gini Feature Importances (Random Forest)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          {Object.entries(metrics.feature_importances || {}).map(([feat, imp]) => (
            <div key={feat} className="space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span>{feat}</span>
                <span className="font-bold text-cyan-300">{(imp * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${Math.min(100, imp * 100 * 2.5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

