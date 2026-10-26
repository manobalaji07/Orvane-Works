"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MAIN_NAV_ITEMS, SITE_CONFIG } from "@/lib/constants/site";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors">
      <div className="container flex h-18 items-center justify-between py-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90 shrink-0 group"
          aria-label={`${SITE_CONFIG.name} – Home`}
        >
          <div className="relative flex items-center justify-center h-8 w-8 rounded-md overflow-hidden dark:ring-1.5 dark:ring-[#F6F3EE] p-0.5 transition-all">
            <Image
              src="/brand/logo-512.png"
              alt="Orvane Works Logo"
              width={32}
              height={32}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-foreground leading-none">
            Orvane Works
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium"
          aria-label="Main Navigation"
        >
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 rounded-md transition-colors hover:text-foreground",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                {item.label}
                {"badge" in item && (
                  <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-vermilion-100 text-vermilion-700 dark:bg-vermilion-950 dark:text-vermilion-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href={SITE_CONFIG.links.login}>
            <Button variant="ghost" size="sm" className="text-sm font-medium">
              Client Portal
            </Button>
          </Link>
          <Link href={SITE_CONFIG.links.contact}>
            <Button size="sm" className="gap-1.5 shadow-sm font-semibold">
              Start a project
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger & Actions */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 border-border"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="font-display text-2xl font-bold flex items-center gap-2">
                  <Image
                    src="/brand/logo-icon.png"
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                  />
                  <Image
                    src="/brand/logo-wordmark.png"
                    alt={SITE_CONFIG.name}
                    width={110}
                    height={32}
                    className="h-7 w-auto object-contain dark:invert"
                  />
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-2">
                {MAIN_NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <span>{item.label}</span>
                      {"badge" in item && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-vermilion-100 text-vermilion-700 dark:bg-vermilion-950 dark:text-vermilion-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 flex flex-col gap-3 pt-6 border-t border-border">
                <Link
                  href={SITE_CONFIG.links.contact}
                  onClick={() => setIsOpen(false)}
                >
                  <Button className="w-full gap-2 justify-center font-semibold">
                    Start a project
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link
                  href={SITE_CONFIG.links.login}
                  onClick={() => setIsOpen(false)}
                >
                  <Button variant="outline" className="w-full justify-center">
                    Client Portal Login
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
