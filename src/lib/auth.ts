/**
 * Username/password authentication layer for Book Bingo
 * Provides sign-up, sign-in, and session management
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  name?: string;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

/**
 * Check if username is available
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return true;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (error) {
      console.warn('[auth] Error checking username availability:', error);
      return false; // Assume unavailable on error to be safe
    }

    return !data; // Available if no profile found
  } catch (err) {
    console.warn('[auth] Error checking username:', err);
    return false;
  }
}

/**
 * Register a new user with username and password
 * Uses Supabase auth but stores username in profiles
 */
export async function signUpWithUsername(
  username: string,
  password: string,
  displayName?: string
): Promise<AuthResult> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      user: null,
      error: 'Supabase not configured',
    };
  }

  const normalizedUsername = username.trim().toLowerCase();

  // Validate username
  if (normalizedUsername.length < 3) {
    return { user: null, error: 'Username must be at least 3 characters' };
  }
  if (!/^[a-z0-9_-]+$/.test(normalizedUsername)) {
    return {
      user: null,
      error: 'Username can only contain letters, numbers, underscores, and hyphens',
    };
  }

  // Validate password
  if (password.length < 6) {
    return { user: null, error: 'Password must be at least 6 characters' };
  }

  // Check availability
  const available = await checkUsernameAvailable(normalizedUsername);
  if (!available) {
    return { user: null, error: 'Username already taken' };
  }

  // Create a derived email from username (internal use only)
  const derivedEmail = `${normalizedUsername}@bookbingo.app`;

  try {
    // Register with Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: derivedEmail,
      password: password,
      options: {
        data: { username: normalizedUsername, name: displayName },
      },
    });

    if (error || !data.user) {
      return { user: null, error: error?.message || 'Sign-up failed' };
    }

    // Create profile with username
    await supabase
      .from('profiles')
      .upsert(
        {
          id: data.user.id,
          username: normalizedUsername,
          email: derivedEmail,
          name: displayName || normalizedUsername,
          moods: [],
          saved_book_ids: [],
        },
        { onConflict: 'id' }
      );

    return {
      user: {
        id: data.user.id,
        username: normalizedUsername,
        name: displayName || normalizedUsername,
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign-up failed';
    return { user: null, error: message };
  }
}

/**
 * Sign in with username and password
 */
export async function signInWithUsername(
  username: string,
  password: string
): Promise<AuthResult> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      user: null,
      error: 'Supabase not configured',
    };
  }

  const normalizedUsername = username.trim().toLowerCase();
  const derivedEmail = `${normalizedUsername}@bookbingo.app`;

  try {
    // Authenticate with derived email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: derivedEmail,
      password: password,
    });

    if (error || !data.session) {
      return { user: null, error: 'Invalid username or password' };
    }

    // Fetch profile to get display name
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    return {
      user: {
        id: data.user.id,
        username: profile?.username || normalizedUsername,
        name: profile?.name || normalizedUsername,
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign-in failed';
    return { user: null, error: message };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .maybeSingle();

    if (!profile) return null;

    return {
      id: profile.id,
      username: profile.username || 'user',
      email: profile.email,
      name: profile.name,
    };
  } catch (err) {
    console.warn('[auth] Error getting current user:', err);
    return null;
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;

  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[auth] Error signing out:', err);
  }
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(
  callback: (user: AuthUser | null) => void
): () => void {
  if (!supabase || !isSupabaseConfigured) {
    return () => {};
  }

  const unsub = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profile) {
      callback(null);
      return;
    }

    callback({
      id: profile.id,
      username: profile.username || 'user',
      email: profile.email,
      name: profile.name,
    });
  });

  return () => unsub.data?.subscription?.unsubscribe();
}
