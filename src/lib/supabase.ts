import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when both env vars are present — the storage layer flips to real Supabase. */
export const isSupabaseConfigured: boolean = Boolean(url && anonKey);

/**
 * Lazily-created Supabase client. Will be `null` in offline/dev mode when
 * env vars are missing — callers must branch on `isSupabaseConfigured`.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'bookbingo.auth',
      },
    })
  : null;
