'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser, clearAuth, type AuthUser } from '@/app/api';

export function useAuth() {
  const router = useRouter();
  const [user, setUser]                       = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    setUser(getUser());
    setIsAuthenticated(!!getToken());
  }, []);

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  return { isAuthenticated, user, logout };
}
