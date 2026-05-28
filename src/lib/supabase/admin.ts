import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

function getSupabaseSecretKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabaseSecretKey()
  );
}

export function getSupabaseAdmin(): SupabaseClient {
  const secretKey = getSupabaseSecretKey();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !secretKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in .env.local (see SUPABASE_SETUP.md)."
    );
  }

  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      secretKey,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }

  return adminClient;
}
