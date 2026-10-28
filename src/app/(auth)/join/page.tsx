"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Phone,
  Link as LinkIcon,
  FileText,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { applyToJoinTeamAction } from "@/app/actions/auth";
import { SITE_CONFIG } from "@/lib/constants/site";

const AVAILABLE_SKILLS = [
  "Web Development (Next.js / TypeScript)",
  "Video Editing (Premiere / DaVinci)",
  "Motion Graphics & Reels",
  "Visual & Brand Identity Design",
  "Hardware & Embedded IoT",
  "UI/UX & Figma",
  "Copywriting & Content Strategy",
];

export default function JoinTeamPage() {
  const router = useRouter();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [portfolioUrl, setPortfolioUrl] = React.useState("");
  const [resumeUrl, setResumeUrl] = React.useState("");
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);
  const [coverNote, setCoverNote] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  function toggleSkill(skill: string) {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (selectedSkills.length === 0) {
      setErrorMessage("Please select at least one skill or specialization.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await applyToJoinTeamAction({
        fullName,
        email,
        password,
        phone,
        portfolioUrl,
        resumeUrl,
        skills: selectedSkills,
        coverNote,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to submit team application.");
        setIsLoading(false);
        return;
      }

      router.push(res.redirectTo || "/awaiting-approval");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "A network error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="container min-h-[90vh] py-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="accent" className="mb-1">
            Student Creator Portal
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Join the {SITE_CONFIG.name} Studio
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            We are engineering students in Madurai building real-world client
            deliverables. Submit your application below for founder review.
          </p>
        </div>

        <Card className="shadow-lg border-border">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Application Details</span>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Note: Submitting this form creates an email-verified holding
              account. Access to the Employee Hub is granted strictly following
              admin approval.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="fullName"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      required
                      placeholder="e.g. Ananya Raman"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                      className="pl-9"
                    />
                    <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="ananya@college.edu or gmail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="pl-9"
                    />
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              {/* Row 2: Password & WhatsApp Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Account Password *
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="Min 8 characters (1 uppercase, 1 number)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-9"
                    />
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="phone"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    WhatsApp Phone Number *
                  </label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isLoading}
                      className="pl-9"
                    />
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              {/* Skills Checklist */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Select Your Specializations (Select all that apply) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_SKILLS.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs font-medium transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-card text-foreground hover:bg-muted"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Links: Portfolio & Resume */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label
                    htmlFor="portfolioUrl"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Portfolio / GitHub / Reel Link (Optional)
                  </label>
                  <div className="relative">
                    <Input
                      id="portfolioUrl"
                      type="url"
                      placeholder="https://github.com/... or Behance"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      disabled={isLoading}
                      className="pl-9 text-xs"
                    />
                    <LinkIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="resumeUrl"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Resume / CV Link (Google Drive / Notion)
                  </label>
                  <div className="relative">
                    <Input
                      id="resumeUrl"
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      disabled={isLoading}
                      className="pl-9 text-xs"
                    />
                    <FileText className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              {/* Cover Note */}
              <div className="space-y-1.5 pt-1">
                <label
                  htmlFor="coverNote"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Engineering Background & Motivation (Min 30 characters) *
                </label>
                <Textarea
                  id="coverNote"
                  required
                  rows={4}
                  placeholder={`Tell us about your engineering degree/year in Madurai or Tamil Nadu, your key tools, and why you want to take on client projects with ${SITE_CONFIG.name}.`}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="w-full gap-2 font-semibold text-sm"
              >
                {isLoading ? "Submitting Application..." : "Submit Application"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-2 text-center text-xs text-muted-foreground border-t border-border/60 justify-center">
            Already have an approved employee account?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline ml-1"
            >
              Sign in to Employee Hub
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
