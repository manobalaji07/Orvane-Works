import { createClient } from "@/lib/supabase/server";
import { SITE_CONFIG } from "@/lib/constants/site";

export interface PublicSiteSettings {
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  address: string;
  socials: {
    instagram: string;
    linkedin: string;
    youtube: string;
    github: string;
  };
}

/**
 * Fetch all public site settings with fallback to SITE_CONFIG defaults
 */
export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("site_settings").select("key, value");

    const settingsMap: Record<string, string> = {};
    if (data) {
      for (const item of data) {
        settingsMap[item.key] =
          typeof item.value === "string" ? item.value : String(item.value);
      }
    }

    return {
      name: settingsMap.site_name || SITE_CONFIG.name,
      email: settingsMap.contact_email || SITE_CONFIG.email,
      phone: settingsMap.contact_phone || SITE_CONFIG.phone,
      whatsappNumber: settingsMap.whatsapp_number || SITE_CONFIG.whatsappNumber,
      whatsappDefaultMessage:
        settingsMap.whatsapp_message || SITE_CONFIG.whatsappDefaultMessage,
      address: settingsMap.address_line || SITE_CONFIG.address,
      socials: {
        instagram:
          settingsMap.instagram_url !== undefined
            ? settingsMap.instagram_url
            : SITE_CONFIG.socials.instagram,
        linkedin:
          settingsMap.linkedin_url !== undefined
            ? settingsMap.linkedin_url
            : SITE_CONFIG.socials.linkedin,
        youtube:
          settingsMap.youtube_url !== undefined
            ? settingsMap.youtube_url
            : SITE_CONFIG.socials.youtube,
        github:
          settingsMap.github_url !== undefined
            ? settingsMap.github_url
            : SITE_CONFIG.socials.github,
      },
    };
  } catch {
    return {
      name: SITE_CONFIG.name,
      email: SITE_CONFIG.email,
      phone: SITE_CONFIG.phone,
      whatsappNumber: SITE_CONFIG.whatsappNumber,
      whatsappDefaultMessage: SITE_CONFIG.whatsappDefaultMessage,
      address: SITE_CONFIG.address,
      socials: { ...SITE_CONFIG.socials },
    };
  }
}

/**
 * Fetch a single site_settings value by key.
 * Returns null if the key doesn't exist or on any error.
 * The value column is JSONB; for plain text keys the JSON will be a string.
 */
export async function getSiteSetting(key: string): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error || !data) return null;
    // value is JSONB — if stored as a JSON string, unwrap it
    if (typeof data.value === "string") return data.value;
    // If it's already a parsed primitive, cast to string
    return String(data.value);
  } catch {
    return null;
  }
}

/**
 * Admin: Upsert a site_settings key-value pair.
 * Value is stored as JSONB; plain strings are JSON-encoded.
 */
export async function upsertSiteSetting(key: string, value: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key, value: JSON.stringify(value), updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
    return !error;
  } catch {
    return false;
  }
}
