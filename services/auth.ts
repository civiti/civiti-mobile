import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/api';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// --- Storage adapter ---
// SecureStore has a ~2 KB value limit. Supabase sessions are 3-6 KB.
// This adapter chunks large values across multiple SecureStore keys.

const canUseLocalStorage =
  Platform.OS === 'web' && typeof localStorage !== 'undefined';

async function getItemNative(key: string): Promise<string | null> {
  const countStr = await SecureStore.getItemAsync(`${key}_count`);
  if (countStr) {
    const count = parseInt(countStr, 10);
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        SecureStore.getItemAsync(`${key}_${i}`),
      ),
    );
    if (chunks.some((chunk) => chunk === null)) {
      return null;
    }
    return chunks.join('');
  }
  // Fall back to non-chunked read for sessions stored before this adapter
  return SecureStore.getItemAsync(key);
}

async function setItemNative(key: string, value: string): Promise<void> {
  if (!value) {
    await removeItemNative(key);
    return;
  }
  const chunks = value.match(/.{1,2048}/g) ?? [];
  await SecureStore.setItemAsync(`${key}_count`, String(chunks.length));
  await Promise.all(
    chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}_${i}`, chunk)),
  );
}

async function removeItemNative(key: string): Promise<void> {
  const countStr = await SecureStore.getItemAsync(`${key}_count`);
  if (countStr) {
    const count = parseInt(countStr, 10);
    await Promise.all(
      Array.from({ length: count }, (_, i) =>
        SecureStore.deleteItemAsync(`${key}_${i}`),
      ),
    );
    await SecureStore.deleteItemAsync(`${key}_count`);
  }
  // Also delete the non-chunked key (migration from before this adapter)
  await SecureStore.deleteItemAsync(key);
}

const storageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (canUseLocalStorage) return localStorage.getItem(key);
    if (Platform.OS !== 'web') return getItemNative(key);
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (canUseLocalStorage) {
      localStorage.setItem(key, value);
    } else if (Platform.OS !== 'web') {
      await setItemNative(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (canUseLocalStorage) {
      localStorage.removeItem(key);
    } else if (Platform.OS !== 'web') {
      await removeItemNative(key);
    }
  },
};

// --- Supabase client ---

const isMissingConfig = !SUPABASE_URL || !SUPABASE_ANON_KEY;

if (isMissingConfig && __DEV__) {
  console.warn(
    '[auth] SUPABASE_URL or SUPABASE_ANON_KEY is not configured. ' +
      'Auth will not work. See .env.example.',
  );
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder',
  {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      // OAuth callback tokens are extracted manually via expo-linking (see S11)
      detectSessionInUrl: false,
    },
  },
);

// --- Auth functions ---

export function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

const REDIRECT_URI = 'civitimobile://auth/callback';

/** Extract OAuth params from both PKCE (?code=) and implicit (#access_token=) redirects. */
function extractOAuthParams(url: string): {
  code?: string;
  accessToken?: string;
  refreshToken?: string;
} {
  // PKCE: code is in query params
  try {
    const queryCode = new URL(url).searchParams.get('code');
    if (queryCode) return { code: queryCode };
  } catch (e) {
    // Custom scheme URLs may not parse on all platforms — fall through to hash parsing
    console.warn('[auth] URL parse fell through to hash parsing:', e);
  }

  // Implicit: tokens in hash fragment
  const hash = url.split('#')[1];
  if (!hash) return {};
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token') ?? undefined;
  const refreshToken = params.get('refresh_token') ?? undefined;
  return { accessToken, refreshToken };
}

/**
 * Opens a browser-based OAuth flow and exchanges the result for a Supabase session.
 * Uses SFAuthenticationSession (iOS) / Chrome Custom Tabs (Android).
 */
export async function performOAuthSignIn(provider: 'google' | 'apple') {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: REDIRECT_URI,
        skipBrowserRedirect: true,
        queryParams: { flowType: 'pkce' },
      },
    });

    if (error || !data.url) {
      return { data: null, error: error ?? new Error('No auth URL returned') };
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI, {
      preferEphemeralSession: true,
    });

    if (result.type !== 'success') {
      // User cancelled or dismissed — not an error
      return { data: null, error: null };
    }

    const params = extractOAuthParams(result.url);

    if (params.code) {
      const exchange = await supabase.auth.exchangeCodeForSession(params.code);
      return { data: exchange.data?.session ?? null, error: exchange.error };
    }

    if (params.accessToken && params.refreshToken) {
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: params.accessToken,
        refresh_token: params.refreshToken,
      });
      return { data: sessionData?.session ?? null, error: sessionError };
    }

    if (params.accessToken) {
      return { data: null, error: new Error('Implicit flow returned access_token without refresh_token') };
    }

    return { data: null, error: new Error('No auth tokens in redirect URL') };
  } catch (err) {
    console.warn(`[auth] OAuth ${provider} sign-in failed:`, err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('OAuth sign-in failed'),
    };
  }
}

export function signUp(
  email: string,
  password: string,
  metadata?: Record<string, string>,
) {
  return supabase.auth.signUp({
    email,
    password,
    options: metadata ? { data: metadata } : undefined,
  });
}

export function signOut() {
  return supabase.auth.signOut();
}

export function getSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
) {
  return supabase.auth.onAuthStateChange(callback);
}

export function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email);
}

export function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}
