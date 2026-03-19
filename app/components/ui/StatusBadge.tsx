'use client';

import type { OrderStatus } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  draft:               { label: 'Draft',              bg: 'bg-gray-100',   text: 'text-gray-500'   },
  pending_payment:     { label: 'Awaiting Payment',   bg: 'bg-yellow-50',  text: 'text-yellow-600' },
  payment_partial:     { label: 'Advance Paid',       bg: 'bg-blue-50',    text: 'text-blue-600'   },
  confirmed:           { label: 'Confirmed',          bg: 'bg-orange-50',  text: 'text-orange-600' },
  in_progress:         { label: 'In Progress',        bg: 'bg-purple-50',  text: 'text-purple-600' },
  review:              { label: 'Under Review',       bg: 'bg-teal-50',    text: 'text-teal-600'   },
  revision_requested:  { label: 'Revision Requested', bg: 'bg-pink-50',   text: 'text-pink-600'   },
  completed:           { label: 'Completed',          bg: 'bg-green-50',   text: 'text-green-600'  },
  cancelled:           { label: 'Cancelled',          bg: 'bg-red-50',     text: 'text-red-500'    },
};

interface Props {
  status: OrderStatus;
  size?:  'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={[
      'inline-flex items-center font-bold rounded-full',
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1',
      cfg.bg, cfg.text,
    ].join(' ')}>
      {cfg.label}
    </span>
  );
}

export { STATUS_CONFIG };
