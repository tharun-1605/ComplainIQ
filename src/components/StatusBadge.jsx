import React from 'react';
import { 
  ClockIcon, 
  ArrowPathIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';

const statusConfig = {
  Pending: {
    label: 'Pending Review',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dotBg: 'bg-amber-400',
    icon: ClockIcon
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    dotBg: 'bg-indigo-400',
    icon: ArrowPathIcon
  },
  Resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    dotBg: 'bg-emerald-400',
    icon: CheckCircleIcon
  },
  Rejected: {
    label: 'Rejected',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    dotBg: 'bg-rose-400',
    icon: XCircleIcon
  }
};

function StatusBadge({ status = 'Pending', size = 'md' }) {
  const config = statusConfig[status] || statusConfig.Pending;
  const IconComponent = config.icon;

  const sizeClasses = size === 'sm' 
    ? 'px-2.5 py-1 text-xs gap-1.5' 
    : 'px-3 py-1.5 text-xs font-semibold gap-2';

  return (
    <span className={`inline-flex items-center rounded-full border backdrop-blur-md transition-all ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}>
      <span className={`relative flex h-2 w-2`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotBg} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotBg}`}></span>
      </span>
      <IconComponent className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}

export default StatusBadge;
