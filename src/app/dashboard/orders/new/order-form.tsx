"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Upload,
  Calendar,
  IndianRupee,
  HelpCircle,
  Check,
  User,
  ArrowRight,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createOrderAction } from "@/app/actions/orders";
import { formatINR } from "@/lib/utils";
import type { ServiceItem, PackageItem } from "@/lib/data/content";
import type { TeamMember } from "@/lib/data/team";

interface OrderFormProps {
  services: ServiceItem[];
  packages: PackageItem[];
  teamMembers: TeamMember[];
}

export function OrderForm({ services, packages, teamMembers }: OrderFormProps) {
  const searchParams = useSearchParams();
  const initialServiceSlug = searchParams.get("service") || "";
  const initialPackageSlug = searchParams.get("package") || "";
  const initialTeamSlug = searchParams.get("preferred_team") || "";

  const initialService = services.find((s) => s.slug === initialServiceSlug) || services[0];
  const initialTeam = teamMembers.find((m) => m.slug === initialTeamSlug);
  const initialPkg = packages.find((p) => p.slug === initialPackageSlug);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialService?.id || services[0]?.id || ""
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    initialPkg?.id || ""
  );
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    initialTeam?.id || ""
  );
  const [isCustomScope, setIsCustomScope] = useState<boolean>(!initialPkg);
  const [budgetMin, setBudgetMin] = useState<number>(initialPkg ? initialPkg.price_inr : 15000);
  const [budgetMax, setBudgetMax] = useState<number>(initialPkg ? initialPkg.price_inr * 1.5 : 35000);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter packages for selected service
  const availablePackages = packages.filter((p) => p.service_id === selectedServiceId);

  // Handle service change
  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedPackageId("");
    setIsCustomScope(true);
  };

  // Handle package selection
  const handlePackageSelect = (pkg: PackageItem) => {
    setSelectedPackageId(pkg.id);
    setIsCustomScope(false);
    setBudgetMin(pkg.price_inr);
    setBudgetMax(pkg.price_inr);
  };

  const handleCustomScope = () => {
    setSelectedPackageId("");
    setIsCustomScope(true);
  };

  return (
    <form
      action={async (formData) => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
          const res = await createOrderAction(null, formData);
          if (res && !res.success) {
            setErrorMessage(res.message || "Failed to submit project request.");
            setIsSubmitting(false);
          }
        } catch (err: any) {
          // Next.js redirect throws an internal error (with err.digest starting with NEXT_REDIRECT in production)
          const isRedirect =
            err?.message === "NEXT_REDIRECT" ||
            err?.message?.includes("NEXT_REDIRECT") ||
            (typeof err?.digest === "string" && err.digest.includes("NEXT_REDIRECT"));

          if (isRedirect) {
            // Rethrow so Next.js App Router completes the redirect to the new order page
            throw err;
          }

          setErrorMessage(err?.message || "Something went wrong.");
          setIsSubmitting(false);
        }
      }}
      className="space-y-8"
    >
      {errorMessage && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Service & Package Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              1
            </span>
            <CardTitle className="text-xl">Choose Service &amp; Scope</CardTitle>
          </div>
          <CardDescription>
            Select the domain of work. Our services are dynamically populated from the studio catalog.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Service Selector Tabs / Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {services.map((svc) => {
              const isSelected = selectedServiceId === svc.id;
              return (
                <button
                  type="button"
                  key={svc.id}
                  onClick={() => handleServiceChange(svc.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "border-vermilion bg-vermilion/5 ring-2 ring-vermilion/20"
                      : "border-border hover:border-border/80 bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-foreground">
                      {svc.title}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-vermilion" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {svc.short_description}
                  </p>
                </button>
              );
            })}
          </div>

          <input type="hidden" name="service_id" value={selectedServiceId} />
          <input type="hidden" name="package_id" value={selectedPackageId} />

          {/* Tiered Packages or Custom Scope */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Package Options for Selected Service
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {availablePackages.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <button
                    type="button"
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-vermilion bg-vermilion/5 ring-1 ring-vermilion"
                        : "border-border hover:border-border/80 bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{pkg.name}</span>
                      {pkg.is_popular && (
                        <Badge variant="secondary" className="text-[10px]">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div className="font-display font-bold text-base text-vermilion mb-2">
                      {formatINR(pkg.price_inr)}
                    </div>
                    <ul className="text-[11px] text-muted-foreground space-y-1">
                      {pkg.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-vermilion" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}

              {/* Custom Scope Option */}
              <button
                type="button"
                onClick={handleCustomScope}
                className={`p-4 rounded-lg border text-left transition-all ${
                  isCustomScope
                    ? "border-vermilion bg-vermilion/5 ring-1 ring-vermilion"
                    : "border-border hover:border-border/80 bg-background"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">Custom Scope</span>
                  <Badge variant="outline" className="text-[10px]">
                    Tailored
                  </Badge>
                </div>
                <div className="font-display font-bold text-sm text-foreground mb-2">
                  Variable Pricing
                </div>
                <p className="text-xs text-muted-foreground">
                  Need a bespoke architecture or custom deliverables? Specify your brief and budget below.
                </p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STEP 2: Project Brief & Reference Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              2
            </span>
            <CardTitle className="text-xl">Project Details &amp; Brief</CardTitle>
          </div>
          <CardDescription>
            Help our student founders understand your goals, target audience, and functional expectations.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Project Title <span className="text-vermilion">*</span>
            </label>
            <Input
              name="title"
              required
              placeholder="e.g. Modern Web Portal for Meenakshi Clinic"
              defaultValue={
                initialPkg
                  ? `${initialPkg.name} Project`
                  : initialService
                  ? `${initialService.title} Project`
                  : ""
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Detailed Project Brief <span className="text-vermilion">*</span>
            </label>
            <Textarea
              name="project_brief"
              required
              rows={5}
              placeholder="Describe what you want built, your target audience, key features, pages or scenes needed, and any specific design preferences..."
              defaultValue=""
            />
            <p className="text-xs text-muted-foreground">
              Minimum 20 characters. Be as specific as possible to get an exact quote.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Inspiration &amp; Reference URLs (Optional)
            </label>
            <Textarea
              name="reference_links"
              rows={2}
              placeholder="e.g. https://example.com, https://instagram.com/competitor (one link per line)"
            />
          </div>

          {/* Reference Files Notice */}
          <div className="p-4 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Upload className="w-4 h-4 text-vermilion" />
              <span>Reference Files &amp; Assets Upload</span>
            </div>
            <p>
              Once your order number is generated, you can securely upload project logos, brand guidelines, and raw video footages directly in your order&apos;s private file vault.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* STEP 3: Timeline, Budget & Contact Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              3
            </span>
            <CardTitle className="text-xl">Budget, Timeline &amp; Team Preferences</CardTitle>
          </div>
          <CardDescription>
            Specify your expected investment in Indian Rupees (₹) and your desired launch date.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Budget Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-vermilion" />
                Minimum Budget (₹)
              </label>
              <Input
                type="number"
                name="budget_min_inr"
                required
                min={1000}
                step={500}
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-vermilion" />
                Maximum Budget (₹)
              </label>
              <Input
                type="number"
                name="budget_max_inr"
                required
                min={1000}
                step={500}
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Target Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-vermilion" />
                Target Completion Deadline
              </label>
              <Input
                type="date"
                name="target_deadline"
                required
                min={new Date().toISOString().split("T")[0]}
                defaultValue={
                  new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Preferred Contact Method
              </label>
              <select
                name="preferred_contact_method"
                defaultValue="whatsapp"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="whatsapp">WhatsApp (Instant Updates)</option>
                <option value="email">Email</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>
          </div>

          {/* Preferred Student Team Member */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <User className="w-4 h-4 text-vermilion" />
                Request Specific Team Member (Optional)
              </label>
              {selectedTeamId && (
                <button
                  type="button"
                  onClick={() => setSelectedTeamId("")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear Selection
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              You can request a specific student engineer or designer you discovered on our Team page.
            </p>

            <select
              name="preferred_employee_id"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">No preference (Assign best available lead)</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} — {member.designation} (
                  {member.availability_status === "available" ? "Available" : "Busy"}
                  )
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Submission Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-card border border-border rounded-lg shadow-sm">
        <div className="text-xs text-muted-foreground">
          <p>
            By submitting, you will receive an official quote and timeline breakdown in your client portal within 24 hours.
          </p>
          <p className="mt-1">
            No payment is charged until you formally accept our quote.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto gap-2 font-semibold bg-primary text-primary-foreground hover:bg-vermilion-700 dark:hover:bg-vermilion-500"
          >
            {isSubmitting ? (
              <span>Submitting Brief...</span>
            ) : (
              <>
                <span>Submit Order Request</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
