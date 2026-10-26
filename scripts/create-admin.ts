/**
 * Orvane Works - First Administrator Bootstrap Script
 *
 * Reads ADMIN_EMAIL from the environment, creates or promotes that user
 * with the service-role key and triggers a password-setup email.
 * No password is ever stored or printed.
 *
 * Usage:
 *   ADMIN_EMAIL="admin@yourdomain.com" npx vite-node scripts/create-admin.ts
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|['"]$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

const adminEmailRaw = process.env.ADMIN_EMAIL?.trim();

if (!adminEmailRaw) {
  console.error("\x1b[31m[Error]\x1b[0m ADMIN_EMAIL environment variable is required.");
  console.error("Usage: ADMIN_EMAIL=\"admin@yourdomain.com\" npm run admin:create\n");
  process.exit(1);
}

// Basic email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(adminEmailRaw)) {
  console.error(`\x1b[31m[Error]\x1b[0m Invalid email address format: "${adminEmailRaw}"\n`);
  process.exit(1);
}

const adminEmail: string = adminEmailRaw;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("\x1b[31m[Error]\x1b[0m Missing Supabase credentials.");
  console.error("Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or your environment.\n");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log(`\x1b[36m[Admin Setup]\x1b[0m Initializing administrator bootstrap for: ${adminEmail}`);

  // 1. Check if user already exists in Auth
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("\x1b[31m[Error]\x1b[0m Failed to list users:", listError.message);
    process.exit(1);
  }

  let user = usersData.users.find(
    (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
  );

  if (!user) {
    console.log(`\x1b[36m[Admin Setup]\x1b[0m Creating new auth account...`);
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      email_confirm: true,
      user_metadata: {
        full_name: "Administrator",
      },
    });

    if (createError || !created.user) {
      console.error("\x1b[31m[Error]\x1b[0m Failed to create user:", createError?.message);
      process.exit(1);
    }
    user = created.user;
    console.log(`\x1b[32m[Admin Setup]\x1b[0m Auth account created successfully.`);
  } else {
    console.log(`\x1b[36m[Admin Setup]\x1b[0m Found existing auth account.`);
  }

  // 2. Promote or upsert profile in public.profiles table
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: adminEmail,
        full_name: "Administrator",
        role: "admin",
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (profileError) {
    console.error("\x1b[31m[Error]\x1b[0m Failed to elevate profile to admin:", profileError.message);
    process.exit(1);
  }

  console.log(`\x1b[32m[Admin Setup]\x1b[0m User role elevated to 'admin' (active).`);

  // 3. Send password-setup / recovery email
  console.log(`\x1b[36m[Admin Setup]\x1b[0m Sending password setup email to ${adminEmail}...`);
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(adminEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
  });

  if (resetError) {
    console.warn("\x1b[33m[Warning]\x1b[0m Could not dispatch reset email via Supabase Auth:", resetError.message);
    console.log("You can also generate an invite link in Supabase Dashboard -> Authentication.");
  } else {
    console.log(`\x1b[32m[Success]\x1b[0m Password-setup email dispatched to: ${adminEmail}`);
  }

  console.log(`\x1b[32m[Complete]\x1b[0m Admin created and elevated without storing or exposing credentials.`);
}

run().catch((err) => {
  console.error("\x1b[31m[Fatal Error]\x1b[0m", err);
  process.exit(1);
});
