import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldAlert } from "lucide-react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

/**
 * Server authorization is enforced in Convex; this guard only avoids showing
 * the admin shell to non-admins. Every admin mutation/query re-checks the
 * role server-side, so this is UX, not security.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="size-5 text-destructive" />
          </div>
          <h1 className="text-lg font-semibold">Administrator access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isAuthenticated
              ? "This account does not have administrator permissions."
              : "Sign in with an administrator account to continue."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {!isAuthenticated && (
              <Button asChild>
                <Link to={`/auth?returnTo=${encodeURIComponent(location.pathname)}`}>
                  Sign in
                </Link>
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
