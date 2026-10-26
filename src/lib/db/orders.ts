/**
 * Data-Access Layer: Orders, Events, Messages, Files & Quotes
 */

import { createClient } from "@/lib/supabase/server";
import type { Order, OrderEvent, OrderFile, OrderMessage, Quote } from "@/types/database";

export async function getOrdersForClient(clientId: string): Promise<Order[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        services (title),
        packages (name, price_inr),
        preferred_profile:preferred_employee_id (full_name)
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as Order[];
  } catch {
    return [];
  }
}

export async function getOrdersForEmployee(employeeId: string): Promise<Order[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        services (title),
        packages (name),
        client_profile:client_id (full_name, email)
      `)
      .or(`preferred_employee_id.eq.${employeeId},id.in.(select order_id from order_assignments where employee_id = '${employeeId}')`)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as Order[];
  } catch {
    return [];
  }
}

export async function getAllOrdersAdmin(): Promise<Order[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        services (title),
        packages (name, price_inr),
        preferred_profile:preferred_employee_id (full_name),
        client_profile:client_id (full_name, email)
      `)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as Order[];
  } catch {
    return [];
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        services (title),
        packages (name, price_inr),
        preferred_profile:preferred_employee_id (full_name),
        client_profile:client_id (full_name, email)
      `)
      .eq("order_number", orderNumber)
      .single();

    if (error || !data) return null;
    return data as Order;
  } catch {
    return null;
  }
}

export async function getOrderEvents(orderId: string): Promise<OrderEvent[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("order_events")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data as OrderEvent[];
  } catch {
    return [];
  }
}

export async function getOrderMessages(orderId: string): Promise<OrderMessage[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("order_messages")
      .select(`
        *,
        sender_profile:sender_id (full_name, role)
      `)
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data as unknown as OrderMessage[];
  } catch {
    return [];
  }
}

export async function getOrderFiles(orderId: string): Promise<OrderFile[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("order_files")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as OrderFile[];
  } catch {
    return [];
  }
}

export async function getOrderQuotes(orderId: string): Promise<Quote[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as Quote[];
  } catch {
    return [];
  }
}
