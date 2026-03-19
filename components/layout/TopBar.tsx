'use client';

import { Bell, Menu } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/app/components/auth';

/**
 * ============================================
 * TOP BAR
 * ============================================
 * Sticky top navigation bar shown on all protected pages.
 * Contains: logo (mobile) | hamburger | notifications | user info
 */
export default function TopBar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user } = useAuth();

  const initials = user?.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  return (
    <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden lg:block">
          <p className="text-sm font-bold text-gray-900">Dashboard</p>
          {user && <p className="text-xs text-gray-400">Welcome back, {user.full_name.split(' ')[0]}</p>}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Notifications" className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell size={19} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-orange-200">
            {initials}
          </div>
          {user && (
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">{user.full_name}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[140px]">{user.organization_name}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
