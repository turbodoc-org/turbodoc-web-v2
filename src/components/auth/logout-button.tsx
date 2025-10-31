'use client';

import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/clients/supabase/client';
import { useNavigate } from '@tanstack/react-router';

export function LogoutButton() {
  const navigate = useNavigate();
  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/auth/login' });
  };

  return <Button onClick={logout}>Logout</Button>;
}
