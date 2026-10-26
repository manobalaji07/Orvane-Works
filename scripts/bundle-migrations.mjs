import fs from 'node:fs';
import path from 'node:path';

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
console.log('Migration files found:', files);

let combined = `-- ==============================================================================
-- Orvane Works: Complete Unified Migration Script
-- Idempotent and ready to run directly in Supabase Dashboard SQL Editor
-- ==============================================================================

`;

for (const file of files) {
  combined += `-- =============================================\n-- Migration: ${file}\n-- =============================================\n\n`;
  let content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

  // Make policies idempotent by adding DROP POLICY IF EXISTS before CREATE POLICY
  content = content.replace(/create\s+policy\s+"([^"]+)"\s+on\s+([a-zA-Z0-9_.]+)/gi, (m, policyName, tableName) => {
    return `drop policy if exists "${policyName}" on ${tableName};\ncreate policy "${policyName}" on ${tableName}`;
  });

  combined += content;
  combined += '\n\n';
}

fs.writeFileSync(path.join(process.cwd(), 'supabase', 'all-migrations.sql'), combined, 'utf8');
console.log('Updated supabase/all-migrations.sql successfully. Total size:', combined.length, 'bytes');
