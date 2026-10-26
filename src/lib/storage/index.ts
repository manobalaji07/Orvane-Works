/**
 * Server-Side Storage Validation and Access Controls
 * Manages public assets and time-limited signed URLs for private deliverables.
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import path from "path";

export const FORBIDDEN_EXTENSIONS = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".msi",
  ".com",
  ".scr",
  ".vbs",
  ".ps1",
  ".jar",
  ".bin",
  ".dll",
  ".wsf",
  ".cpl",
  ".pif",
]);

export const FORBIDDEN_MIME_TYPES = new Set([
  "application/x-msdownload",
  "application/x-sh",
  "application/x-bat",
  "application/x-msdos-program",
  "application/x-executable",
  "application/octet-stream", // Only if extension is unknown or forbidden
]);

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file on server before accepting upload
 */
export function validateUploadFile(
  fileName: string,
  fileSize: number,
  mimeType: string
): FileValidationResult {
  // 1. Check File Size
  if (fileSize <= 0) {
    return { valid: false, error: "File cannot be empty." };
  }
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "File exceeds maximum size limit of 100MB." };
  }

  // 2. Check File Extension
  const ext = path.extname(fileName).toLowerCase();
  if (!ext || FORBIDDEN_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Executable and dangerous file extensions (${ext || "none"}) are blocked for security.`,
    };
  }

  // 3. Check MIME Type
  if (FORBIDDEN_MIME_TYPES.has(mimeType.toLowerCase()) && FORBIDDEN_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: "Executable binaries cannot be uploaded.",
    };
  }

  return { valid: true };
}

/**
 * Generate a short-lived signed URL for a private order deliverable (defaults to 15 minutes)
 */
export async function createDeliverableSignedUrl(
  filePath: string,
  expiresInSeconds: number = 900
): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("order-deliverables")
      .createSignedUrl(filePath, expiresInSeconds);

    if (error || !data) {
      console.error("[Storage Signed URL Error]", error?.message);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("[Storage Exception]", err);
    return null;
  }
}

/**
 * Get public URL for public avatars or portfolio media
 */
export function getPublicAssetUrl(filePath: string): string {
  const supabase = createAdminClient();
  const { data } = supabase.storage.from("public-assets").getPublicUrl(filePath);
  return data.publicUrl;
}
