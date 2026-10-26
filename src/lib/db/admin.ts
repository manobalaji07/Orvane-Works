/**
 * Data-Access Layer: Admin Queue, Messages & Logs
 */

import { createClient } from "@/lib/supabase/server";
import type { ContactMessage, EmployeeRequest, WaitlistEntry, AuditLogEntry } from "@/types/database";

export async function getEmployeeRequests(): Promise<EmployeeRequest[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("employee_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as EmployeeRequest[];
  } catch {
    return [];
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as ContactMessage[];
  } catch {
    return [];
  }
}

export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("waitlist_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as WaitlistEntry[];
  } catch {
    return [];
  }
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !data) return [];
    return data as unknown as AuditLogEntry[];
  } catch {
    return [];
  }
}
