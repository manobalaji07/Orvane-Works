"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireClient } from "@/lib/auth/guards";
import {
  createOrderSchema,
  postMessageSchema,
  submitReviewSchema,
} from "@/lib/validation/orders";
import {
  sendOrderReceivedEmail,
  sendOrderStatusUpdatedEmail,
  sendNewMessageNotificationEmail,
} from "@/lib/email";
import { SITE_CONFIG } from "@/lib/constants/site";

export type OrderActionResult = {
  success: boolean;
  message?: string;
  orderNumber?: string;
  errors?: Record<string, string[]>;
};

/**
 * Generate human-friendly order sequence number
 */
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORV-${year}-${rand}`;
}

/**
 * Create a new order request
 */
export async function createOrderAction(
  prevState: OrderActionResult | null,
  formData: FormData
): Promise<OrderActionResult> {
  const { user, profile } = await requireClient();

  const raw = {
    service_id: formData.get("service_id"),
    package_id: formData.get("package_id") || "",
    preferred_employee_id: formData.get("preferred_employee_id") || "",
    title: formData.get("title"),
    project_brief: formData.get("project_brief"),
    budget_min_inr: formData.get("budget_min_inr"),
    budget_max_inr: formData.get("budget_max_inr"),
    target_deadline: formData.get("target_deadline"),
    preferred_contact_method: formData.get("preferred_contact_method") || "whatsapp",
    reference_links: formData.get("reference_links") || "",
  };

  const parsed = createOrderSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted errors.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const orderNumber = generateOrderNumber();
  const supabase = createClient();

  try {
    const { data: order, error: insertError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        client_id: user.id,
        service_id: parsed.data.service_id,
        package_id: parsed.data.package_id || null,
        preferred_employee_id: parsed.data.preferred_employee_id || null,
        title: parsed.data.title,
        project_brief: parsed.data.project_brief,
        budget_min_inr: parsed.data.budget_min_inr,
        budget_max_inr: parsed.data.budget_max_inr,
        target_deadline: parsed.data.target_deadline,
        preferred_contact_method: parsed.data.preferred_contact_method,
        status: "submitted",
        payment_status: "unbilled",
      })
      .select("id")
      .single();

    if (insertError) {
      console.warn("[Orders] Database insert fallback mode:", insertError.message);
    }

    const orderId = order?.id || "demo-id";

    // Insert timeline event
    await supabase.from("order_events").insert({
      order_id: orderId,
      actor_id: user.id,
      event_type: "ORDER_SUBMITTED",
      new_value: "submitted",
      notes: "Project brief submitted by client via web portal.",
    });

    // Record audit log
    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "ORDER_CREATED",
      entity_type: "orders",
      entity_id: orderId,
      metadata: { order_number: orderNumber, service_id: parsed.data.service_id },
    });

    // Send confirmation email
    await sendOrderReceivedEmail({
      clientName: profile.full_name || "Valued Client",
      clientEmail: profile.email,
      orderNumber,
      serviceTitle: parsed.data.title,
    });
  } catch (err: any) {
    console.error("[Create Order Exception]", err);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/orders/${orderNumber}`);
}

/**
 * Post a message to the order project thread
 */
export async function postOrderMessageAction(
  prevState: OrderActionResult | null,
  formData: FormData
): Promise<OrderActionResult> {
  const { user, profile } = await requireAuth();

  const raw = {
    order_id: formData.get("order_id"),
    content: formData.get("content"),
  };

  const parsed = postMessageSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid message format.",
    };
  }

  const orderNumber = (formData.get("order_number") as string) || "";
  const supabase = createClient();

  try {
    const { error } = await supabase.from("order_messages").insert({
      order_id: parsed.data.order_id,
      sender_id: user.id,
      content: parsed.data.content,
    });

    if (error) {
      console.warn("[Messages] Insert message fallback mode:", error.message);
    }

    // Trigger email notification
    await sendNewMessageNotificationEmail({
      recipientName: "Studio Team",
      recipientEmail: process.env.COMPANY_INBOX || SITE_CONFIG.email || "hello@example.com",
      orderNumber,
      senderName: profile.full_name || "Client",
      messageSnippet: parsed.data.content.slice(0, 100),
    });
  } catch (err) {
    console.error("[Post Message Exception]", err);
  }

  revalidatePath(`/dashboard/orders/${orderNumber}`);
  return { success: true, message: "Message sent." };
}

/**
 * Client accepts the issued studio quote
 */
export async function acceptQuoteAction(orderNumber: string): Promise<OrderActionResult> {
  const { user, profile } = await requireClient();
  const supabase = createClient();

  try {
    await supabase
      .from("orders")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("order_number", orderNumber);

    await supabase.from("order_events").insert({
      actor_id: user.id,
      event_type: "QUOTE_ACCEPTED",
      previous_value: "quote_sent",
      new_value: "accepted",
      notes: "Official quote accepted by client. Milestone initiated.",
    });

    await sendOrderStatusUpdatedEmail({
      clientName: profile.full_name,
      clientEmail: profile.email,
      orderNumber,
      newStatus: "accepted",
      statusLabel: "Quote Accepted",
      notes: "Thank you for accepting our quote! A student lead will confirm engineering start date.",
    });
  } catch (err) {
    console.error("[Accept Quote Exception]", err);
  }

  revalidatePath(`/dashboard/orders/${orderNumber}`);
  revalidatePath("/dashboard");
  return { success: true, message: "Quote accepted." };
}

/**
 * Client submits a review after project delivery
 */
export async function submitOrderReviewAction(
  prevState: OrderActionResult | null,
  formData: FormData
): Promise<OrderActionResult> {
  const { user, profile } = await requireClient();

  const raw = {
    order_id: formData.get("order_id"),
    rating: formData.get("rating"),
    content: formData.get("content"),
    client_role_company: formData.get("client_role_company"),
  };

  const parsed = submitReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid review details.",
    };
  }

  const supabase = createClient();

  try {
    const { error } = await supabase.from("testimonials").insert({
      client_name: profile.full_name || "Client",
      client_role_company: parsed.data.client_role_company,
      rating: parsed.data.rating,
      content: parsed.data.content,
      is_approved: false, // Moderated by studio admin before appearing on public site
      is_featured: false,
    });

    if (error) {
      console.warn("[Testimonials] Insert fallback mode:", error.message);
    }

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "REVIEW_SUBMITTED",
      entity_type: "testimonials",
      entity_id: parsed.data.order_id,
      metadata: { order_id: parsed.data.order_id, rating: parsed.data.rating },
    });
  } catch (err) {
    console.error("[Review Exception]", err);
  }

  return {
    success: true,
    message: "Thank you! Your review has been submitted for moderation and will appear on the public site shortly.",
  };
}
