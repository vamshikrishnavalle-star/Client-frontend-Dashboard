'use client';

import { useState, useEffect } from 'react';
import { serviceApi } from '@/app/api';
import type { Service } from '@/types';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    serviceApi.list()
      .then(({ services: data }) => { if (mounted) setServices(data); })
      .catch((e) => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return { services, loading, error };
}
