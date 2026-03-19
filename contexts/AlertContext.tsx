'use client';

import { createContext, useContext, ReactNode } from 'react';
import toast from 'react-hot-toast';

/**
 * ============================================
 * ALERT CONTEXT
 * ============================================
 * Global alert/notification helpers available app-wide.
 *
 * Usage:
 *   const { showSuccess, showError } = useAlert();
 *   showSuccess('Saved successfully!');
 */

interface AlertContextValue {
  showSuccess: (msg: string) => void;
  showError:   (msg: string) => void;
  showInfo:    (msg: string) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const value: AlertContextValue = {
    showSuccess: (msg) => toast.success(msg),
    showError:   (msg) => toast.error(msg),
    showInfo:    (msg) => toast(msg),
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export function useAlert(): AlertContextValue {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
}
