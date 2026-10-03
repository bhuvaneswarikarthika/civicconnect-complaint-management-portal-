import React from 'react';
import { ComplaintPriority } from '../../types';
import { Flame, AlertTriangle, AlertCircle, Minus } from 'lucide-react';

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const getStyle = () => {
    switch (priority) {
      case 'Urgent':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: Flame,
          label: 'Urgent',
        };
      case 'High':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: AlertCircle,
          label: 'High Priority',
        };
      case 'Medium':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: AlertTriangle,
          label: 'Medium Priority',
        };
      case 'Low':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: Minus,
          label: 'Low Priority',
        };
    }
  };

  const config = getStyle();
  const Icon = config.icon;

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-0.5 font-medium';

  return (
    <span className={`inline-flex items-center gap-1 rounded border ${config.bg} ${sizeClass}`}>
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
