'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { getToken } from '@/app/api';

const PUBLIC_PATHS = ['/', '/login', '/signup'];

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (isPublic) return;
    if (!getToken()) {
      router.push('/');
    }
  }, [pathname, router, isPublic]);

  if (isPublic) return <>{children}</>;
  return <DashboardLayout>{children}</DashboardLayout>;
}
