"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, CheckCircle2 } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="container min-h-[80vh] flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-vermilion-50 dark:bg-vermilion-950 flex items-center justify-center text-primary mb-1 border border-vermilion-200 dark:border-vermilion-900">
            <KeyRound className="w-5 h-5" />
          </div>
          <CardTitle className="font-display text-2xl font-bold tracking-tight">
            Set New Password
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Enter your new secure password below to regain access to your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSuccess ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/60 p-4 text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="font-semibold text-sm text-emerald-900 dark:text-emerald-200">
                Password Updated Successfully
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                Your password has been changed. Redirecting you to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border pt-4">
          <Link
            href="/login"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
