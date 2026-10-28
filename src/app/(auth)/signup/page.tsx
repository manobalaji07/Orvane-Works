"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, User, Phone, ArrowRight, AlertCircle } from "lucide-react";
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
import { signUpClientAction } from "@/app/actions/auth";
import { SITE_CONFIG } from "@/lib/constants/site";
import { Turnstile } from "@/components/ui/turnstile";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [turnstileToken, setTurnstileToken] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signUpClientAction({
        fullName,
        email,
        password,
        phone,
        turnstileToken,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to create client account.");
        setIsLoading(false);
        return;
      }

      router.push(res.redirectTo || "/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "A network error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="container min-h-[85vh] flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-vermilion-50 dark:bg-vermilion-950 flex items-center justify-center text-primary mb-1 border border-vermilion-200 dark:border-vermilion-900">
            <UserPlus className="w-5 h-5" />
          </div>
          <CardTitle className="font-display text-2xl font-bold tracking-tight">
            Create Client Account
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Place project briefs, track deliverables, and communicate directly
            with assigned student creators.
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
                htmlFor="fullName"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Full Name / Business Name
              </label>
              <div className="relative">
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Meenakshi Sweets or Rahul Kumar"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
                <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              </div>
            </div>

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
                  placeholder="rahul@example.com"
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
              <label
                htmlFor="phone"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Phone / WhatsApp Number (Optional)
              </label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Password (min 8 chars, 1 uppercase, 1 number)
              </label>
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

            <Turnstile onVerify={setTurnstileToken} />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2 font-semibold"
            >
              {isLoading ? "Creating Account..." : "Create Client Account"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2 text-center text-xs text-muted-foreground border-t border-border/60">
          <div>
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Log in
            </Link>
          </div>
          <div>
            Student applying to work with {SITE_CONFIG.name}?{" "}
            <Link
              href="/join"
              className="text-foreground hover:text-primary font-medium hover:underline"
            >
              Submit team application
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
