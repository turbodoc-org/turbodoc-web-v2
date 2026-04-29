import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/clients/supabase/client";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Mail } from "lucide-react";

function initialsFor(email: string | null | undefined): string {
  if (!email) return "?";
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : local.slice(0, 2);
  return letters.toUpperCase() || "?";
}

export function AuthButton() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="flex gap-1 md:gap-2">
        <Button asChild size="sm" variant="outline" className="text-xs md:text-sm">
          <Link to="/auth/login">Sign in</Link>
        </Button>
        <Button asChild size="sm" variant="default" className="text-xs md:text-sm">
          <Link to="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    );
  }

  const onLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth/login" });
  };

  const avatarUrl = (user.user_metadata as Record<string, unknown> | undefined)?.avatar_url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="h-10 w-10">
            {typeof avatarUrl === "string" && (
              <AvatarImage src={avatarUrl} alt={user.email ?? "User avatar"} />
            )}
            <AvatarFallback>{initialsFor(user.email)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Signed in as</span>
            <span className="truncate text-sm font-medium">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings/digest" className="cursor-pointer">
            <Mail />
            Digest settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout} className="cursor-pointer">
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
