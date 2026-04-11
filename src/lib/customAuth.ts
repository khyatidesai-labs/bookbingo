/**
 * Custom username/password authentication
 * Completely independent of Supabase auth - uses Supabase database only
 * Perfect for hackathons with email signups disabled
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { UserProfile } from '../types';

export interface CustomAuthUser {
  id: string;
  username: string;
  name: string;
}

const SESSION_KEY = 'bookbingo.auth.session';
const USER_KEY = 'bookbingo.auth.user';

/**
 * Hash password using simple algorithm (not production-grade)
 * For hackathon use only
 */
function hashPassword(password: string): string {
  // Use base64 encoding for simple hashing
  // In production, use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'hash_' + Math.abs(hash).toString(36) + '_' + btoa(password).slice(0, 10);
}

/**
 * Check if username exists
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return true;

  try {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    return !data;
  } catch (err) {
    console.warn('[customAuth] Error checking username:', err);
    return false;
  }
}

/**
 * Sign up with username/password
 * Creates profile and stores credentials
 */
export async function signUpWithUsernamePassword(
  username: string,
  password: string,
  displayName?: string
): Promise<{ userId: string; username: string; error: string | null }> {
  if (!supabase || !isSupabaseConfigured) {
    return { userId: '', username: '', error: 'Supabase not configured' };
  }

  const normalizedUsername = username.trim().toLowerCase();

  // Validation
  if (normalizedUsername.length < 3) {
    return { userId: '', username: '', error: 'Username must be at least 3 characters' };
  }
  if (!/^[a-z0-9_-]+$/.test(normalizedUsername)) {
    return {
      userId: '',
      username: '',
      error: 'Username can only contain letters, numbers, underscores, and hyphens',
    };
  }
  if (password.length < 6) {
    return { userId: '', username: '', error: 'Password must be at least 6 characters' };
  }

  // Check availability
  const available = await checkUsernameAvailable(normalizedUsername);
  if (!available) {
    return { userId: '', username: '', error: 'Username already taken' };
  }

  try {
    // Generate a new user ID (pure UUID, no prefix - PostgreSQL requires valid UUID format)
    const userId = crypto.randomUUID();

    // Hash password
    const passwordHash = hashPassword(password);

    // Create profile with username and password hash
    const { error } = await supabase.from('profiles').insert([
      {
        id: userId,
        username: normalizedUsername,
        name: displayName || normalizedUsername,
        email: `${normalizedUsername}@bookbingo.local`, // Internal only
        moods: [],
        saved_book_ids: [],
        password_hash: passwordHash, // Store hashed password
      },
    ]);

    if (error) {
      console.error('[customAuth] Signup error:', error);
      return { userId: '', username: '', error: error.message || 'Signup failed' };
    }

    // Create session
    const session = {
      userId,
      username: normalizedUsername,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        id: userId,
        username: normalizedUsername,
        name: displayName || normalizedUsername,
      })
    );

    return { userId, username: normalizedUsername, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signup failed';
    return { userId: '', username: '', error: message };
  }
}

/**
 * Sign in with username/password
 */
export async function signInWithUsernamePassword(
  username: string,
  password: string
): Promise<{ userId: string; username: string; error: string | null }> {
  if (!supabase || !isSupabaseConfigured) {
    return { userId: '', username: '', error: 'Supabase not configured' };
  }

  const normalizedUsername = username.trim().toLowerCase();

  try {
    // Fetch user by username
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, name, password_hash')
      .eq('username', normalizedUsername)
      .maybeSingle();

    if (error || !profile) {
      return { userId: '', username: '', error: 'Username not found' };
    }

    // Verify password
    const passwordHash = hashPassword(password);
    if (profile.password_hash !== passwordHash) {
      return { userId: '', username: '', error: 'Invalid password' };
    }

    // Create session
    const session = {
      userId: profile.id,
      username: profile.username,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        id: profile.id,
        username: profile.username,
        name: profile.name,
      })
    );

    return { userId: profile.id, username: profile.username, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign-in failed';
    return { userId: '', username: '', error: message };
  }
}

/**
 * Get current session
 */
export function getCurrentSession(): CustomAuthUser | null {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    const user = JSON.parse(userStr) as CustomAuthUser;
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;

    const session = JSON.parse(sessionStr) as { expiresAt: number };

    // Check if session expired
    if (session.expiresAt < Date.now()) {
      signOut();
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Sign out
 */
export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) return null;

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      profession: profile.profession,
      moods: profile.moods ?? [],
      savedBookIds: profile.saved_book_ids ?? [],
    };
  } catch (err) {
    console.warn('[customAuth] Error getting profile:', err);
    return null;
  }
}
