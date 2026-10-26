import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SERVICES, DEFAULT_PACKAGES } from "./content";

export type OrderStatus =
  | "submitted"
  | "in_review"
  | "quote_sent"
  | "accepted"
  | "in_progress"
  | "awaiting_feedback"
  | "delivered"
  | "closed"
  | "cancelled";

export type PaymentStatus =
  | "unbilled"
  | "quote_pending"
  | "invoiced"
  | "partially_paid"
  | "paid_in_full"
  | "refunded";

export interface Order {
  id: string;
  order_number: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  service_id: string;
  service_title: string;
  package_id?: string | null;
  package_name?: string | null;
  preferred_employee_id?: string | null;
  preferred_employee_name?: string | null;
  title: string;
  project_brief: string;
  budget_min_inr: number;
  budget_max_inr: number;
  target_deadline: string;
  preferred_contact_method: "whatsapp" | "email" | "phone";
  status: OrderStatus;
  quote_amount_inr?: number | null;
  quote_terms?: string | null;
  payment_status: PaymentStatus;
  internal_notes?: string | null;
  reference_links?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: "client" | "employee" | "admin";
  content: string;
  attachments?: any[];
  is_read?: boolean;
  created_at: string;
}

export interface OrderFile {
  id: string;
  order_id: string;
  uploader_id: string;
  uploader_name?: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  file_category: "client_reference" | "deliverable" | "invoice" | "feedback";
  is_deliverable: boolean;
  created_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  actor_id?: string;
  actor_name?: string;
  event_type: string;
  previous_value?: string;
  new_value: string;
  notes?: string;
  created_at: string;
}

/**
 * Fetch all orders for a client
 */
export async function getClientOrders(clientId?: string): Promise<Order[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from("orders")
      .select(`
        *,
        services (title),
        packages (name),
        preferred_profile:preferred_employee_id (full_name)
      `)
      .order("created_at", { ascending: false });

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      ...row,
      service_title: row.services?.title || "Custom Service",
      package_name: row.packages?.name || null,
      preferred_employee_name: row.preferred_profile?.full_name || null,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch a single order by order number
 */
export async function getOrderByNumber(
  orderNumber: string
): Promise<Order | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        services (title),
        packages (name),
        preferred_profile:preferred_employee_id (full_name),
        client_profile:client_id (full_name, email)
      `)
      .eq("order_number", orderNumber)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      ...data,
      service_title: data.services?.title || "Custom Service",
      package_name: data.packages?.name || null,
      preferred_employee_name: data.preferred_profile?.full_name || null,
      client_name: data.client_profile?.full_name,
      client_email: data.client_profile?.email,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch messages for an order
 */
export async function getOrderMessages(
  orderNumber: string,
  orderId?: string
): Promise<OrderMessage[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("order_messages")
      .select(`
        *,
        sender:sender_id (full_name, role)
      `)
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((msg: any) => ({
      id: msg.id,
      order_id: msg.order_id,
      sender_id: msg.sender_id,
      sender_name: msg.sender?.full_name || "Team Member",
      sender_role: msg.sender?.role || "employee",
      content: msg.content,
      attachments: msg.attachments || [],
      is_read: msg.is_read,
      created_at: msg.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch files for an order
 */
export async function getOrderFiles(
  orderNumber: string,
  orderId?: string
): Promise<OrderFile[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("order_files")
      .select(`
        *,
        uploader:uploader_id (full_name)
      `)
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((f: any) => ({
      ...f,
      uploader_name: f.uploader?.full_name || "Team",
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch timeline events for an order
 */
export async function getOrderEvents(
  orderNumber: string,
  orderId?: string
): Promise<OrderEvent[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("order_events")
      .select(`
        *,
        actor:actor_id (full_name)
      `)
      .eq("order_id", orderId)
      .eq("is_internal_only", false)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((ev: any) => ({
      ...ev,
      actor_name: ev.actor?.full_name,
    }));
  } catch {
    return [];
  }
}
