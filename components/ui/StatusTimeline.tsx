'use client';

import type { OrderStatus, StatusHistoryEntry } from '@/types';
import { STATUS_CONFIG } from './StatusBadge';

const TIMELINE_STEPS: OrderStatus[] = [
  'pending_payment',
  'confirmed',
  'in_progress',
  'review',
  'completed',
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface Props {
  currentStatus: OrderStatus;
  history?:      StatusHistoryEntry[];
}

export function StatusTimeline({ currentStatus, history = [] }: Props) {
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((step, idx) => {
        const histEntry  = history.find((h) => h.to_status === step);
        const stepIdx    = TIMELINE_STEPS.indexOf(currentStatus);
        const isComplete = !isCancelled && idx < stepIdx;
        const isCurrent  = !isCancelled && idx === stepIdx;
        const isPending  = isCancelled || idx > stepIdx;

        return (
          <div key={step} className="flex items-start gap-3">
            {/* Dot + vertical connector */}
            <div className="flex flex-col items-center shrink-0">
              <div className={[
                'w-3 h-3 rounded-full mt-0.5 transition-colors',
                isComplete ? 'bg-orange-500' :
                isCurrent  ? 'bg-orange-500 ring-4 ring-orange-100' :
                             'bg-gray-200',
              ].join(' ')} />
              {idx < TIMELINE_STEPS.length - 1 && (
                <div className={[
                  'w-0.5 h-8',
                  isComplete ? 'bg-orange-200' : 'bg-gray-100',
                ].join(' ')} />
              )}
            </div>

            {/* Label + date */}
            <div className={`pb-1 ${isPending ? 'opacity-35' : ''}`}>
              <p className={[
                'text-sm font-semibold leading-none',
                isCurrent ? 'text-orange-600' : 'text-gray-700',
              ].join(' ')}>
                {STATUS_CONFIG[step].label}
              </p>
              {histEntry && (
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {formatDate(histEntry.created_at)}
                </p>
              )}
              {histEntry?.note && (
                <p className="text-[11px] text-gray-400 italic">{histEntry.note}</p>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div className="flex items-center gap-3 mt-2">
          <div className="w-3 h-3 rounded-full bg-red-400 shrink-0" />
          <p className="text-sm font-semibold text-red-500">Cancelled</p>
        </div>
      )}
    </div>
  );
}
