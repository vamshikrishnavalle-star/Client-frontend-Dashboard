'use client';

import { Suspense, useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

/**
 * ============================================
 * DASHBOARD LAYOUT
 * ============================================
 * Shared shell for all protected pages.
 * Renders: TopBar (full-width) + Sidebar + scrollable main content.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#fafafa]">
      {/* TopBar — full-width, sticky */}
      <div className="shrink-0 z-50">
        <TopBar toggleSidebar={toggleSidebar} />
      </div>

      {/* Body — sidebar + main content */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Desktop sidebar */}
        <div className="hidden lg:flex shrink-0">
          <Suspense fallback={<div className="w-64 bg-white border-r border-gray-100 animate-pulse" />}>
            <Sidebar isOpen={true} toggleSidebar={toggleSidebar} />
          </Suspense>
        </div>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-[#fafafa]">
          <div className="w-full max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      <div className="lg:hidden">
        <Suspense fallback={null}>
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        </Suspense>
      </div>
    </div>
  );
}
