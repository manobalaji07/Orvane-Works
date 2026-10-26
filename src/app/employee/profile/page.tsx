"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Briefcase,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SITE_CONFIG } from "@/lib/constants/site";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateEmployeeProfileAction } from "@/app/actions/employee";
import type { ExperienceEntry } from "@/lib/data/team";

const POPULAR_SPECIALIZATIONS = [
  "Next.js & React",
  "TypeScript",
  "PostgreSQL & RLS",
  "System Design",
  "Video Editing & DaVinci",
  "Motion Graphics",
  "Sound Design",
  "Short-form Reels",
  "Design Systems",
  "UI/UX & Figma",
  "Hardware & Embedded IoT",
];

export default function EmployeeProfileEditorPage() {
  const [activeTab, setActiveTab] = React.useState<"editor" | "preview">("editor");

  // Form State
  const [name, setName] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [designation, setDesignation] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [availabilityStatus, setAvailabilityStatus] = React.useState<
    "available" | "busy" | "unavailable"
  >("available");
  const [specializations, setSpecializations] = React.useState<string[]>([]);
  const [githubUrl, setGithubUrl] = React.useState("");
  const [linkedinUrl, setLinkedinUrl] = React.useState("");
  const [websiteUrl, setWebsiteUrl] = React.useState("");

  // Experience Entries
  const [experience, setExperience] = React.useState<ExperienceEntry[]>([]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Add new experience entry
  function handleAddExperience() {
    const newEntry: ExperienceEntry = {
      id: `exp-${Date.now()}`,
      role: "Engineering Specialist",
      organization: "Project / Organization",
      start_date: new Date().toISOString().split("T")[0],
      end_date: null,
      is_current: true,
      description: "Describe your key technical responsibilities and measurable deliverables.",
      display_order: experience.length + 1,
    };
    setExperience([...experience, newEntry]);
  }

  // Remove experience entry
  function handleRemoveExperience(id: string) {
    setExperience(experience.filter((e) => e.id !== id));
  }

  // Move experience entry up
  function handleMoveUp(index: number) {
    if (index === 0) return;
    const newExp = [...experience];
    const temp = newExp[index - 1];
    newExp[index - 1] = newExp[index];
    newExp[index] = temp;
    setExperience(newExp);
  }

  // Move experience entry down
  function handleMoveDown(index: number) {
    if (index === experience.length - 1) return;
    const newExp = [...experience];
    const temp = newExp[index + 1];
    newExp[index + 1] = newExp[index];
    newExp[index] = temp;
    setExperience(newExp);
  }

  // Toggle Specialization
  function toggleSpecialization(spec: string) {
    if (specializations.includes(spec)) {
      setSpecializations(specializations.filter((s) => s !== spec));
    } else {
      setSpecializations([...specializations, spec]);
    }
  }

  // Handle Save
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await updateEmployeeProfileAction({
        designation,
        bio,
        availability_status: availabilityStatus,
        specializations,
        experience,
        github_url: githubUrl || undefined,
        linkedin_url: linkedinUrl || undefined,
        website_url: websiteUrl || undefined,
        avatar_url: avatarUrl || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to update profile.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Public profile saved and synchronized successfully!");
      setIsLoading(false);
    } catch {
      setErrorMessage("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="container py-8 md:py-12 space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/employee"
              className="text-xs font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Employee Hub
            </Link>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Public Studio Profile Editor
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your public bio, specializations, work experience timeline,
            and availability status.
          </p>
        </div>

        {/* Tab Controls: Editor vs Live Preview */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "editor"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Profile Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/60 p-4 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: PROFILE EDITOR */}
      {activeTab === "editor" ? (
        <form onSubmit={handleSave} className="space-y-8">
          {/* Card 1: Core Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Core Profile Information</CardTitle>
              <CardDescription className="text-xs">
                Visible to all visitors on the Team page and your public profile.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Designation / Studio Role *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Lead Full-Stack Engineer"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Availability Status *
                  </label>
                  <select
                    value={availabilityStatus}
                    onChange={(e) =>
                      setAvailabilityStatus(
                        e.target.value as "available" | "busy" | "unavailable"
                      )
                    }
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="available">Available for new projects</option>
                    <option value="busy">Partially booked / Heavy coursework</option>
                    <option value="unavailable">Currently unavailable</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Profile Photo URL (JPG, JPEG, PNG, or relative path)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. https://.../photo.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Short Professional Bio (Min 20 chars) *
                </label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Describe your engineering focus, tools you love, and what kind of client projects you excel at."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Specializations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Specializations</CardTitle>
              <CardDescription className="text-xs">
                Select tags that match your core engineering or creative skills.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SPECIALIZATIONS.map((spec) => {
                  const isSelected = specializations.includes(spec);
                  return (
                    <button
                      type="button"
                      key={spec}
                      onClick={() => toggleSpecialization(spec)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary font-semibold"
                          : "bg-background text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Work Experience Builder (Add, Edit, Reorder, Remove) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Work Experience & Key Projects
                </CardTitle>
                <CardDescription className="text-xs">
                  Add internships, studio projects, or open source contributions.
                  You can reorder entries with the arrow buttons.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddExperience}
                className="gap-1.5 text-xs"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              {experience.map((entry, index) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-border p-4 bg-muted/20 space-y-4 relative"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <span className="text-xs font-semibold text-primary">
                      Entry #{index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        aria-label="Move entry up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={index === experience.length - 1}
                        onClick={() => handleMoveDown(index)}
                        aria-label="Move entry down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveExperience(entry.id)}
                        aria-label="Remove entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                        Role / Title
                      </label>
                      <Input
                        value={entry.role}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[index].role = e.target.value;
                          setExperience(updated);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                        Organization / Project Name
                      </label>
                      <Input
                        value={entry.organization}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[index].organization = e.target.value;
                          setExperience(updated);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={entry.start_date}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[index].start_date = e.target.value;
                          setExperience(updated);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                        End Date (Leave blank if current)
                      </label>
                      <Input
                        type="date"
                        value={entry.end_date || ""}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[index].end_date = e.target.value || null;
                          setExperience(updated);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                      Description of Deliverables
                    </label>
                    <Textarea
                      rows={2}
                      value={entry.description}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[index].description = e.target.value;
                        setExperience(updated);
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Card 4: Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social & Portfolio Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    GitHub URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    LinkedIn URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Website URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://yourname.dev"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="gap-2 font-semibold shadow-md"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Saving Profile..." : "Save Public Profile"}
            </Button>
          </div>
        </form>
      ) : (
        /* TAB 2: LIVE PREVIEW (Exact match to public view) */
        <div className="space-y-8 p-6 rounded-2xl border border-dashed border-border bg-card/60">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Previewing: How visitors see you on /team/your-slug
            </span>
            <Badge variant="accent">Live Simulation</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4 space-y-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border shadow bg-muted">
                <Image
                  src={avatarUrl}
                  alt={name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="accent">{designation}</Badge>
                  {availabilityStatus === "available" ? (
                    <Badge variant="success" className="gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Available for new projects
                    </Badge>
                  ) : (
                    <Badge variant="warning">Partially booked</Badge>
                  )}
                </div>
                <h2 className="font-display text-3xl font-bold text-foreground">
                  {name}
                </h2>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {bio}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {specializations.map((spec) => (
                  <span
                    key={spec}
                    className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-foreground border border-border"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              <div className="pt-4">
                <Button size="sm" className="font-semibold gap-1.5">
                  Request {name.split(" ")[0]} for your project
                </Button>
              </div>
            </div>
          </div>

          {/* Timeline in preview */}
          <div className="pt-6 border-t border-border space-y-4">
            <h3 className="font-display text-xl font-bold">
              Experience & Engineering Projects
            </h3>
            <div className="space-y-4 border-l-2 border-border pl-6 ml-2">
              {experience.map((exp) => (
                <div key={exp.id} className="relative space-y-1">
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-background border-2 border-primary" />
                  <h4 className="font-semibold text-sm text-foreground">
                    {exp.role} •{" "}
                    <span className="text-primary font-medium">
                      {exp.organization}
                    </span>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
