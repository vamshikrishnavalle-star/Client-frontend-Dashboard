// ─── SHARED TYPESCRIPT TYPES ──────────────────────────────────────────────────

export type ServiceType =
  | 'ai_avatar_video'
  | 'product_photo_shoot'
  | 'product_video_shoot'
  | 'ai_ugc_ad_creator';

export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'payment_partial'
  | 'confirmed'
  | 'in_progress'
  | 'review'
  | 'revision_requested'
  | 'completed'
  | 'cancelled';

export type PaymentType   = 'advance' | 'balance' | 'full';
export type PaymentStatus = 'pending' | 'captured' | 'failed' | 'refunded';
export type FileCategory  = 'voice_sample' | 'video_sample' | 'raw_asset' | 'brief' | 'deliverable' | 'revision';

// ─── SERVICE ──────────────────────────────────────────────────────────────────

export interface Service {
  id:              string;
  service_type:    ServiceType;
  display_name:    string;
  description:     string;
  base_price_inr:  number;
  advance_percent: number;
  advance_amount:  number;
  balance_amount:  number;
  is_active:       boolean;
  metadata:        Record<string, unknown>;
  created_at:      string;
}

// ─── ORDER ────────────────────────────────────────────────────────────────────

export interface OrderBriefAiAvatar {
  script:    string;
  tone?:     string;
  language?: string;
}

export interface OrderBriefPhotoShoot {
  product_name:  string;
  shot_count:    number;
  instructions?: string;
}

export interface OrderBriefVideoShoot {
  product_name: string;
  video_type:   'professional' | 'storytelling';
  video_count:  number;
  length_min:   number;
  script?:      string;
}

export interface OrderBriefUgcAd {
  product_name:    string;
  ad_count:        number;
  platform?:       string[];
  cta?:            string;
  script?:         string;
  target_audience?: string;
}

export type OrderBrief =
  | OrderBriefAiAvatar
  | OrderBriefPhotoShoot
  | OrderBriefVideoShoot
  | OrderBriefUgcAd;

export interface Order {
  id:                  string;
  order_number:        string;
  client_id:           string;
  service_id:          string;
  service_type:        ServiceType;
  service_name?:       string;
  status:              OrderStatus;
  base_price_inr:      number;
  advance_percent:     number;
  advance_amount:      number;
  balance_amount:      number;
  discount_inr:        number;
  final_price_inr:     number;
  currency:            string;
  brief:               OrderBrief;
  client_notes?:       string;
  admin_notes?:        string;
  expected_delivery_at?: string;
  delivered_at?:       string;
  created_at:          string;
  updated_at:          string;
  // Enriched fields (from getOrder)
  service?:            Partial<Service>;
  payments?:           Payment[];
  files?:              OrderFile[];
  status_history?:     StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  id:          string;
  order_id:    string;
  from_status: OrderStatus | null;
  to_status:   OrderStatus;
  note:        string | null;
  created_at:  string;
}

// ─── PAYMENT ──────────────────────────────────────────────────────────────────

export interface Payment {
  id:               string;
  order_id:         string;
  payment_type:     PaymentType;
  gateway:          'razorpay' | 'stripe';
  status:           PaymentStatus;
  amount_paise:     number;
  currency:         string;
  paid_at?:         string;
  created_at:       string;
}

export interface InitiatePaymentResponse {
  payment: {
    id:               string;
    gateway_order_id: string;
    amount_paise:     number;
    amount_inr:       number;
    currency:         string;
    key_id:           string;
  };
}

// ─── FILE ─────────────────────────────────────────────────────────────────────

export interface OrderFile {
  id:               string;
  order_id:         string;
  category:         FileCategory;
  file_name:        string;
  content_type:     string;
  file_size_bytes?: number;
  created_at:       string;
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────

export interface Pagination {
  total:       number;
  page:        number;
  limit:       number;
  total_pages: number;
}

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────

export interface Notification {
  id:         string;
  order_id?:  string;
  title:      string;
  body:       string;
  is_read:    boolean;
  created_at: string;
}
