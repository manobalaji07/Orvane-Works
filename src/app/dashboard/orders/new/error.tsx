"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewOrderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[New Order Page Error]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Client Portal
          </Button>
        </Link>
        <span className="text-xs text-muted-foreground font-mono">
          Stage 1 / Brief Submission
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            Could not load order form
          </h2>
          <p className="text-sm text-muted-foreground">
            There was a temporary issue loading the service catalog. Please try again.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
