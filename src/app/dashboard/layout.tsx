import React from "react";
import Link from "next/link";
import {
  FolderKanban,
  PlusCircle,
  Settings,
  ArrowUpRight,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { requireClient } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile = { full_name: "Client", email: "" };

  try {
    const res = await requireClient();
    if (res.profile) {
      profile = {
        full_name: res.profile.full_name || "Client",
        email: res.profile.email,
      };
    }
  } catch {
    // Development or fallback preview mode
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Sub-header specifically for the Client Portal */}
      <header className="sticky top-16 z-30 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-foreground hover:text-vermilion transition-colors"
            >
              <FolderKanban className="w-4 h-4 text-vermilion" />
              <span>Client Portal</span>
              <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                Client
              </Badge>
            </Link>

            <nav className="hidden sm:flex items-center gap-1 text-xs font-medium">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              >
                All Orders
              </Link>
              <Link
                href="/dashboard/orders/new"
                className="px-3 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5 text-vermilion" />
                New Request
              </Link>
              <Link
                href="/dashboard/settings"
                className="px-3 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings &amp; DPDP
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-foreground leading-tight">
                {profile.full_name}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {profile.email}
              </span>
            </div>

            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Client Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
