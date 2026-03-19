'use client';

import type { ReactNode } from 'react';

interface Props {
  label:       string;
  value:       string | number;
  icon:        ReactNode;
  iconBg?:     string;
  iconColor?:  string;
  trend?:      string;
  trendUp?:    boolean;
}

export function StatCard({ label, value, icon, iconBg = 'bg-gray-50', trend, trendUp }: Props) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            trendUp ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 leading-none mb-1">{value}</p>
      <p className="text-[12px] text-gray-400 font-medium">{label}</p>
    </div>
  );
}
