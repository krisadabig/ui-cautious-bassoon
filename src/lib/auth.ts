import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';
import { goto } from '$app/navigation';

export interface AuthHeaders extends Record<string, string> {
  Authorization: string;
  'Content-Type': string;
  'X-User-ID': string;
}

export interface AuthSession {
  user: User | null;
  accessToken: string;
}

/**
 * Get the current authenticated session with user and access token
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return null;
    }

    return {
      user: session.user,
      accessToken: session.access_token,
    };
  } catch (error) {
    console.error('Error getting auth session:', error);
    return null;
  }
}

/**
 * Get authorization headers for API requests
 */
export async function getAuthHeaders(): Promise<AuthHeaders | null> {
  const session = await getAuthSession();
  if (!session) {
    return null;
  }

  return {
    Authorization: `Bearer ${session.accessToken}`,
    'Content-Type': 'application/json',
    'X-User-ID': session.user!.id,
  };
}

/**
 * Get authenticated session and redirect to login if not authenticated
 * This utility function handles the repetitive pattern of checking authentication
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getAuthSession();
  if (!session) {
    await goto('/');
    throw new Error('Not authenticated');
  }
  return session;
}
