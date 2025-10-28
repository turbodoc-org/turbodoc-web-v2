import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth/context';
import { useEffect } from 'react';

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: '/auth/login',
        search: {
          redirect:
            window.location.pathname === '/auth/login'
              ? '/bookmarks'
              : window.location.pathname,
        },
      });
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Outlet />;
}
