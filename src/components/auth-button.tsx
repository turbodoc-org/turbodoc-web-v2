import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { LogoutButton } from './logout-button';
import { supabase } from '@/lib/clients/supabase/client';
import { Link } from '@tanstack/react-router';
import type { JwtPayload } from '@supabase/supabase-js';

export function AuthButton() {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getClaims();
        setUser(data?.claims || null);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 md:gap-4">
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return user ? (
    <div className="flex items-center gap-2 md:gap-4 text-foreground text-sm md:text-base">
      <span className="hidden sm:inline">Hey, {user.email}!</span>
      <span className="sm:hidden">Hi!</span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-1 md:gap-2">
      <Button
        asChild
        size="sm"
        variant={'outline'}
        className="text-xs md:text-sm"
      >
        <Link to="/auth/login">Sign in</Link>
      </Button>
      <Button
        asChild
        size="sm"
        variant={'default'}
        className="text-xs md:text-sm"
      >
        <Link to="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
