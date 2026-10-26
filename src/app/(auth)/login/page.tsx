"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signInAction } from "@/app/actions/auth";
import { SITE_CONFIG } from "@/lib/constants/site";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const urlError = searchParams.get("error");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (urlError === "account_suspended") {
      setErrorMessage("Your account has been suspended. Please contact studio administration.");
    } else if (urlError === "application_rejected") {
      setErrorMessage("Your employee application was not approved. Please refer to your notification email.");
    }
  }, [urlError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signInAction({ email, password });
      if (!res.success) {
        setErrorMessage(res.error || "Unable to sign in. Please verify your email and password.");
        setIsLoading(false);
        return;
      }

      router.push(res.redirectTo || callbackUrl);
      router.refresh();
    } catch {
      setErrorMessage("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-border">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto w-10 h-10 rounded-full bg-vermilion-50 dark:bg-vermilion-950 flex items-center justify-center text-primary mb-1 border border-vermilion-200 dark:border-vermilion-900">
          <Lock className="w-5 h-5" />
        </div>
        <CardTitle className="font-display text-2xl font-bold tracking-tight">
          Sign In to {SITE_CONFIG.name}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Access your client project portal, employee hub, or admin dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Email Address
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="pl-10"
              />
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pl-10"
              />
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gap-2 font-semibold"
          >
            {isLoading ? "Signing in..." : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Clients Only
            </span>
          </div>
        </div>

        {/* Google OAuth (Clients only as per brief) */}
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 text-xs font-medium"
          onClick={() => {
            alert("Google Client OAuth will redirect to your Supabase OAuth provider.");
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google (Clients)
        </Button>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-2 text-center text-xs text-muted-foreground border-t border-border/60">
        <div>
          Need an order for your business?{" "}
          <Link
            href="/signup"
            className="text-primary font-semibold hover:underline"
          >
            Create client account
          </Link>
        </div>
        <div>
          Engineering student or creator?{" "}
          <Link
            href="/join"
            className="text-foreground hover:text-primary font-medium hover:underline"
          >
            Apply to join the team
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="container min-h-[80vh] flex items-center justify-center py-12">
      <React.Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading sign-in...</div>}>
        <LoginForm />
      </React.Suspense>
    </div>
  );
}
