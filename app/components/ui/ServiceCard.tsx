'use client';

import { ArrowRight, Camera, Video, Sparkles, Megaphone } from 'lucide-react';
import type { Service, ServiceType } from '@/types';

const SERVICE_ICONS: Record<ServiceType, React.ComponentType<{ size?: number; className?: string }>> = {
  ai_avatar_video:     Sparkles,
  product_photo_shoot: Camera,
  product_video_shoot: Video,
  ai_ugc_ad_creator:   Megaphone,
};

const SERVICE_COLORS: Record<ServiceType, { iconBg: string; iconColor: string; accent: string }> = {
  ai_avatar_video:     { iconBg: 'bg-purple-50',  iconColor: 'text-purple-500', accent: 'text-purple-500' },
  product_photo_shoot: { iconBg: 'bg-blue-50',    iconColor: 'text-blue-500',   accent: 'text-blue-500'   },
  product_video_shoot: { iconBg: 'bg-orange-50',  iconColor: 'text-orange-500', accent: 'text-orange-500' },
  ai_ugc_ad_creator:   { iconBg: 'bg-pink-50',    iconColor: 'text-pink-500',   accent: 'text-pink-500'   },
};

interface Props {
  service:   Service;
  onClick?:  () => void;
  selected?: boolean;
}

function formatINR(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function ServiceCard({ service, onClick, selected = false }: Props) {
  const Icon   = SERVICE_ICONS[service.service_type] ?? Sparkles;
  const colors = SERVICE_COLORS[service.service_type] ?? SERVICE_COLORS.ai_avatar_video;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group w-full text-left rounded-2xl border bg-white transition-all duration-200',
        selected
          ? 'border-transparent ring-2 ring-orange-400 shadow-lg shadow-orange-100/50'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-md hover:shadow-gray-100/80',
      ].join(' ')}
    >
      <div className="p-5">
        {/* Icon + price */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.iconBg}`}>
            <Icon size={19} className={colors.iconColor} />
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400 font-medium">Starting at</p>
            <p className="text-sm font-extrabold text-gray-900">{formatINR(service.base_price_inr)}</p>
          </div>
        </div>

        {/* Title + desc */}
        <h3 className="text-[14px] font-extrabold text-gray-900 mb-1.5 leading-snug">
          {service.display_name}
        </h3>
        <p className="text-[12.5px] text-gray-400 leading-relaxed line-clamp-2">
          {service.description}
        </p>

        {/* Payment split */}
        <div className="mt-3 flex gap-2">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-500">
            {service.advance_percent}% advance
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-50 text-gray-400">
            Balance on delivery
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-gray-50">
          <span className={`text-[11px] font-bold ${selected ? 'text-orange-500' : colors.accent} transition-colors`}>
            {selected ? '✓ Selected' : 'Get Started'}
          </span>
          <ArrowRight
            size={13}
            className={`transition-all duration-150 group-hover:translate-x-0.5 ${selected ? 'text-orange-500' : 'text-gray-300'}`}
          />
        </div>
      </div>
    </button>
  );
}
