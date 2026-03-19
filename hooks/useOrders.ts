'use client';

import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '@/app/api';
import type { Order, Pagination } from '@/types';

interface UseOrdersOptions {
  status?: string;
  page?:   number;
  limit?:  number;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders,     setOrders]     = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    orderApi.list(options)
      .then(({ orders: data, pagination: pg }) => {
        setOrders(data);
        setPagination(pg);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.status, options.page, options.limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { orders, pagination, loading, error, refetch: fetch };
}
