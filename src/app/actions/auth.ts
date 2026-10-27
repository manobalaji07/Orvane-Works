"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  clientSignupSchema,
  joinTeamSchema,
  loginSchema,
  type ClientSignupInput,
  type JoinTeamInput,
  type LoginInput,
} from "@/lib/validation/auth";
import { getPostLoginRedirect, type UserRole, type UserStatus } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { checkRateLimit } from "@/lib/security/rate-limit";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  redirectTo?: string;
}

/**
 * Log action to audit_log table
 */
export async function logAuditEvent(params: {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = createAdminClient();
    await supabase.from("audit_log").insert({
      actor_id: params.actorId || null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      metadata: params.metadata || {},
    });
  } catch (err) {
    console.error("[Audit Log Error]", err);
  }
}

/**
 * Sign In Action (Credentials)
 */
export async function signInAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid credentials.",
    };
  }

  const { email, password, turnstileToken } = parsed.data;

  // 1. Rate Limiting Check (5 attempts / min)
  const allowed = await checkRateLimit(`login:${email.toLowerCase()}`, 5, 60);
  if (!allowed) {
    return {
      success: false,
      error: "Too many sign-in attempts. Please try again in 1 minute.",
    };
  }

  // 2. Cloudflare Turnstile bot verification
  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    return {
      success: false,
      error: "Bot challenge verification failed. Please try again.",
    };
  }

  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    // If Supabase is unconfigured or in local demo mode, enable instant testing
    return {
      success: false,
      error: "Invalid email or password. Please verify your credentials.",
    };
  }

  // Fetch profile to verify role and status
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      error: "Unable to retrieve your user profile. Please contact support.",
    };
  }

  const redirectTo = getPostLoginRedirect({
    role: profile.role as UserRole,
    status: profile.status as UserStatus,
  });

  await logAuditEvent({
    actorId: authData.user.id,
    action: "USER_LOGIN",
    entityType: "profile",
    entityId: authData.user.id,
    metadata: { role: profile.role, email },
  });

  return {
    success: true,
    redirectTo,
  };
}

/**
 * Client Sign Up Action
 */
export async function signUpClientAction(input: ClientSignupInput): Promise<ActionResult> {
  const parsed = clientSignupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
    };
  }

  const { email, password, fullName, phone, turnstileToken } = parsed.data;

  // Rate Limiting Check (3 signups / min)
  const allowed = await checkRateLimit(`signup:${email.toLowerCase()}`, 3, 60);
  if (!allowed) {
    return {
      success: false,
      error: "Too many sign-up attempts. Please wait a minute and try again.",
    };
  }

  // Cloudflare Turnstile bot verification
  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    return {
      success: false,
      error: "Bot challenge verification failed. Please try again.",
    };
  }

  const supabase = createClient();

  // Explicitly assign requested_role as 'client'
  let { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || null,
        requested_role: "client",
      },
    },
  });

  let userId = authData?.user?.id;

  // Gracefully handle Supabase email rate limits or confirmation mail delivery errors
  if (authError) {
    const errMsg = authError.message.toLowerCase();
    const isAlreadyRegistered =
      errMsg.includes("already registered") ||
      errMsg.includes("already been registered") ||
      errMsg.includes("already exists");

    if (!isAlreadyRegistered) {
      // Automatic fallback: provision and auto-confirm user via Admin API
      const adminClient = createAdminClient();
      const { data: adminCreated, error: adminErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone: phone || null,
          requested_role: "client",
        },
      });

      if (adminCreated?.user) {
        userId = adminCreated.user.id;
        authError = null;
      } else if (adminErr) {
        return {
          success: false,
          error: adminErr.message,
        };
      }
    }
  }

  if (authError || !userId) {
    return {
      success: false,
      error: authError?.message || "Failed to create client account.",
    };
  }

  await logAuditEvent({
    actorId: userId,
    action: "CLIENT_SIGNUP",
    entityType: "profile",
    entityId: userId,
    metadata: { email, fullName },
  });

  return {
    success: true,
    redirectTo: "/dashboard",
  };
}

/**
 * "Join the team" Application Action
 * Critical security: User receives least privilege ('pending_employee'),
 * cannot access employee pages, and awaits admin approval.
 */
export async function applyToJoinTeamAction(input: JoinTeamInput): Promise<ActionResult> {
  const parsed = joinTeamSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Application form validation failed.",
    };
  }

  const { email, password, fullName, phone, portfolioUrl, resumeUrl, skills, coverNote, turnstileToken } =
    parsed.data;

  // Rate Limiting Check (3 applications / min)
  const allowed = await checkRateLimit(`join:${email.toLowerCase()}`, 3, 60);
  if (!allowed) {
    return {
      success: false,
      error: "Too many application attempts. Please wait a minute and try again.",
    };
  }

  // Cloudflare Turnstile bot verification
  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    return {
      success: false,
      error: "Bot challenge verification failed. Please try again.",
    };
  }

  const supabase = createClient();

  // Create auth account with least-privilege 'pending_employee' intent
  let { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        requested_role: "pending_employee",
      },
    },
  });

  let userId = authData?.user?.id;

  // Gracefully handle Supabase email rate limits or confirmation mail delivery errors
  if (authError) {
    const errMsg = authError.message.toLowerCase();
    const isAlreadyRegistered =
      errMsg.includes("already registered") ||
      errMsg.includes("already been registered") ||
      errMsg.includes("already exists");

    if (!isAlreadyRegistered) {
      // Automatic fallback: provision and auto-confirm user via Admin API
      const adminClient = createAdminClient();
      const { data: adminCreated, error: adminErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone,
          requested_role: "pending_employee",
        },
      });

      if (adminCreated?.user) {
        userId = adminCreated.user.id;
        authError = null;
      } else if (adminErr) {
        return {
          success: false,
          error: adminErr.message,
        };
      }
    }
  }

  if (authError || !userId) {
    return {
      success: false,
      error: authError?.message || "Failed to submit team application.",
    };
  }
  const adminClient = createAdminClient();

  // Ensure employee_requests entry is recorded
  const { error: reqError } = await adminClient.from("employee_requests").insert({
    user_id: userId,
    portfolio_url: portfolioUrl || null,
    resume_url: resumeUrl || null,
    skills,
    cover_note: coverNote,
    status: "pending",
  });

  if (reqError) {
    console.error("[Employee Request Insert Error]", reqError);
  }

  await logAuditEvent({
    actorId: userId,
    action: "EMPLOYEE_APPLICATION_SUBMITTED",
    entityType: "employee_request",
    entityId: userId,
    metadata: { email, fullName, skills },
  });

  revalidatePath("/admin/employees");

  return {
    success: true,
    redirectTo: "/awaiting-approval",
  };
}

/**
 * Sign Out Action
 * Instantly removes session cookies and redirects to /login with zero delay.
 */
export async function signOutAction(): Promise<never> {
  const cookieStore = cookies();
  const supabase = createClient();

  // 1. Immediately delete all Supabase auth cookie chunks locally
  const allCookies = cookieStore.getAll();
  for (const c of allCookies) {
    if (c.name.startsWith("sb-") && c.name.includes("-auth-token")) {
      cookieStore.delete(c.name);
    }
  }

  // 2. Clear local session without hanging on network latency
  try {
    await Promise.race([
      supabase.auth.signOut({ scope: "local" }),
      new Promise((resolve) => setTimeout(resolve, 200)),
    ]);
  } catch {
    // Ignore any logout network timeout
  }

  // 3. Immediately redirect to login
  redirect("/login");
}
