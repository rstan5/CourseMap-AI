import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import type { AuthUser } from "@/types/auth";

interface GenerateHeaderProps {
  user: AuthUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function GenerateHeader({ user, onSignIn, onSignOut }: GenerateHeaderProps) {
  return (
    <header className="glass-soft relative z-10 mx-4 mt-4 rounded-3xl px-5 py-4 sm:mx-6 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Logo href="/" />
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span className="glass-pill hidden max-w-[180px] truncate rounded-full px-4 py-2 text-xs font-bold text-muted-foreground sm:inline-block">
                {user.email}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="glass-button rounded-full px-5 py-2 text-xs font-bold text-primary-foreground"
            >
              Sign in
            </button>
          )}
          <Link
            href="/"
            className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
