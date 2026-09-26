import { useState, type FormEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Simple account modal — shown only when a visitor performs an action that
 * stores their information (message, volunteer application, donation).
 * Minimum data: full name, email, password. Browsing never requires it.
 */
export default function AuthModal({
  open,
  onOpenChange,
  onSignedIn,
  contextLabel = "continue",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignedIn?: () => void;
  /** Shown in the modal copy, e.g. "send your message". */
  contextLabel?: string;
}) {
  const { signIn } = useAuthActions();
  // Convex Auth Password provider flows are exactly "signIn" | "signUp".
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (mode === "signUp" && form.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await signIn("password", {
        flow: mode,
        email: form.email.trim(),
        password: form.password,
        ...(mode === "signUp" ? { name: form.name.trim() } : {}),
      });
      onSignedIn?.();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed. Please try again.";
      setError(
        msg.includes("InvalidAccountID") || msg.includes("invalid")
          ? "Email or password is incorrect."
          : msg.replace(/^Uncaught Error: /, "").slice(0, 140),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "signIn" ? "Sign in to " : "Create your account to "}
            {contextLabel}
          </DialogTitle>
          <DialogDescription>
            Your details are stored securely so you can return later and follow your
            submissions. You only need an account for this — browsing the site is
            always open.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          {mode === "signUp" && (
            <div>
              <label htmlFor="am-name" className="mb-1.5 block text-sm font-medium">
                Full name
              </label>
              <Input
                id="am-name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="am-email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <Input
              id="am-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="am-password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <Input
              id="am-password"
              type="password"
              autoComplete={mode === "signUp" ? "new-password" : "current-password"}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>

          {error && (
            <p role="alert" className="rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {mode === "signUp" ? "Creating account…" : "Signing in…"}
              </>
            ) : mode === "signUp" ? (
              "Create account & continue"
            ) : (
              "Sign in & continue"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signIn" ? "New here? " : "Already have an account? "}
            <button
              type="button"
              className={cn("underline underline-offset-4 hover:text-foreground")}
              onClick={() => {
                setMode(mode === "signIn" ? "signUp" : "signIn");
                setError(null);
              }}
            >
              {mode === "signIn" ? "Create an account" : "Sign in instead"}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
