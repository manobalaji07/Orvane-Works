/**
 * Data-Access Layer: Payments
 */

import { createClient } from "@/lib/supabase/server";
import type { OrderPayment } from "@/types/database";

export async function getPaymentsForOrder(orderId: string): Promise<OrderPayment[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("order_payments")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as OrderPayment[];
  } catch {
    return [];
  }
}

export async function getPaymentsForClient(clientId: string): Promise<OrderPayment[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("order_payments")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as OrderPayment[];
  } catch {
    return [];
  }
}

export async function getAllPaymentsAdmin(): Promise<OrderPayment[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("order_payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as OrderPayment[];
  } catch {
    return [];
  }
}
