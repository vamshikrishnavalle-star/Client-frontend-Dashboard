'use client';

import { ArrowRight, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/types';
import { StatusBadge } from './StatusBadge';

interface Props {
  order: Order;
}

function formatINR(n: number) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function OrderCard({ order }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/order/${order.id}`)}
      className="group w-full text-left rounded-2xl border border-gray-100 bg-white p-5 hover:border-gray-200 hover:shadow-md hover:shadow-gray-100/80 transition-all duration-200"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[11px] text-gray-400 font-medium mb-0.5">{order.order_number}</p>
          <h3 className="text-sm font-extrabold text-gray-900 leading-snug">
            {order.service_name ?? order.service_type.replace(/_/g, ' ')}
          </h3>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Price row */}
      <div className="flex items-center gap-4 text-sm mb-3">
        <div>
          <p className="text-[10px] text-gray-400">Total</p>
          <p className="font-extrabold text-gray-900">{formatINR(order.final_price_inr)}</p>
        </div>
        {order.status === 'pending_payment' || order.status === 'payment_partial' ? (
          <div>
            <p className="text-[10px] text-orange-400">Advance Due</p>
            <p className="font-bold text-orange-500">{formatINR(order.advance_amount)}</p>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <Calendar size={11} />
          <span>Created {formatDate(order.created_at)}</span>
        </div>
        <ArrowRight
          size={13}
          className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </button>
  );
}
