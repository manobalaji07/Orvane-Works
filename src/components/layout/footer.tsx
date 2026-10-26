import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Mail,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants/site";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background text-foreground pt-16 pb-12 transition-colors">
      <div className="container">
        {/* Main 4-column Grid (collapses gracefully on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-border">
          {/* Studio Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
              aria-label={`${SITE_CONFIG.name} – Home`}
            >
              <div className="relative flex items-center justify-center h-7 w-7 rounded-md overflow-hidden dark:ring-1.5 dark:ring-[#F6F3EE] p-0.5">
                <Image
                  src="/brand/logo-512.png"
                  alt="Orvane Works Logo"
                  width={28}
                  height={28}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Orvane Works
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              A freelance digital studio run by engineering students in
              Madurai, Tamil Nadu. Building responsive web products, cinematic
              videos, and high-impact digital assets.
            </p>
            <div className="flex items-center gap-3 pt-2 text-muted-foreground">
              {SITE_CONFIG.socials.instagram && (
                <a
                  href={SITE_CONFIG.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:text-primary hover:border-primary transition-colors"
                  aria-label="Orvane Works Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {SITE_CONFIG.socials.linkedin && (
                <a
                  href={SITE_CONFIG.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:text-primary hover:border-primary transition-colors"
                  aria-label="Orvane Works LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {SITE_CONFIG.socials.youtube && (
                <a
                  href={SITE_CONFIG.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:text-primary hover:border-primary transition-colors"
                  aria-label="Orvane Works YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {SITE_CONFIG.socials.github && (
                <a
                  href={SITE_CONFIG.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:text-primary hover:border-primary transition-colors"
                  aria-label="Orvane Works GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-foreground">
              Services
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/services#web-development"
                  className="hover:text-primary transition-colors"
                >
                  Web Design & Development
                </Link>
              </li>
              <li>
                <Link
                  href="/services#video-editing"
                  className="hover:text-primary transition-colors"
                >
                  Video Editing & Reels
                </Link>
              </li>
              <li>
                <Link
                  href="/services#content-creation"
                  className="hover:text-primary transition-colors"
                >
                  Content & Brand Assets
                </Link>
              </li>
              <li>
                <Link
                  href="/hardware"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Hardware & IoT</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-vermilion-100 text-vermilion-700 dark:bg-vermilion-950 dark:text-vermilion-300 font-semibold">
                    Waitlist
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/packages"
                  className="hover:text-primary transition-colors"
                >
                  Pricing Packages (₹)
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio & Studio Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-foreground">
              Studio
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Orvane Works
                </Link>
              </li>
              <li>
                <Link
                  href="/how-we-work"
                  className="hover:text-primary transition-colors"
                >
                  How We Work
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-primary transition-colors">
                  Meet the Team
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio"
                  className="hover:text-primary transition-colors"
                >
                  Case Studies & Work
                </Link>
              </li>
              <li>
                <Link
                  href="/testimonials"
                  className="hover:text-primary transition-colors"
                >
                  Client Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/join"
                  className="hover:text-primary transition-colors text-primary font-medium inline-flex items-center gap-1"
                >
                  Join the Team
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-foreground">
              Madurai Studio
            </h4>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Madurai, Tamil Nadu, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {SITE_CONFIG.email}
                </a>
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4"
                >
                  Contact Form & WhatsApp
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & DPDP Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {currentYear} {SITE_CONFIG.name}. Built with pride by engineering
            students in Madurai.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              Privacy Policy (DPDP Draft)
            </Link>
            <span>•</span>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              Terms of Service
            </Link>
            <span>•</span>
            <Link
              href="/login"
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              Client Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
