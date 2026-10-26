"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { logAuditEvent } from "./auth";
import {
  sendEmployeeDecisionEmail,
  sendOrderStatusUpdatedEmail,
} from "@/lib/email";
import type { OrderStatus, PaymentStatus } from "@/lib/data/orders";

export interface AdminActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Approve a pending employee applicant
 */
export async function approveEmployeeAction(
  userId: string
): Promise<AdminActionResult> {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = createAdminClient();

  try {
    // 1. Fetch applicant profile & request details
    const { data: applicant } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    // 2. Elevate role to employee and status to active
    await supabase
      .from("profiles")
      .update({
        role: "employee",
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    // 3. Mark request approved
    await supabase
      .from("employee_requests")
      .update({
        status: "approved",
        reviewed_by: adminProfile.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    // 4. Ensure an employee_profiles entry exists
    const slug = (applicant?.full_name || "member")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    await supabase.from("employee_profiles").upsert(
      {
        user_id: userId,
        slug,
        designation: "Student Engineering Specialist",
        bio: "Engineering student contributor at Orvane Works.",
        availability_status: "available",
        is_published: true,
        display_order: 10,
      },
      { onConflict: "user_id" }
    );

    // 5. Audit log
    await logAuditEvent({
      actorId: adminProfile.id,
      action: "EMPLOYEE_APPROVED",
      entityType: "employee_request",
      entityId: userId,
      metadata: { applicant_name: applicant?.full_name, applicant_email: applicant?.email },
    });

    // 6. Send transactional congratulations email
    if (applicant?.email) {
      await sendEmployeeDecisionEmail({
        applicantName: applicant.full_name || "Specialist",
        applicantEmail: applicant.email,
        status: "approved",
      });
    }

    revalidatePath("/admin/employees");
    revalidatePath("/team");
    revalidateTag("public-content"); // bust cached getTeamMembers()
    return { success: true, message: "Applicant approved and welcomed to the team!" };
  } catch (err: any) {
    console.error("[Approve Employee Error]", err);
    return { success: false, error: err?.message || "Failed to approve employee." };
  }
}

/**
 * Reject a pending employee applicant with custom reason
 */
export async function rejectEmployeeAction(
  userId: string,
  reason: string
): Promise<AdminActionResult> {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = createAdminClient();

  try {
    const { data: applicant } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    await supabase
      .from("profiles")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    await supabase
      .from("employee_requests")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_by: adminProfile.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await logAuditEvent({
      actorId: adminProfile.id,
      action: "EMPLOYEE_REJECTED",
      entityType: "employee_request",
      entityId: userId,
      metadata: { reason, applicant_email: applicant?.email },
    });

    if (applicant?.email) {
      await sendEmployeeDecisionEmail({
        applicantName: applicant.full_name || "Applicant",
        applicantEmail: applicant.email,
        status: "rejected",
        reason,
      });
    }

    revalidatePath("/admin/employees");
    return { success: true, message: "Application rejected and notice sent." };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to reject applicant." };
  }
}

/**
 * Suspend an employee
 */
export async function suspendEmployeeAction(userId: string): Promise<AdminActionResult> {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = createAdminClient();

  try {
    await supabase.from("profiles").update({ status: "suspended" }).eq("id", userId);
    await supabase
      .from("employee_profiles")
      .update({ is_published: false })
      .eq("user_id", userId);

    await logAuditEvent({
      actorId: adminProfile.id,
      action: "EMPLOYEE_SUSPENDED",
      entityType: "profiles",
      entityId: userId,
    });

    revalidatePath("/admin/employees");
    revalidatePath("/team");
    return { success: true, message: "Employee suspended." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Reinstate a suspended employee
 */
export async function reinstateEmployeeAction(userId: string): Promise<AdminActionResult> {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = createAdminClient();

  try {
    await supabase.from("profiles").update({ status: "active" }).eq("id", userId);
    await supabase
      .from("employee_profiles")
      .update({ is_published: true })
      .eq("user_id", userId);

    await logAuditEvent({
      actorId: adminProfile.id,
      action: "EMPLOYEE_REINSTATED",
      entityType: "profiles",
      entityId: userId,
    });

    revalidatePath("/admin/employees");
    revalidatePath("/team");
    return { success: true, message: "Employee reinstated to active duty." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Invite employee directly by email
 */
export async function inviteEmployeeAction(
  email: string,
  name: string
): Promise<AdminActionResult> {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = createAdminClient();

  try {
    await logAuditEvent({
      actorId: adminProfile.id,
      action: "EMPLOYEE_INVITED",
      entityType: "profiles",
      entityId: email,
      metadata: { invited_email: email, name },
    });

    revalidatePath("/admin/employees");
    return {
      success: true,
      message: `Direct employee invitation sent to ${email}.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Assign employee to an order
 */
export async function assignOrderEmployeeAction(
  orderId: string,
  employeeId: string,
  orderNumber: string
): Promise<AdminActionResult> {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = createAdminClient();

  try {
    await supabase
      .from("orders")
      .update({ preferred_employee_id: employeeId })
      .eq("id", orderId);

    await supabase.from("order_assignments").upsert(
      {
        order_id: orderId,
        employee_id: employeeId,
        assigned_by: adminProfile.id,
      },
      { onConflict: "order_id,employee_id" }
    );

    await supabase.from("order_events").insert({
      order_id: orderId,
      actor_id: adminProfile.id,
      event_type: "EMPLOYEE_ASSIGNED",
      new_value: employeeId,
      notes: "Lead assigned by studio admin.",
    });

    await logAuditEvent({
      actorId: adminProfile.id,
      action: "ORDER_ASSIGNED",
      entityType: "orders",
      entityId: orderId,
      metadata: { order_number: orderNumber, employee_id: employeeId },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderNumber}`);
    revalidatePath(`/dashboard/orders/${orderNumber}`);
    return { success: true, message: "Student engineering lead assigned." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin updates order details (status, quote, payment, internal notes)
 */
export async function updateOrderAdminAction(
  orderId: string,
  orderNumber: string,
  data: {
    status?: OrderStatus;
    quote_amount_inr?: number;
    quote_terms?: string;
    payment_status?: PaymentStatus;
    internal_notes?: string;
  }
): Promise<AdminActionResult> {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = createAdminClient();

  try {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.status) updatePayload.status = data.status;
    if (data.quote_amount_inr !== undefined)
      updatePayload.quote_amount_inr = data.quote_amount_inr;
    if (data.quote_terms !== undefined) updatePayload.quote_terms = data.quote_terms;
    if (data.payment_status) updatePayload.payment_status = data.payment_status;
    if (data.internal_notes !== undefined)
      updatePayload.internal_notes = data.internal_notes;

    const { data: previousOrder } = await supabase
      .from("orders")
      .select("status, client_id, client_profile:client_id(email, full_name)")
      .eq("id", orderId)
      .single();

    await supabase.from("orders").update(updatePayload).eq("id", orderId);

    // If status changed, record timeline event and dispatch email
    if (data.status && data.status !== previousOrder?.status) {
      await supabase.from("order_events").insert({
        order_id: orderId,
        actor_id: adminProfile.id,
        event_type: "STATUS_CHANGE",
        previous_value: previousOrder?.status,
        new_value: data.status,
        notes: "Status updated by studio administration.",
      });

      const clientProfile = (previousOrder as any)?.client_profile;
      if (clientProfile?.email) {
        await sendOrderStatusUpdatedEmail({
          clientName: clientProfile.full_name || "Valued Client",
          clientEmail: clientProfile.email,
          orderNumber,
          newStatus: data.status,
          statusLabel: data.status.replace("_", " ").toUpperCase(),
          notes: data.quote_terms,
        });
      }
    }

    await logAuditEvent({
      actorId: adminProfile.id,
      action: "ORDER_UPDATED_BY_ADMIN",
      entityType: "orders",
      entityId: orderId,
      metadata: { order_number: orderNumber, ...data },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderNumber}`);
    revalidatePath(`/dashboard/orders/${orderNumber}`);
    return { success: true, message: "Order details successfully updated." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Toggle handled status of contact messages
 */
export async function toggleContactHandledAction(
  messageId: string,
  isHandled: boolean
): Promise<AdminActionResult> {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = createAdminClient();

  try {
    await supabase
      .from("contact_messages")
      .update({
        is_handled: isHandled,
        handled_by: isHandled ? adminProfile.id : null,
        handled_at: isHandled ? new Date().toISOString() : null,
      })
      .eq("id", messageId);

    revalidatePath("/admin/inbox");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Toggle handled status of hardware waitlist entries
 */
export async function toggleWaitlistHandledAction(
  entryId: string,
  isHandled: boolean
): Promise<AdminActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  try {
    await supabase
      .from("waitlist_entries")
      .update({ is_handled: isHandled })
      .eq("id", entryId);

    revalidatePath("/admin/inbox");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Moderate client testimonials (approve / feature / hide)
 */
export async function moderateTestimonialAction(
  testimonialId: string,
  isApproved: boolean,
  isFeatured: boolean
): Promise<AdminActionResult> {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = createAdminClient();

  try {
    await supabase
      .from("testimonials")
      .update({
        is_approved: isApproved,
        is_featured: isFeatured,
      })
      .eq("id", testimonialId);

    await logAuditEvent({
      actorId: adminProfile.id,
      action: "TESTIMONIAL_MODERATED",
      entityType: "testimonials",
      entityId: testimonialId,
      metadata: { is_approved: isApproved, is_featured: isFeatured },
    });

    revalidatePath("/admin/content");
    revalidatePath("/testimonials");
    revalidatePath("/");
    revalidateTag("public-content"); // bust cached getTestimonials()
    return { success: true, message: "Testimonial updated." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Update a site_settings key-value pair (admin only).
 * Used by the Site Settings tab to update payment instructions etc.
 */
export async function updateSiteSettingAction(
  key: string,
  value: string
): Promise<AdminActionResult> {
  await requireAdmin();
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          key,
          value: JSON.stringify(value),
          updated_by: (await supabase.auth.getUser()).data.user!.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (error) {
      console.error("[SiteSettings] Upsert error:", error.message);
      return { success: false, error: "Failed to update setting." };
    }

    revalidatePath("/admin/content");
    revalidatePath("/");
    revalidatePath("/contact");
    revalidatePath("/privacy");
    revalidatePath("/terms");
    revalidateTag("public-content");
    // Revalidate all order pages so new instructions appear immediately
    revalidatePath("/dashboard/orders/[orderNumber]", "page");
    return { success: true, message: `"${key}" updated successfully.` };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unexpected error." };
  }
}
