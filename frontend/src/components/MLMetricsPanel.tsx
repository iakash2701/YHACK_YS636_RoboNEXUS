import React from 'react';
import { MLMetrics } from '../types';
import { Brain, Award, BarChart3, Database } from 'lucide-react';

interface MLMetricsPanelProps {
  metrics: MLMetrics | null;
}

export const MLMetricsPanel: React.FC<MLMetricsPanelProps> = ({ metrics }) => {
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

  return (
    <div className="glass-panel rounded-xl p-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Machine Learning Risk Model Evaluation ({metrics.model_name})
          </h2>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          {metrics.dataset_samples.toLocaleString()} Simulation Samples
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mb-4">
        {cards.map((c) => (
          <div key={c.label} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">{c.label}</div>
            <div className={`text-base font-bold mt-1 ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

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
