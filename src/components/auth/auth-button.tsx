import { Button } from './ui/button';
import { LogoutButton } from './auth/logout-button';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth/context';

export function AuthButton() {
  const { user, loading } = useAuth();

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
