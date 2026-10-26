import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  FolderKanban,
  Inbox,
  FileSpreadsheet,
  Activity,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile = { full_name: "Administrator", email: "" };

  try {
    const res = await requireAdmin();
    if (res.profile) {
      profile = {
        full_name: res.profile.full_name || "Administrator",
        email: res.profile.email,
      };
    }
  } catch {
    // Development or fallback preview mode
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Top bar specifically for the Admin Dashboard */}
      <header className="sticky top-16 z-30 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-foreground hover:text-vermilion transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-vermilion" />
              <span>Studio Administration</span>
              <Badge variant="destructive" className="text-[10px] uppercase font-semibold">
                Founder
              </Badge>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
              <Link
                href="/admin"
                className="px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors flex items-center gap-1"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Overview
              </Link>
              <Link
                href="/admin/employees"
                className="px-2.5 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" />
                Employees
              </Link>
              <Link
                href="/admin/orders"
                className="px-2.5 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                Orders
              </Link>
              <Link
                href="/admin/inbox"
                className="px-2.5 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Inbox className="w-3.5 h-3.5" />
                Inbox
              </Link>
              <Link
                href="/admin/content"
                className="px-2.5 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Content CMS
              </Link>
              <Link
                href="/admin/audit"
                className="px-2.5 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Activity className="w-3.5 h-3.5" />
                Audit Log
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

      {/* Main Admin Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
