/**
 * Database Schema TypeScript Types
 * Matches PostgreSQL schema definitions across all 20 tables in supabase/migrations
 */

export type UserRole = "client" | "pending_employee" | "employee" | "admin";
export type UserStatus = "active" | "suspended" | "pending";
export type OrderStatus =
  | "brief_submitted"
  | "quote_pending"
  | "quote_accepted"
  | "in_progress"
  | "review_ready"
  | "revisions_in_progress"
  | "approved"
  | "delivered";

export type PaymentStatus = "unpaid" | "advance_received" | "partially_paid" | "paid_in_full";
export type PaymentType = "advance" | "milestone" | "balance" | "full";
export type PaymentMethod = "upi" | "bank_transfer" | "other";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  phone?: string | null;
  avatar_url?: string | null;
  company_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeProfile {
  id: string;
  user_id: string;
  bio?: string | null;
  college_year?: number | null;
  institution_name?: string | null;
  portfolio_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  skills?: string[] | null;
  is_public_visible: boolean;
  slug?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeRequest {
  id: string;
  user_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  role_interest?: string | null;
  portfolio_url?: string | null;
  resume_url?: string | null;
  experience_summary?: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes?: string | null;
  created_at: string;
  reviewed_at?: string | null;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  full_description: string;
  icon_name: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface Package {
  id: string;
  service_id: string;
  name: string;
  slug: string;
  price_inr: number;
  delivery_time_days: number;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  category: string;
  client_name?: string | null;
  description: string;
  outcome?: string | null;
  technologies: string[];
  cover_image_url?: string | null;
  gallery_urls: string[];
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_role_company?: string | null;
  rating: number;
  content: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  client_id: string;
  service_id?: string | null;
  package_id?: string | null;
  preferred_employee_id?: string | null;
  title: string;
  brief: string;
  requirements: string[];
  status: OrderStatus;
  payment_status: PaymentStatus;
  target_delivery_date?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;

  // Joined fields
  services?: { title: string } | null;
  packages?: { name: string; price_inr: number } | null;
  preferred_profile?: { full_name: string } | null;
  client_profile?: { full_name: string; email: string } | null;
}

export interface Quote {
  id: string;
  order_id: string;
  client_id: string;
  amount_inr: number;
  deliverables: string[];
  estimated_days: number;
  valid_until?: string | null;
  status: "pending" | "accepted" | "rejected" | "expired";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  status: OrderStatus;
  title: string;
  description?: string | null;
  actor_id?: string | null;
  created_at: string;
}

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_profile?: {
    full_name: string;
    role: UserRole;
  } | null;
}

export interface OrderFile {
  id: string;
  order_id: string;
  uploader_id: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number;
  mime_type: string;
  is_deliverable: boolean;
  created_at: string;
}

export interface OrderPayment {
  id: string;
  order_id: string;
  order_number: string;
  client_id: string;
  amount_inr: number;
  payment_type: PaymentType;
  method: PaymentMethod;
  reference_utr?: string | null;
  date_received: string;
  status: "recorded" | "voided";
  notes?: string | null;
  void_reason?: string | null;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  service_id?: string | null;
  message: string;
  ip_hash: string;
  is_handled: boolean;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  full_name: string;
  email: string;
  company_or_project?: string | null;
  interest_details: string;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata: Record<string, unknown>;
  ip_address?: string | null;
  created_at: string;
}
