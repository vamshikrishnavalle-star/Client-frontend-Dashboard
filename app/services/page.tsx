'use client';

import { useRouter } from 'next/navigation';
import { useServices } from '@/app/hooks/useServices';
import { ServiceCard } from '@/app/components/ui/ServiceCard';

export default function ServicesPage() {
  const router = useRouter();
  const { services, loading, error } = useServices();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[1.5rem] font-extrabold text-gray-900 tracking-tight">Services</h1>
        <p className="text-gray-400 text-sm mt-1">
          Choose a service to start your order. All work begins after advance payment.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 font-semibold">
          {error}
        </div>
      )}

      {/* Service cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100" />
                <div className="w-16 h-8 rounded-lg bg-gray-100" />
              </div>
              <div className="h-4 bg-gray-100 rounded-lg w-2/3 mb-2" />
              <div className="h-3 bg-gray-50 rounded-full mb-1" />
              <div className="h-3 bg-gray-50 rounded-full w-5/6" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {services.map((svc) => (
            <ServiceCard
              key={svc.id}
              service={svc}
              onClick={() => router.push(`/order/new?service=${svc.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pricing note */}
      {!loading && services.length > 0 && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5">
          <h3 className="text-sm font-extrabold text-gray-800 mb-2">How Pricing Works</h3>
          <ul className="space-y-1.5 text-[13px] text-gray-500">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-0.5">•</span>
              Pay <span className="font-bold text-gray-700">50% advance</span> to start — we begin work immediately.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-0.5">•</span>
              Pay the <span className="font-bold text-gray-700">remaining 50% on delivery</span> after you approve the final output.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-0.5">•</span>
              All prices include <span className="font-bold text-gray-700">2 rounds of revisions</span>.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
