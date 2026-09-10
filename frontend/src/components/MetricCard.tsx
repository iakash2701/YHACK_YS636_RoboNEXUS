import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'cyan',
}) => {
  const getColors = () => {
    switch (accentColor) {
      case 'emerald':
        return {
          border: 'border-emerald-500/20 hover:border-emerald-500/40',
          iconBg: 'bg-emerald-500/10 text-emerald-400',
          text: 'text-emerald-400',
        };
      case 'amber':
        return {
          border: 'border-amber-500/20 hover:border-amber-500/40',
          iconBg: 'bg-amber-500/10 text-amber-400',
          text: 'text-amber-400',
        };
      case 'rose':
        return {
          border: 'border-rose-500/20 hover:border-rose-500/40',
          iconBg: 'bg-rose-500/10 text-rose-400',
          text: 'text-rose-400',
        };
      case 'blue':
        return {
          border: 'border-blue-500/20 hover:border-blue-500/40',
          iconBg: 'bg-blue-500/10 text-blue-400',
          text: 'text-blue-400',
        };
      default:
        return {
          border: 'border-cyan-500/20 hover:border-cyan-500/40',
          iconBg: 'bg-cyan-500/10 text-cyan-400',
          text: 'text-cyan-400',
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`glass-panel rounded-xl p-4 transition-all duration-300 ${colors.border}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${colors.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">{value}</div>
        {trend && (
          <span className={`text-[11px] font-mono font-medium ${colors.text}`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && <div className="mt-1 text-[11px] text-slate-400 font-sans">{subtitle}</div>}
    </div>
  );
};
