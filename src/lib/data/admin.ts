import { createClient } from "@/lib/supabase/server";
import type { Order } from "./orders";

export interface EmployeeRequestItem {
  id: string;
  user_id: string;
  applicant_name: string;
  applicant_email: string;
  portfolio_url?: string | null;
  resume_url?: string | null;
  skills: string[];
  cover_note: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  created_at: string;
}

export interface EmployeeAdminItem {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  designation: string;
  availability_status: "available" | "busy" | "unavailable";
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
  status: "active" | "suspended";
  created_at: string;
}

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  service_title?: string | null;
  message: string;
  is_handled: boolean;
  handled_at?: string | null;
  created_at: string;
}

export interface WaitlistEntryItem {
  id: string;
  full_name: string;
  email: string;
  company_or_project?: string | null;
  interest_details: string;
  is_handled: boolean;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  actor_id?: string | null;
  actor_name?: string | null;
  actor_email?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

/**
 * Fetch employee requests pending founder review
 */
export async function getEmployeeRequests(): Promise<EmployeeRequestItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("employee_requests")
      .select(`
        *,
        applicant:user_id (full_name, email)
      `)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      user_id: d.user_id,
      applicant_name: d.applicant?.full_name || "Applicant",
      applicant_email: d.applicant?.email || "applicant@example.com",
      portfolio_url: d.portfolio_url,
      resume_url: d.resume_url,
      skills: d.skills || [],
      cover_note: d.cover_note,
      status: d.status,
      rejection_reason: d.rejection_reason,
      created_at: d.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch all employees for admin management
 */
export async function getAllEmployeesAdmin(): Promise<EmployeeAdminItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("employee_profiles")
      .select(`
        *,
        profile:user_id (full_name, email, status)
      `)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      user_id: d.user_id,
      full_name: d.profile?.full_name || "Specialist",
      email: d.profile?.email || "",
      designation: d.designation,
      availability_status: d.availability_status,
      is_published: d.is_published,
      is_featured: d.is_featured,
      display_order: d.display_order,
      status: d.profile?.status || "active",
      created_at: d.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch all studio orders with internal notes for admin
 */
export async function getAllOrdersAdmin(): Promise<Order[]> {
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
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      ...row,
      service_title: row.services?.title || "Custom Service",
      package_name: row.packages?.name || null,
      preferred_employee_name: row.preferred_profile?.full_name || null,
      client_name: row.client_profile?.full_name || "Client",
      client_email: row.client_profile?.email || "",
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch contact enquiries & hardware waitlist
 */
export async function getAdminInbox(): Promise<{
  contactMessages: ContactMessageItem[];
  waitlistEntries: WaitlistEntryItem[];
}> {
  try {
    const supabase = createClient();
    const [contactRes, waitlistRes] = await Promise.all([
      supabase
        .from("contact_messages")
        .select("*, services(title)")
        .order("created_at", { ascending: false }),
      supabase
        .from("waitlist_entries")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    const contactMessages: ContactMessageItem[] =
      contactRes.data && contactRes.data.length > 0
        ? contactRes.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            service_title: c.services?.title,
            message: c.message,
            is_handled: c.is_handled,
            handled_at: c.handled_at,
            created_at: c.created_at,
          }))
        : [];

    const waitlistEntries: WaitlistEntryItem[] =
      waitlistRes.data && waitlistRes.data.length > 0
        ? waitlistRes.data
        : [];

    return { contactMessages, waitlistEntries };
  } catch {
    return {
      contactMessages: [],
      waitlistEntries: [],
    };
  }
}

/**
 * Fetch audit logs
 */
export async function getAuditLogs(): Promise<AuditLogItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("audit_log")
      .select(`
        *,
        actor:actor_id (full_name, email)
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      actor_id: d.actor_id,
      actor_name: d.actor?.full_name || "System Admin",
      actor_email: d.actor?.email,
      action: d.action,
      entity_type: d.entity_type,
      entity_id: d.entity_id,
      metadata: d.metadata || {},
      created_at: d.created_at,
    }));
  } catch {
    return [];
  }
}
