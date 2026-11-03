import { getCookies, setCookie } from '@tanstack/react-start/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Cookie-backed Supabase client for server code (SSR, beforeLoad, server
 * functions). Create one per request: a shared instance would keep auth state
 * in memory across different users' requests.
 */
export function getSupabaseServerClient() {
  return createServerClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return Object.entries(getCookies()).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            setCookie(cookie.name, cookie.value, cookie.options);
          });
        },
      },
    },
  );
}
