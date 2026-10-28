import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServices, getPackages, DEFAULT_SERVICES, DEFAULT_PACKAGES } from "@/lib/data/content";
import { getTeamMembers } from "@/lib/data/team";
import { SITE_CONFIG } from "@/lib/constants/site";
import { OrderForm } from "./order-form";

export const metadata = {
  title: `New Project Request — ${SITE_CONFIG.name} Client Portal`,
  description:
    `Submit a new web development, video editing, or content design brief to ${SITE_CONFIG.name}.`,
};

// Force dynamic rendering — this page reads auth cookies and user-specific data.
export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  let services = DEFAULT_SERVICES;
  let packages = DEFAULT_PACKAGES;
  let teamMembers: Awaited<ReturnType<typeof getTeamMembers>> = [];

  try {
    [services, packages, teamMembers] = await Promise.all([
      getServices(),
      getPackages(),
      getTeamMembers(),
    ]);
  } catch {
    // Silently fall back to defaults — catalog still shows placeholder data
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Navigation header */}
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

      <div className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          New Project Request
        </h1>
        <p className="text-sm text-muted-foreground">
          Provide your specifications, budget range, and timeline. Our student founders will review your scope and provide a formal quote within 24 hours.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-vermilion" />
            <p className="text-xs text-muted-foreground mt-2">
              Loading service options &amp; team availability...
            </p>
          </div>
        }
      >
        <OrderForm
          services={services}
          packages={packages}
          teamMembers={teamMembers}
        />
      </Suspense>
    </div>
  );
}
