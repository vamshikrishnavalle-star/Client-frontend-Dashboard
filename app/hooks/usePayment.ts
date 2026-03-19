'use client';

import { useState, useCallback } from 'react';
import { orderApi, paymentApi } from '@/app/api';
import type { PaymentType } from '@/types';

// Load Razorpay script once
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Browser required.'));
    if ((window as unknown as Record<string, unknown>).Razorpay) return resolve();

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK.'));
    document.head.appendChild(script);
  });
}

interface RazorpayOptions {
  key:      string;
  amount:   number;
  currency: string;
  order_id: string;
  name:     string;
  description?: string;
  image?:   string;
  theme?:   { color: string };
  handler:  (response: RazorpayResponse) => void;
  modal?:   { ondismiss?: () => void };
}

interface RazorpayResponse {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const payWithRazorpay = useCallback(async (
    orderId:     string,
    paymentType: PaymentType,
    options?: { name?: string; description?: string }
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create gateway order on backend
      const { payment } = await orderApi.initiatePayment(orderId, {
        payment_type: paymentType,
        gateway:      'razorpay',
      });

      // 2. Ensure Razorpay script is loaded
      await loadRazorpayScript();

      // 3. Open Razorpay checkout modal
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         payment.key_id,
          amount:      payment.amount_paise,
          currency:    payment.currency,
          order_id:    payment.gateway_order_id,
          name:        options?.name        ?? 'AI Agentic Verse',
          description: options?.description ?? `Payment for order`,
          theme:       { color: '#f97316' }, // orange-500
          handler: async (response: RazorpayResponse) => {
            try {
              // 4. Verify HMAC on backend — updates order status
              await paymentApi.verifyRazorpay({
                payment_id:           payment.id,
                razorpay_order_id:    response.razorpay_order_id,
                razorpay_payment_id:  response.razorpay_payment_id,
                razorpay_signature:   response.razorpay_signature,
              });
              resolve();
            } catch (verifyErr) {
              reject(verifyErr);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled.')),
          },
        });
        rzp.open();
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed.';
      setError(message);
      throw err; // re-throw so callers can handle
    } finally {
      setLoading(false);
    }
  }, []);

  return { payWithRazorpay, loading, error };
}
