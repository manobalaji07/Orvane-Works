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

  const { email, password } = parsed.data;
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

  const { email, password, fullName, phone } = parsed.data;
  const supabase = createClient();

  // Explicitly assign requested_role as 'client'
  const { data: authData, error: authError } = await supabase.auth.signUp({
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

  if (authError || !authData.user) {
    return {
      success: false,
      error: authError?.message || "Failed to create client account.",
    };
  }

  await logAuditEvent({
    actorId: authData.user.id,
    action: "CLIENT_SIGNUP",
    entityType: "profile",
    entityId: authData.user.id,
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

  const { email, password, fullName, phone, portfolioUrl, resumeUrl, skills, coverNote } =
    parsed.data;
  const supabase = createClient();

  // Create auth account with least-privilege 'pending_employee' intent
  const { data: authData, error: authError } = await supabase.auth.signUp({
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

  if (authError || !authData.user) {
    return {
      success: false,
      error: authError?.message || "Failed to submit team application.",
    };
  }

  const userId = authData.user.id;
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
 */
export async function signOutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}
