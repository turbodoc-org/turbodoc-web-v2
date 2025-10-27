import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/clients/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
  initialSession?: Session | null;
}

export function AuthProvider({ children, initialSession }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: initialSession?.user ?? null,
    session: initialSession ?? null,
    loading: !initialSession, // If we have initial session, don't show loading
  });

  useEffect(() => {
    // Get initial session if not provided via SSR
    if (!initialSession) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      });
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, [initialSession]);

  const value: AuthState = {
    ...authState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
