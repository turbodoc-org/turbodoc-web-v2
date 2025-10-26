'use client';

import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/clients/supabase';
import { redirect } from '@tanstack/react-router';

export function LogoutButton() {
  const logout = async () => {
    await supabase.auth.signOut();
    redirect('/auth/login');
  };

  return <Button onClick={logout}>Logout</Button>;
}
