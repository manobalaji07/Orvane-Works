"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAuditEvent } from "./auth";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import {
  sendContactConfirmationEmail,
  sendContactAdminNotificationEmail,
} from "@/lib/email";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please provide a valid email address."),
  phone: z.string().optional().or(z.literal("")),
  serviceId: z.string().optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters."),
  turnstileToken: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

const waitlistSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please provide a valid email address."),
  companyOrProject: z.string().optional().or(z.literal("")),
  interestDetails: z
    .string()
    .min(10, "Please describe your IoT interest in at least 10 characters."),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

export async function submitContactMessageAction(input: ContactInput) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
    };
  }

  const { name, email, phone, serviceId, message, turnstileToken } = parsed.data;

  // Cloudflare Turnstile bot verification
  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    return {
      success: false,
      error: "Spam verification failed. Please refresh the page and try again.",
    };
  }

  try {
    const supabase = createAdminClient();

    let resolvedServiceId: string | null = null;
    let formattedMessage = message;

    if (serviceId && serviceId.trim()) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceId);
      if (isUuid) {
        const { data: svc } = await supabase.from("services").select("id").eq("id", serviceId).maybeSingle();
        if (svc) {
          resolvedServiceId = svc.id;
        }
      } else {
        const { data: svc } = await supabase.from("services").select("id").eq("slug", serviceId).maybeSingle();
        if (svc) {
          resolvedServiceId = svc.id;
        } else {
          // If slug does not match a DB service row, record the requested service clearly in the message body
          const serviceLabels: Record<string, string> = {
            "web-development": "Web Design & Development",
            "video-editing": "Video Editing & Reels",
            "content-creation": "Content & Brand Assets",
            "hardware-iot": "Hardware & IoT Projects",
            "other": "Other / Custom Scope",
          };
          const serviceLabel = serviceLabels[serviceId] || serviceId;
          formattedMessage = `[Requested Service: ${serviceLabel}]\n\n${message}`;
        }
      }
    }

    const { data, error } = await supabase.from("contact_messages").insert({
      name,
      email,
      phone: phone || null,
      service_id: resolvedServiceId,
      message: formattedMessage,
      ip_hash: "ip_anonymized",
      is_handled: false,
    }).select().single();

    if (error) {
      console.error("[Contact Message DB Error]", error);
      return { success: false, error: "Failed to store message. Please try again." };
    }

    // Send notification to company inbox (resilient to email API errors)
    try {
      await sendContactAdminNotificationEmail({
        name,
        email,
        phone: phone || undefined,
        service: serviceId || undefined,
        message,
      });
    } catch (emailErr) {
      console.warn("[Contact Admin Email Warning]", emailErr);
    }

    // Send confirmation to the visitor
    try {
      await sendContactConfirmationEmail({
        name,
        email,
      });
    } catch (confErr) {
      console.warn("[Contact Confirmation Email Warning]", confErr);
    }

    await logAuditEvent({
      action: "CONTACT_MESSAGE_RECEIVED",
      entityType: "contact_message",
      entityId: data?.id || "unknown",
      metadata: { name, email },
    });

    return {
      success: true,
      message:
        "Thank you! Your message has been received. Our Madurai student lead will reply within 24 hours.",
    };
  } catch (err) {
    console.error("[Contact Action Error]", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function joinWaitlistAction(input: WaitlistInput) {
  const parsed = waitlistSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
    };
  }

  const { fullName, email, companyOrProject, interestDetails } = parsed.data;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("waitlist_entries").insert({
      full_name: fullName,
      email,
      company_or_project: companyOrProject || null,
      interest_details: interestDetails,
      is_handled: false,
    }).select().single();

    if (error) {
      console.error("[Waitlist DB Error]", error);
      return { success: false, error: "Failed to join waitlist. Please try again." };
    }

    await logAuditEvent({
      action: "WAITLIST_JOINED",
      entityType: "waitlist_entry",
      entityId: data?.id || "unknown",
      metadata: { email, fullName },
    });

    return {
      success: true,
      message:
        "You're on the waitlist! We will notify you as soon as our Hardware & IoT client cohort opens.",
    };
  } catch (err) {
    console.error("[Waitlist Action Error]", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
