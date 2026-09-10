import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { UAV, AnalyticsData } from '../types';
import { Activity, BarChart2 } from 'lucide-react';

interface AnalyticsChartsProps {
  uavs: UAV[];
  analytics: AnalyticsData | null;
  stepCount: number;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ uavs, analytics, stepCount }) => {
  // Format UAV bar chart data
  const uavChartData = uavs.map((u) => ({
    name: u.id,
    Battery: Number(u.battery.toFixed(1)),
    Risk: Number((u.risk_probability || 0).toFixed(1)),
    EnergyConsumed: Number(u.total_energy_consumed.toFixed(1)),
    Health: Number(u.health.toFixed(1)),
  }));

  const riskDistributionData = [
    { name: 'LOW (<40%)', count: analytics?.risk_breakdown.LOW || 0, fill: '#10b981' },
    { name: 'MEDIUM (40-69%)', count: analytics?.risk_breakdown.MEDIUM || 0, fill: '#f59e0b' },
    { name: 'HIGH (≥70%)', count: analytics?.risk_breakdown.HIGH || 0, fill: '#f43f5e' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
      {/* UAV Battery & Risk Telemetry Chart */}
      <div className="glass-panel rounded-xl p-4 flex flex-col h-[320px]">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider">
              Fleet Battery (%) & Risk (%) Telemetry
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Step #{stepCount}</span>
        </div>

        <div className="flex-1 w-full min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={uavChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontFamily="monospace" />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d1527',
                  borderColor: '#3b82f6',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Bar dataKey="Battery" fill="#10b981" radius={[4, 4, 0, 0]} name="Battery %" />
              <Bar dataKey="Risk" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Failure Risk %" />
              <Bar dataKey="Health" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Health %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Energy Consumed & Risk Distribution */}
      <div className="glass-panel rounded-xl p-4 flex flex-col h-[320px]">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider">
              Cumulative Energy Expended (Units)
            </h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold">
            Total: {analytics?.total_energy_consumed || 0} Units
          </span>
        </div>

        <div className="flex-1 w-full min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={uavChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontFamily="monospace" />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d1527',
                  borderColor: '#00f0ff',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="EnergyConsumed" fill="#00f0ff" radius={[4, 4, 0, 0]} name="Energy Expended" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
