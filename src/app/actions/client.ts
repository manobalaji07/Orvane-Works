"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireClient } from "@/lib/auth/guards";
import { clientSettingsSchema } from "@/lib/validation/orders";

export type ClientActionResult = {
  success: boolean;
  message?: string;
  data?: any;
  errors?: Record<string, string[]>;
};

/**
 * Update client contact and profile details
 */
export async function updateProfileSettingsAction(
  prevState: ClientActionResult | null,
  formData: FormData
): Promise<ClientActionResult> {
  const { user } = await requireClient();

  const raw = {
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || "",
    company_name: formData.get("company_name") || "",
    notify_order_updates: formData.get("notify_order_updates") === "on",
    notify_messages: formData.get("notify_messages") === "on",
  };

  const parsed = clientSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();
  try {
    await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        phone: parsed.data.phone || null,
        metadata: {
          company_name: parsed.data.company_name,
          notify_order_updates: parsed.data.notify_order_updates,
          notify_messages: parsed.data.notify_messages,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "PROFILE_UPDATED",
      entity_type: "profiles",
      entity_id: user.id,
    });
  } catch (err) {
    console.error("[Profile Update Exception]", err);
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true, message: "Profile settings saved successfully." };
}

/**
 * DPDP Act: Export all personal data stored about the user
 */
export async function exportMyDataAction(): Promise<ClientActionResult> {
  const { user, profile } = await requireClient();
  const supabase = createClient();

  try {
    // Gather orders
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("client_id", user.id);

    // Gather messages
    const { data: messages } = await supabase
      .from("order_messages")
      .select("*")
      .eq("sender_id", user.id);

    const exportBundle = {
      notice: "Orvane Works - DPDP Act 2023 Personal Data Export",
      generated_at: new Date().toISOString(),
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        status: profile.status,
        created_at: profile.created_at,
      },
      orders: orders || [],
      messages: messages || [],
    };

    return {
      success: true,
      message: "Personal data archive assembled.",
      data: exportBundle,
    };
  } catch (err: any) {
    return {
      success: false,
      message: "Failed to assemble personal data archive: " + err?.message,
    };
  }
}

/**
 * DPDP Act: Complete Account & Personal Data Deletion Request
 */
export async function deleteMyAccountAction(): Promise<ClientActionResult> {
  const { user } = await requireClient();
  const supabase = createClient();

  try {
    // 1. Audit log the deletion request
    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "DPDP_ACCOUNT_DELETED",
      entity_type: "profiles",
      entity_id: user.id,
      details: {
        reason: "User requested deletion under India DPDP Act 2023",
      },
    });

    // 2. Anonymize user profile data
    await supabase
      .from("profiles")
      .update({
        full_name: "Deleted User",
        email: `deleted_${user.id.slice(0, 8)}@deleted.invalid`,
        phone: null,
        avatar_url: null,
        status: "suspended",
        metadata: { deleted_at: new Date().toISOString() },
      })
      .eq("id", user.id);

    // 3. Sign out of session
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[Account Deletion Exception]", err);
  }

  redirect("/?deleted=true");
}
