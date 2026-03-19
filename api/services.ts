/**
 * ============================================
 * API SERVICES
 * ============================================
 * Centralized API service functions.
 * All HTTP requests go through these functions.
 */

import { API_ROUTES } from './routes';
import type {
  Service, Order, Payment, OrderFile, Pagination,
  OrderBrief, PaymentType, FileCategory,
  InitiatePaymentResponse,
} from '@/types';

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  organization_name: string;
  whatsapp_number: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface SignupPayload {
  full_name: string;
  whatsapp_number: string;
  organization_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export const saveToken = (token: string) => localStorage.setItem('token', token);
export const getToken  = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;
export const saveUser  = (user: AuthUser) =>
  localStorage.setItem('user', JSON.stringify(user));
export const getUser   = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
};
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ─── Auth headers ─────────────────────────────────────────────────────────────

const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

export async function apiCall<T>(
  method: string,
  url: string,
  data?: unknown,
  skipAuth = false,
): Promise<T> {
  const isAuthEndpoint = url.includes('/login') || url.includes('/signup');

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(skipAuth || isAuthEndpoint ? {} : getAuthHeaders()),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  const json = await res.json();

  if (!res.ok) {
    if (res.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
      clearAuth();
      window.location.href = '/';
    }
    const err = new Error(json?.error ?? 'Request failed.') as Error & {
      response: { data: typeof json };
    };
    err.response = { data: json };
    throw err;
  }

  return json as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const api = {
  signup: (payload: SignupPayload) =>
    apiCall<AuthResponse>('POST', API_ROUTES.AUTH.SIGNUP, payload, true),
  login: (payload: LoginPayload) =>
    apiCall<AuthResponse>('POST', API_ROUTES.AUTH.LOGIN, payload, true),
  me: () => apiCall<{ success: boolean; user: AuthUser }>('GET', API_ROUTES.AUTH.ME),
  logout: () => apiCall<{ success: boolean; message: string }>('POST', API_ROUTES.AUTH.LOGOUT),
};

// ─── Services API ─────────────────────────────────────────────────────────────

export const serviceApi = {
  list: () =>
    apiCall<{ success: boolean; services: Service[] }>('GET', API_ROUTES.SERVICES.LIST),
  get: (id: string) =>
    apiCall<{ success: boolean; service: Service }>('GET', API_ROUTES.SERVICES.DETAIL(id)),
};

// ─── Orders API ───────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  service_id:   string;
  brief:        OrderBrief;
  client_notes?: string;
  discount_inr?: number;
}

export interface ListOrdersResponse {
  success:    boolean;
  orders:     Order[];
  pagination: Pagination;
}

export const orderApi = {
  list: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.page)   qs.set('page', String(params.page));
    if (params?.limit)  qs.set('limit', String(params.limit));
    const url = `${API_ROUTES.ORDERS.LIST}${qs.toString() ? `?${qs}` : ''}`;
    return apiCall<ListOrdersResponse>('GET', url);
  },
  create: (payload: CreateOrderPayload) =>
    apiCall<{ success: boolean; order: Order }>('POST', API_ROUTES.ORDERS.CREATE, payload),
  get: (id: string) =>
    apiCall<{ success: boolean; order: Order }>('GET', API_ROUTES.ORDERS.DETAIL(id)),
  cancel: (id: string, reason?: string) =>
    apiCall<{ success: boolean; message: string }>('DELETE', API_ROUTES.ORDERS.CANCEL(id), { reason }),
  initiatePayment: (orderId: string, payload: { payment_type: PaymentType; gateway: 'razorpay' }) =>
    apiCall<InitiatePaymentResponse>('POST', API_ROUTES.ORDERS.PAYMENTS(orderId), payload),
  listPayments: (orderId: string) =>
    apiCall<{ success: boolean; payments: Payment[] }>('GET', API_ROUTES.ORDERS.PAYMENTS(orderId)),
  listFiles: (orderId: string) =>
    apiCall<{ success: boolean; files: OrderFile[] }>('GET', API_ROUTES.ORDERS.FILES(orderId)),

  downloadInvoice: async (orderId: string, orderNumber: string): Promise<void> => {
    const token = getToken();
    const res = await fetch(API_ROUTES.ORDERS.INVOICE(orderId), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error((json as { error?: string }).error ?? 'Failed to download invoice.');
    }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `INV-${orderNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// ─── Payments API ─────────────────────────────────────────────────────────────

export interface VerifyPaymentPayload {
  payment_id:           string;
  razorpay_order_id:    string;
  razorpay_payment_id:  string;
  razorpay_signature:   string;
}

export const paymentApi = {
  verifyRazorpay: (payload: VerifyPaymentPayload) =>
    apiCall<{ success: boolean; payment: Partial<Payment>; order: Partial<Order> }>(
      'POST', API_ROUTES.PAYMENTS.VERIFY, payload
    ),
};

// ─── Uploads API ──────────────────────────────────────────────────────────────

export interface PresignPayload {
  order_id:        string;
  file_name:       string;
  content_type:    string;
  file_size_bytes: number;
  category:        FileCategory;
}

export interface ConfirmPayload {
  order_id:        string;
  storage_path:    string;
  file_name:       string;
  content_type:    string;
  file_size_bytes: number;
  category:        FileCategory;
}

export const uploadApi = {
  presign: (payload: PresignPayload) =>
    apiCall<{ success: boolean; upload: { presigned_url: string; storage_path: string } }>(
      'POST', API_ROUTES.UPLOADS.PRESIGN, payload
    ),

  confirm: (payload: ConfirmPayload) =>
    apiCall<{ success: boolean; file: OrderFile }>('POST', API_ROUTES.UPLOADS.CONFIRM, payload),

  downloadFile: async (fileId: string, fileName: string): Promise<void> => {
    const { download_url } = await apiCall<{ success: boolean; download_url: string; file_name: string }>(
      'GET', API_ROUTES.UPLOADS.DOWNLOAD(fileId)
    );
    const a    = document.createElement('a');
    a.href     = download_url;
    a.download = fileName;
    a.target   = '_blank';
    a.click();
  },

  delete: (fileId: string) =>
    apiCall<{ success: boolean; message: string }>('DELETE', API_ROUTES.UPLOADS.DELETE(fileId)),
};
