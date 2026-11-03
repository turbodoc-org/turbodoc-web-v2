import { createIsomorphicFn } from "@tanstack/react-start";
import { supabase } from "@/lib/clients/supabase/client";
import { getSupabaseServerClient } from "@/lib/clients/supabase/server";

/**
 * Whether the current visitor is signed in, usable from a route's beforeLoad.
 *
 * - During SSR it reads the auth cookies from the request and verifies the JWT
 *   (getClaims), refreshing an expired access token if needed.
 * - During client-side navigation it reads the browser client's session.
 *
 * This only decides where to send a visitor; protected data stays behind the
 * API's own auth.
 */
export const isSignedIn = createIsomorphicFn()
  .server(async () => {
    try {
      const { data, error } = await getSupabaseServerClient().auth.getClaims();
      return !error && Boolean(data?.claims?.sub);
    } catch {
      return false;
    }
  })
  .client(async () => {
    const { data } = await supabase.auth.getSession();
    return Boolean(data.session);
  });
