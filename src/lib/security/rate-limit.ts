/**
 * Free Database-Backed Sliding-Window Rate Limiter
 * Invokes postgres RPC `check_rate_limit(p_key, p_max_requests, p_window_seconds)`
 * with an in-memory sliding window fallback for local testing without database.
 */

import { createAdminClient } from "@/lib/supabase/admin";

interface MemoryLimit {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryLimit>();

export async function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (!error && typeof data === "boolean") {
      return data;
    }
  } catch {
    // Fall back to memory store if DB RPC is unconfigured
  }

  // In-memory sliding window fallback
  const now = Date.now();
  const existing = memoryStore.get(key);

  if (!existing || now > existing.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }

  if (existing.count >= maxRequests) {
    return false;
  }

  existing.count += 1;
  return true;
}
