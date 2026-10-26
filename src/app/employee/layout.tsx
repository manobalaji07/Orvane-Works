import React from "react";
import Link from "next/link";
import {
  FolderKanban,
  UserCheck,
  LogOut,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import { requireEmployee } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile = { full_name: "Specialist", email: "" };

  try {
    const res = await requireEmployee();
    if (res.profile) {
      profile = {
        full_name: res.profile.full_name || "Specialist",
        email: res.profile.email,
      };
    }
  } catch {
    // Development or fallback preview mode
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Sub-header specifically for the Employee Hub */}
      <header className="sticky top-16 z-30 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/employee"
              className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-foreground hover:text-vermilion transition-colors"
            >
              <Briefcase className="w-4 h-4 text-vermilion" />
              <span>Employee Hub</span>
              <Badge variant="accent" className="text-[10px] uppercase font-semibold">
                Specialist
              </Badge>
            </Link>

            <nav className="hidden sm:flex items-center gap-1 text-xs font-medium">
              <Link
                href="/employee"
                className="px-3 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              >
                My Orders
              </Link>
              <Link
                href="/employee/profile"
                className="px-3 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-vermilion" />
                Profile Editor
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

      {/* Main Employee Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
