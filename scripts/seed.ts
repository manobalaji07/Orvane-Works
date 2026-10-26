/**
 * Orvane Works Database Seed Script Runner
 * Refuses to run unless the Supabase URL is local (localhost / 127.0.0.1)
 */

import fs from "fs";
import path from "path";

async function runSeed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";

  // Enforce local-only requirement: Dev seed must refuse to run unless the Supabase URL is local
  const isLocal = supabaseUrl.includes("localhost") || supabaseUrl.includes("127.0.0.1");
  if (!isLocal) {
    console.error(
      `[Orvane Works Seed] ABORTED: Dev seed is strictly restricted to local environments (localhost / 127.0.0.1). Detected URL: "${supabaseUrl}".`
    );
    process.exit(1);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.log("[Orvane Works Seed] ADMIN_EMAIL is not specified. Run `npm run admin:create` to bootstrap the admin account.");
  } else {
    console.log(`[Orvane Works Seed] Target Administrator: ${adminEmail}`);
  }

  const seedSqlPath = path.resolve(process.cwd(), "supabase/seed.sql");
  if (fs.existsSync(seedSqlPath)) {
    const sql = fs.readFileSync(seedSqlPath, "utf-8");
    console.log(`[Orvane Works Seed] Verified ${seedSqlPath} (${sql.length} bytes). Ready for local execution.`);
  } else {
    console.error(`[Orvane Works Seed] seed.sql not found at ${seedSqlPath}`);
    process.exit(1);
  }
}

runSeed().catch((err) => {
  console.error(`[Orvane Works Seed] Error:`, err);
  process.exit(1);
});
