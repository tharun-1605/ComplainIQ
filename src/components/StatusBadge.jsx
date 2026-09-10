import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ClockIcon, ArrowPathIcon, XCircleIcon } from '@heroicons/react/24/outline';

const statusConfig = {
  Pending: {
    label: 'Pending',
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: ClockIcon
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    icon: ArrowPathIcon
  },
  Resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckCircleIcon
  },
  Completed: {
    label: 'Resolved',
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckCircleIcon
  },
  Rejected: {
    label: 'Rejected',
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: XCircleIcon
  }
};

function StatusBadge({ status = 'Pending', size = 'sm' }) {
  const config = statusConfig[status] || statusConfig.Pending;
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium tracking-tight ${config.bg}`}>
      <IconComponent className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
}

export default StatusBadge;
