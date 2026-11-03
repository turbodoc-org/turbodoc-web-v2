import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const isBrowser = typeof window !== 'undefined';

/**
 * In the browser the session lives in cookies (not localStorage) so the server
 * can see it during SSR — e.g. to send signed-in visitors from `/` straight to
 * `/dashboard` without rendering the landing page first. On the server this
 * module keeps the plain client it always used; request-scoped, cookie-aware
 * server code uses getSupabaseServerClient() instead.
 */
export const supabase = isBrowser
  ? createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
  : createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * One-time move of a session saved by the old localStorage-based client into
 * cookies, so existing users stay signed in after the switch.
 */
async function migrateLegacySession() {
  let storageKey: string;
  try {
    storageKey = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
  } catch {
    return;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return;

  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const legacy = JSON.parse(raw) as { access_token?: string; refresh_token?: string };
      if (legacy.access_token && legacy.refresh_token) {
        await supabase.auth.setSession({
          access_token: legacy.access_token,
          refresh_token: legacy.refresh_token,
        });
      }
    }
  } catch (error) {
    console.error('Failed to migrate saved session:', error);
  } finally {
    window.localStorage.removeItem(storageKey);
  }
}

if (isBrowser) {
  void migrateLegacySession();
}
