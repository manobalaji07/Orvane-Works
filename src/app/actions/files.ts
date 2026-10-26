"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/guards";
import { validateUploadFile, createDeliverableSignedUrl } from "@/lib/storage";

export interface FileActionResult {
  success: boolean;
  message?: string;
  url?: string;
}

/**
 * Upload an order file or deliverable to private Supabase storage
 */
export async function uploadOrderFileAction(
  formData: FormData
): Promise<FileActionResult> {
  const { user, profile } = await requireAuth();

  const orderId = formData.get("order_id") as string;
  const orderNumber = formData.get("order_number") as string;
  const isDeliverable = formData.get("is_deliverable") === "true";
  const file = formData.get("file") as File | null;

  if (!orderId || !file) {
    return { success: false, message: "Missing order ID or file payload." };
  }

  // Security check: Only Admins or Employees can upload to Final Deliverables
  if (isDeliverable && profile.role !== "admin" && profile.role !== "employee") {
    return {
      success: false,
      message: "Only studio staff and assigned specialists can upload final deliverables.",
    };
  }

  // Security validation: Validate size (<= 100MB), mime, and extension
  const validation = validateUploadFile(file.name, file.size, file.type);
  if (!validation.valid) {
    return { success: false, message: validation.error || "Invalid file format." };
  }

  const supabase = createAdminClient();

  try {
    // Generate safe storage path: <orderId>/<category>/<timestamp>-<sanitizedName>
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const category = isDeliverable ? "deliverables" : "references";
    const storagePath = `${orderId}/${category}/${Date.now()}_${sanitizedName}`;

    // Upload to private Supabase bucket 'order-deliverables'
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("order-deliverables")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("[Storage Upload Error]", uploadError);
      return { success: false, message: "Storage error: " + uploadError.message };
    }

    // Insert record into order_files table
    const { error: dbError } = await supabase.from("order_files").insert({
      order_id: orderId,
      uploader_id: user.id,
      file_name: file.name,
      file_size: file.size,
      file_url: storagePath,
      mime_type: file.type || "application/octet-stream",
      is_deliverable: isDeliverable,
    });

    if (dbError) {
      console.error("[Database File Record Error]", dbError);
      return { success: false, message: "Database error: " + dbError.message };
    }

    // Record timeline event
    await supabase.from("order_events").insert({
      order_id: orderId,
      actor_id: user.id,
      event_type: isDeliverable ? "DELIVERABLE_UPLOADED" : "FILE_UPLOADED",
      notes: `${isDeliverable ? "Final deliverable" : "Project asset"} uploaded: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`,
    });

    revalidatePath(`/dashboard/orders/${orderNumber}`);
    revalidatePath(`/admin/orders/${orderNumber}`);
    return { success: true, message: "File uploaded successfully." };
  } catch (err: any) {
    console.error("[Upload Exception]", err);
    return { success: false, message: err?.message || "Failed to upload file." };
  }
}

/**
 * Generate a temporary signed download URL for an order file (valid for 15 minutes)
 */
export async function getOrderFileDownloadUrlAction(
  fileId: string
): Promise<FileActionResult> {
  const { user, profile } = await requireAuth();
  const supabase = createAdminClient();

  try {
    const { data: file, error } = await supabase
      .from("order_files")
      .select("*, orders(client_id, preferred_employee_id)")
      .eq("id", fileId)
      .single();

    if (error || !file) {
      return { success: false, message: "File not found or access expired." };
    }

    // Access control: only admin, assigned employee, or the order owner can download
    const isOwner = file.orders?.client_id === user.id;
    const isAssigned = file.orders?.preferred_employee_id === user.id;
    const isAdmin = profile.role === "admin";

    if (!isOwner && !isAssigned && !isAdmin) {
      return { success: false, message: "Unauthorized: Access denied to this vault file." };
    }

    const signedUrl = await createDeliverableSignedUrl(file.file_url, 900);
    if (!signedUrl) {
      return { success: false, message: "Failed to generate signed download link." };
    }

    return { success: true, url: signedUrl };
  } catch (err: any) {
    return { success: false, message: err?.message || "Failed to get download URL." };
  }
}
