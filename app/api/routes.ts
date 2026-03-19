const BASE = '/api';

export const API_ROUTES = {
  AUTH: {
    SIGNUP: `${BASE}/auth/signup`,
    LOGIN:  `${BASE}/auth/login`,
    LOGOUT: `${BASE}/auth/logout`,
    ME:     `${BASE}/auth/me`,
  },
  SERVICES: {
    LIST:   `${BASE}/services`,
    DETAIL: (id: string) => `${BASE}/services/${id}`,
  },
  ORDERS: {
    LIST:     `${BASE}/orders`,
    CREATE:   `${BASE}/orders`,
    DETAIL:   (id: string) => `${BASE}/orders/${id}`,
    CANCEL:   (id: string) => `${BASE}/orders/${id}`,
    PAYMENTS: (orderId: string) => `${BASE}/orders/${orderId}/payments`,
    FILES:    (orderId: string) => `${BASE}/orders/${orderId}/files`,
    INVOICE:  (orderId: string) => `${BASE}/orders/${orderId}/invoice`,
  },
  PAYMENTS: {
    VERIFY:           `${BASE}/payments/verify`,
    WEBHOOK_RAZORPAY: `${BASE}/payments/webhook/razorpay`,
  },
  UPLOADS: {
    PRESIGN:  `${BASE}/uploads/presign`,
    CONFIRM:  `${BASE}/uploads/confirm`,
    DOWNLOAD: (fileId: string) => `${BASE}/uploads/files/${fileId}/download`,
    DELETE:   (fileId: string) => `${BASE}/uploads/files/${fileId}`,
  },
  ADMIN: {
    ORDERS:      `${BASE}/admin/orders`,
    ORDER:       (id: string) => `${BASE}/admin/orders/${id}`,
    STATUS:      (id: string) => `${BASE}/admin/orders/${id}/status`,
    DELIVERABLE: (id: string) => `${BASE}/admin/orders/${id}/deliverable`,
    ASSIGN:      (id: string) => `${BASE}/admin/orders/${id}/assign`,
  },
} as const;
