'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, ClipboardList, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '@/app/components/auth';

interface SidebarProps {
  isOpen:        boolean;
  toggleSidebar: () => void;
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ShoppingBag,     label: 'Services',  href: '/services'  },
  { icon: ClipboardList,   label: 'My Orders', href: '/orders'    },
  { icon: Settings,        label: 'Settings',  href: '/settings'  },
];

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const { logout } = useAuth();
  const pathname   = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 shadow-sm w-64">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100 flex items-center gap-3">
        <Image
          src="https://aiagenticverse.com/ai-agentic-verse-logo.png"
          alt="AI Agentic Verse"
          width={36}
          height={36}
          className="rounded-xl"
        />
        <div>
          <p className="font-extrabold text-gray-900 text-sm leading-none">AI Agentic Verse</p>
          <p className="text-[10px] text-orange-500 font-semibold uppercase tracking-widest mt-0.5">
            Client Portal
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon   = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={toggleSidebar}
              className={[
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                active
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
              ].join(' ')}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 hover:text-red-500 w-full text-left transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex h-full">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={toggleSidebar} />
          <div className="relative z-50">
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={toggleSidebar}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:bg-gray-100 z-50"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
