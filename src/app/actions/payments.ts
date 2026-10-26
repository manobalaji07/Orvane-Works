"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { recordPaymentSchema, voidPaymentSchema, editPaymentSchema } from "@/lib/validation/payments";
import { sendPaymentConfirmationEmail } from "@/lib/email";

export type PaymentActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

/**
 * Admin: Record a new manual payment against an order.
 * Validates input, inserts the record, auto-triggers the DB function that
 * updates orders.payment_status, sends a confirmation email to the client.
 */
export async function recordPaymentAction(
  prevState: PaymentActionResult | null,
  formData: FormData
): Promise<PaymentActionResult> {
  await requireAdmin();

  const raw = {
    order_id: formData.get("order_id") as string,
    order_number: formData.get("order_number") as string,
    amount_inr: Number(formData.get("amount_inr")),
    payment_type: formData.get("payment_type") as string,
    method: formData.get("method") as string,
    reference_utr: (formData.get("reference_utr") as string) || undefined,
    date_received: formData.get("date_received") as string,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = recordPaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted errors.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();

  try {
    // 1. Insert payment record
    const { error: insertError } = await supabase.from("order_payments").insert({
      order_id: parsed.data.order_id,
      amount_inr: parsed.data.amount_inr,
      payment_type: parsed.data.payment_type,
      method: parsed.data.method,
      reference_utr: parsed.data.reference_utr || null,
      date_received: parsed.data.date_received,
      notes: parsed.data.notes || null,
      // recorded_by is set from the current session via RLS context
      recorded_by: (await supabase.auth.getUser()).data.user!.id,
      provider: "manual",
    });

    if (insertError) {
      console.error("[Payments] Insert error:", insertError.message);
      return { success: false, error: "Failed to record payment. Please try again." };
    }

    // 2. Fetch client details to send confirmation email
    const { data: orderRow } = await supabase
      .from("orders")
      .select("client_id, order_number, profiles!orders_client_id_fkey(full_name, email)")
      .eq("id", parsed.data.order_id)
      .single();

    const clientProfile = (orderRow as any)?.profiles;
    if (clientProfile?.email) {
      await sendPaymentConfirmationEmail({
        clientName: clientProfile.full_name || "Valued Client",
        clientEmail: clientProfile.email,
        orderNumber: parsed.data.order_number,
        amountInr: parsed.data.amount_inr,
        paymentType: parsed.data.payment_type,
        method: parsed.data.method,
        dateReceived: parsed.data.date_received,
      });
    }

    // 3. Audit log
    await supabase.from("audit_log").insert({
      actor_id: (await supabase.auth.getUser()).data.user!.id,
      action: "PAYMENT_RECORDED",
      entity_type: "order_payments",
      entity_id: parsed.data.order_id,
      metadata: {
        order_number: parsed.data.order_number,
        amount_inr: parsed.data.amount_inr,
        method: parsed.data.method,
      },
    });
  } catch (err: any) {
    console.error("[Payments] Unexpected error:", err?.message);
    return { success: false, error: "An unexpected error occurred." };
  }

  revalidatePath(`/admin/orders/${raw.order_number}`);
  revalidatePath(`/dashboard/orders/${raw.order_number}`);
  return { success: true, message: "Payment recorded and client notified." };
}

/**
 * Admin: Void an existing payment (soft-delete).
 * Preserves the row for audit; the DB trigger re-calculates payment_status.
 */
export async function voidPaymentAction(
  prevState: PaymentActionResult | null,
  formData: FormData
): Promise<PaymentActionResult> {
  await requireAdmin();

  const raw = {
    payment_id: formData.get("payment_id") as string,
    order_number: formData.get("order_number") as string,
    void_reason: formData.get("void_reason") as string,
  };

  const parsed = voidPaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid input.",
    };
  }

  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("order_payments")
      .update({
        voided_at: new Date().toISOString(),
        void_reason: parsed.data.void_reason,
      })
      .eq("id", parsed.data.payment_id);

    if (error) {
      console.error("[Payments] Void error:", error.message);
      return { success: false, error: "Failed to void payment." };
    }

    await supabase.from("audit_log").insert({
      actor_id: (await supabase.auth.getUser()).data.user!.id,
      action: "PAYMENT_VOIDED",
      entity_type: "order_payments",
      entity_id: parsed.data.payment_id,
      metadata: {
        void_reason: parsed.data.void_reason,
      },
    });
  } catch (err: any) {
    console.error("[Payments] Void unexpected error:", err?.message);
    return { success: false, error: "An unexpected error occurred." };
  }

  revalidatePath(`/admin/orders/${raw.order_number}`);
  revalidatePath(`/dashboard/orders/${raw.order_number}`);
  return { success: true, message: "Payment voided and balance recalculated." };
}

/**
 * Admin: Edit an existing payment record.
 * Updates payment details and logs changes to audit log.
 */
export async function editPaymentAction(
  prevState: PaymentActionResult | null,
  formData: FormData
): Promise<PaymentActionResult> {
  await requireAdmin();

  const raw = {
    payment_id: formData.get("payment_id") as string,
    order_id: formData.get("order_id") as string,
    order_number: formData.get("order_number") as string,
    amount_inr: Number(formData.get("amount_inr")),
    payment_type: formData.get("payment_type") as string,
    method: formData.get("method") as string,
    reference_utr: (formData.get("reference_utr") as string) || undefined,
    date_received: formData.get("date_received") as string,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = editPaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted errors.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();

  try {
    const { error: updateError } = await supabase
      .from("order_payments")
      .update({
        amount_inr: parsed.data.amount_inr,
        payment_type: parsed.data.payment_type,
        method: parsed.data.method,
        reference_utr: parsed.data.reference_utr || null,
        date_received: parsed.data.date_received,
        notes: parsed.data.notes || null,
      })
      .eq("id", parsed.data.payment_id);

    if (updateError) {
      console.error("[Payments] Edit error:", updateError.message);
      return { success: false, error: "Failed to update payment." };
    }

    const { data: authData } = await supabase.auth.getUser();
    await supabase.from("audit_log").insert({
      actor_id: authData.user?.id || parsed.data.order_id,
      action: "PAYMENT_EDITED",
      entity_type: "order_payments",
      entity_id: parsed.data.payment_id,
      metadata: {
        order_number: parsed.data.order_number,
        amount_inr: parsed.data.amount_inr,
        method: parsed.data.method,
        payment_type: parsed.data.payment_type,
      },
    });
  } catch (err: any) {
    console.error("[Payments] Edit unexpected error:", err?.message);
    return { success: false, error: "An unexpected error occurred." };
  }

  revalidatePath(`/admin/orders/${raw.order_number}`);
  revalidatePath(`/dashboard/orders/${raw.order_number}`);
  return { success: true, message: "Payment updated successfully." };
}
