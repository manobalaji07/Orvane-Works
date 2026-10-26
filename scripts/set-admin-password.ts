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

const adminEmail = (process.env.ADMIN_EMAIL || "orvaneworks@gmail.com").trim();
const adminPassword = process.env.ADMIN_PASSWORD?.trim();

if (!adminPassword) {
  console.error("\x1b[31m[Error]\x1b[0m ADMIN_PASSWORD environment variable is required.");
  console.error("Usage: ADMIN_PASSWORD=\"YourSecretPassword\" npm run admin:password\n");
  process.exit(1);
}

if (adminPassword.length < 8) {
  console.error("\x1b[31m[Error]\x1b[0m ADMIN_PASSWORD must be at least 8 characters long.\n");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("\x1b[31m[Error]\x1b[0m Missing Supabase credentials in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log(`\x1b[36m[Password Setup]\x1b[0m Updating password for: ${adminEmail}`);

  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("\x1b[31m[Error]\x1b[0m Failed to list users:", listError.message);
    process.exit(1);
  }

  const user = usersData.users.find(
    (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
  );

  if (!user) {
    console.error(`\x1b[31m[Error]\x1b[0m No user found with email ${adminEmail}`);
    process.exit(1);
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: adminPassword,
    email_confirm: true,
  });

  if (updateError) {
    console.error("\x1b[31m[Error]\x1b[0m Failed to update password:", updateError.message);
    process.exit(1);
  }

  console.log(`\x1b[32m[Success]\x1b[0m Password updated successfully for ${adminEmail}!`);
  console.log(`\x1b[32m[Next]\x1b[0m You can now log in directly at http://localhost:3000/login`);
}

run().catch((err) => {
  console.error("\x1b[31m[Fatal Error]\x1b[0m", err);
  process.exit(1);
});
