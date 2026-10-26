"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, MessageCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_CONFIG } from "@/lib/constants/site";
import { submitContactMessageAction } from "@/app/actions/public";
import { Turnstile } from "@/components/ui/turnstile";

export default function ContactPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [service, setService] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [turnstileToken, setTurnstileToken] = React.useState<string>("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await submitContactMessageAction({
        name,
        email,
        phone,
        serviceId: service || undefined,
        message,
        turnstileToken,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to send message. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        res.message ||
          "Thank you! Your message has been received. Our Madurai student lead will reply within 24 hours."
      );
      setName("");
      setEmail("");
      setPhone("");
      setService("");
      setMessage("");
      setIsLoading(false);
    } catch {
      setErrorMessage("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="container pt-12 md:pt-16 pb-16 space-y-8">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <Badge variant="accent">Get in Touch</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Let&apos;s build something memorable together.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Tell us about your upcoming web app, video project, or brand asset
          needs. We review briefs and reply within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Direct Communication & Details (5 cols on lg, 1st on mobile) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Direct Communication</CardTitle>
              <CardDescription className="text-xs">
                Reach our student leads directly via mail or WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground block text-xs">
                    Mail Us Directly
                  </span>
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="text-primary hover:underline"
                  >
                    {SITE_CONFIG.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground block text-xs">
                    Quick WhatsApp Chat
                  </span>
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                      SITE_CONFIG.whatsappDefaultMessage
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {SITE_CONFIG.phone} (Click to chat)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground block text-xs">
                    Madurai Studio Hub
                  </span>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    {SITE_CONFIG.address}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3 shadow-sm">
            <h4 className="font-semibold text-sm text-foreground">
              Prefer an itemized formal quote?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You can sign up for our Client Portal to submit structured briefs,
              upload reference files, and receive formal proposals.
            </p>
            <Link href="/login" className="inline-block text-xs font-semibold text-primary hover:underline">
              Go to Client Portal Login →
            </Link>
          </div>
        </div>

        {/* Right: Message Form (7 cols on lg, 2nd on mobile) */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-xl">Send Us a Project Message</CardTitle>
              <CardDescription className="text-xs">
                Fill in your project requirements below. Spam protected with Cloudflare Turnstile.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {successMessage ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/60 p-6 text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <h4 className="font-display text-lg font-bold text-emerald-900 dark:text-emerald-200">
                    Message Successfully Sent!
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed max-w-md mx-auto">
                    {successMessage}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSuccessMessage(null)}
                    className="mt-2"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="name"
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        Your Name *
                      </label>
                      <Input
                        id="name"
                        required
                        placeholder="e.g. S. Ramanathan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="raman@business.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="phone"
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        Phone / WhatsApp (Optional)
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="service"
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        Service Needed
                      </label>
                      <select
                        id="service"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        disabled={isLoading}
                        className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select Service (Optional)</option>
                        <option value="web-development">Web Design & Development</option>
                        <option value="video-editing">Video Editing & Reels</option>
                        <option value="content-creation">Content & Brand Assets</option>
                        <option value="hardware-iot">Hardware & IoT Projects</option>
                        <option value="other">Other / Custom Scope</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="message"
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Project Description & Deadline *
                    </label>
                    <Textarea
                      id="message"
                      required
                      rows={5}
                      placeholder="Tell us about what you want to build, any reference websites/videos you like, and your target completion timeline."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <Turnstile onVerify={setTurnstileToken} />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    size="lg"
                    className="w-full gap-2 font-semibold bg-primary text-primary-foreground hover:bg-vermilion-700 dark:hover:bg-vermilion-500"
                  >
                    {isLoading ? "Sending Message..." : "Send Message"}
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
