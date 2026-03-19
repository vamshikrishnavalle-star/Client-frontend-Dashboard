'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { orderApi } from '@/app/api';
import type { Order } from '@/types';

// Statuses that are "active" — poll every 30s to reflect admin updates
const POLL_STATUSES = new Set([
  'pending_payment', 'payment_partial', 'confirmed', 'in_progress', 'review', 'revision_requested',
]);

export function useOrder(orderId: string | null) {
  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const pollRef               = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(() => {
    if (!orderId) return;
    orderApi.get(orderId)
      .then(({ order: data }) => setOrder(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    setLoading(true);
    fetch();
  }, [fetch]);

  // Poll every 30s when order is in an active status
  useEffect(() => {
    if (!order) return;
    if (POLL_STATUSES.has(order.status)) {
      pollRef.current = setInterval(fetch, 30_000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [order, fetch]);

  return { order, loading, error, refetch: fetch };
}
