/**
 * Application Startup Environment Validator
 * Validates presence of critical environment variables and prints actionable warnings.
 */

const REQUIRED_SERVER_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const RECOMMENDED_VARS = [
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "COMPANY_INBOX",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "NEXT_PUBLIC_APP_URL",
] as const;

let hasChecked = false;

export function validateEnvironment(): { valid: boolean; missing: string[]; warnings: string[] } {
  if (hasChecked) {
    return { valid: true, missing: [], warnings: [] };
  }
  hasChecked = true;

  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of REQUIRED_SERVER_VARS) {
    const val = process.env[envVar];
    if (!val || val.trim() === "" || val.includes("your-project") || val.includes("placeholder")) {
      missing.push(envVar);
    }
  }

  for (const envVar of RECOMMENDED_VARS) {
    const val = process.env[envVar];
    if (!val || val.trim() === "" || val.startsWith("0x4AAAAAAyour_") || val.includes("your_")) {
      warnings.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.warn(
      `\x1b[33m[Environment Check]\x1b[0m Missing or unconfigured required variables:\n${missing
        .map((m) => `  - ${m}`)
        .join("\n")}\nRefer to .env.example to configure them in .env.local.`
    );
  }

  if (warnings.length > 0 && process.env.NODE_ENV === "production") {
    console.warn(
      `\x1b[33m[Environment Warning]\x1b[0m Optional production variables using defaults or unconfigured:\n${warnings
        .map((w) => `  - ${w}`)
        .join("\n")}`
    );
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

// Run initial check on import
validateEnvironment();
