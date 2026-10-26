import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireClient } from "@/lib/auth/guards";
import { SITE_CONFIG } from "@/lib/constants/site";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: `Account Settings & DPDP Privacy — ${SITE_CONFIG.name} Client Portal`,
  description:
    "Manage client contact information, notification preferences, data export, and DPDP Act rights.",
};

export default async function SettingsPage() {
  let profile = {
    id: "",
    email: "",
    full_name: "",
    phone: "",
    metadata: {
      company_name: "",
      notify_order_updates: true,
      notify_messages: true,
    },
  };

  try {
    const res = await requireClient();
    if (res.profile) {
      profile = {
        id: res.profile.id,
        email: res.profile.email,
        full_name: res.profile.full_name || "Valued Client",
        phone: res.profile.phone || "",
        metadata: (res.profile as any).metadata || {},
      };
    }
  } catch {
    // Fallback demo mode for static rendering/preview
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Client Portal
          </Button>
        </Link>
        <span className="text-xs text-muted-foreground font-mono">
          Security &amp; DPDP Controls
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Client Settings &amp; Data Rights
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your contact credentials, team notification triggers, and exercise your statutory data privacy rights.
        </p>
      </div>

      <SettingsClient initialProfile={profile} />
    </div>
  );
}
