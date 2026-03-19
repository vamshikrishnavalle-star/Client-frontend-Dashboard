'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ClipboardList, CheckCircle, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import { getUser, type AuthUser } from '@/app/api';
import { useOrders } from '@/app/hooks/useOrders';
import { useServices } from '@/app/hooks/useServices';
import { StatCard } from '@/app/components/ui/StatCard';
import { ServiceCard } from '@/app/components/ui/ServiceCard';
import { OrderCard } from '@/app/components/ui/OrderCard';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  const { orders,   loading: ordersLoading  } = useOrders({ limit: 3 });
  const { services, loading: servicesLoading } = useServices();

  useEffect(() => {
    const stored = getUser();
    if (!stored) { router.push('/'); return; }
    setUser(stored);
  }, [router]);

  if (!user) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-9 h-9 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const firstName    = user.full_name.split(' ')[0];
  const initials     = user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const totalOrders  = orders.length;
  const activeOrders = orders.filter((o) =>
    ['pending_payment','payment_partial','confirmed','in_progress','review','revision_requested'].includes(o.status)
  ).length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const totalSpent = orders
    .filter((o) => ['confirmed','in_progress','review','revision_requested','completed'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.advance_amount), 0);

  return (
    <div className="space-y-8">

      {/* ── Welcome header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50/60 to-white border border-orange-100/80 px-7 py-6">
        <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-orange-400/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-28 h-28 rounded-full bg-amber-300/10 blur-2xl" />

        <div className="relative flex items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-500 uppercase tracking-[0.16em] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Active Session
            </div>
            <h1 className="text-2xl md:text-[1.75rem] font-extrabold text-gray-900 tracking-tight leading-snug">
              Welcome back, <span className="text-orange-500">{firstName}</span>! 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1.5 max-w-xs leading-relaxed">
              Manage your AI services, track orders, and grow your business.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-bold text-gray-800 leading-none">{user.full_name}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[150px]">{user.organization_name}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white text-sm font-extrabold ring-4 ring-orange-100 shadow-sm">
              {initials}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={ordersLoading ? '—' : totalOrders}
          icon={<ShoppingBag size={18} className="text-orange-500" />}
          iconBg="bg-orange-50"
        />
        <StatCard
          label="Active Orders"
          value={ordersLoading ? '—' : activeOrders}
          icon={<ClipboardList size={18} className="text-purple-500" />}
          iconBg="bg-purple-50"
        />
        <StatCard
          label="Completed"
          value={ordersLoading ? '—' : completedOrders}
          icon={<CheckCircle size={18} className="text-green-500" />}
          iconBg="bg-green-50"
        />
        <StatCard
          label="Total Spent"
          value={ordersLoading ? '—' : `₹${totalSpent.toLocaleString('en-IN')}`}
          icon={<TrendingUp size={18} className="text-blue-500" />}
          iconBg="bg-blue-50"
        />
      </div>

      {/* ── Services ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[1.2rem] font-extrabold text-gray-900 tracking-tight">Our Services</h2>
            <p className="text-gray-400 text-sm mt-0.5">Select a service to place a new order.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/services')}
            className="flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        {servicesLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gray-100 mb-4" />
                <div className="h-4 bg-gray-100 rounded-lg w-3/4 mb-2" />
                <div className="h-3 bg-gray-50 rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                onClick={() => router.push(`/order/new?service=${svc.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Recent Orders ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[1.2rem] font-extrabold text-gray-900 tracking-tight">Recent Orders</h2>
            <p className="text-gray-400 text-sm mt-0.5">Your latest service requests.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/orders')}
            className="flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            All Orders <ArrowRight size={14} />
          </button>
        </div>

        {ordersLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded-lg w-1/2 mb-2" />
                <div className="h-3 bg-gray-50 rounded-full w-1/4" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag size={22} className="text-orange-400" />
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1">No orders yet</p>
            <p className="text-[13px] text-gray-400 mb-4">Select a service above to get started.</p>
            <button
              type="button"
              onClick={() => router.push('/services')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-orange-200"
            >
              <Plus size={14} /> Place First Order
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
