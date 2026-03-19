'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ShoppingBag } from 'lucide-react';
import { useOrders } from '@/app/hooks/useOrders';
import { OrderCard } from '@/app/components/ui/OrderCard';
import type { OrderStatus } from '@/types';

const TABS: { label: string; value: string }[] = [
  { label: 'All',       value: ''          },
  { label: 'Active',    value: 'active'    },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const ACTIVE_STATUSES: OrderStatus[] = [
  'pending_payment', 'payment_partial', 'confirmed', 'in_progress', 'review', 'revision_requested',
];

export default function OrdersPage() {
  const router = useRouter();
  const [tab,  setTab]  = useState('');
  const [page, setPage] = useState(1);

  // Map UI tab → API status filter
  const statusFilter =
    tab === 'active'    ? ACTIVE_STATUSES.join(',') :
    tab === 'completed' ? 'completed' :
    tab === 'cancelled' ? 'cancelled' : undefined;

  const { orders, pagination, loading } = useOrders({
    status: statusFilter,
    page,
    limit: 12,
  });

  const handleTabChange = (value: string) => {
    setTab(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.5rem] font-extrabold text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {pagination ? `${pagination.total} order${pagination.total !== 1 ? 's' : ''}` : 'All your service orders.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/services')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-orange-200"
        >
          <Plus size={14} /> New Order
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => handleTabChange(t.value)}
            className={[
              'px-4 py-1.5 rounded-lg text-sm font-semibold transition-all',
              tab === t.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded-lg w-1/2 mb-3" />
              <div className="h-6 bg-gray-100 rounded-lg w-3/4 mb-4" />
              <div className="h-3 bg-gray-50 rounded-full w-1/3" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag size={22} className="text-orange-400" />
          </div>
          <p className="text-sm font-bold text-gray-700 mb-1">
            {tab ? `No ${tab} orders` : 'No orders yet'}
          </p>
          <p className="text-[13px] text-gray-400 mb-4">
            {tab ? 'Try a different filter.' : 'Place your first order to get started.'}
          </p>
          <button
            type="button"
            onClick={() => router.push('/services')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-orange-200"
          >
            <Plus size={14} /> New Order
          </button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm font-semibold text-gray-500">
                Page {page} of {pagination.total_pages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={page === pagination.total_pages}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
