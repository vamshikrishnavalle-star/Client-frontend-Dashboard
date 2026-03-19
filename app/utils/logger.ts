/**
 * ============================================
 * LOGGER UTILITY
 * ============================================
 * Centralized logging — silenced in production.
 *
 * Usage:
 *   import { logger } from '@/app/utils/logger';
 *   logger.info('API call:', url);
 *   logger.error('Failed:', err);
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  info:  (...args: unknown[]) => { if (isDev) console.info(...args); },
  warn:  (...args: unknown[]) => { if (isDev) console.warn(...args); },
  error: (...args: unknown[]) => console.error(...args), // always log errors
  debug: (...args: unknown[]) => { if (isDev) console.debug(...args); },
};
