import { supabase } from '@/lib/clients/supabase';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/api/auth/confirm')({
  server: {
    handlers: {
      GET: async (req) => {
        const { request } = req;
        const { searchParams } = new URL(request.url);
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type') as EmailOtpType | null;
        const next = searchParams.get('next') ?? '/';

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
          });
          if (!error) {
            // redirect user to specified redirect URL or root of app
            throw redirect({ to: next });
          } else {
            // redirect the user to an error page with some instructions
            throw redirect({
              to: '/auth/error',
              search: { error: error?.message },
            });
          }
        }

        // redirect the user to an error page with some instructions
        throw redirect({
          to: '/auth/error',
          search: { error: 'No token hash or type' },
        });
      },
    },
  },
});
