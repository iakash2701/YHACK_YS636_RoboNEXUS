import React from 'react';
import { AlertTriangle, ShieldCheck, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  probability?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level = 'LOW',
  probability,
  showIcon = true,
  size = 'md',
}) => {
  const normLevel = level.toUpperCase();

  const getStyle = () => {
    switch (normLevel) {
      case 'HIGH':
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
          dot: 'bg-rose-400 animate-pulse',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : size === 'lg' ? 'px-3 py-1.5 text-xs font-bold' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-semibold ${style.bg} ${sizeClasses}`}>
      {showIcon && style.icon}
      <span>{normLevel}</span>
      {probability !== undefined && (
        <span className="opacity-90 font-normal">({probability.toFixed(0)}%)</span>
      )}
    </span>
  );
};
