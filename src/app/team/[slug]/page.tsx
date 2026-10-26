import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  Github,
  Linkedin,
  Globe,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getTeamMembers, getTeamMemberBySlug } from "@/lib/data/team";
import { formatDate } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants/site";

interface TeamDetailPageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 60;

export async function generateStaticParams() {
  const team = await getTeamMembers();
  return team.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: TeamDetailPageProps) {
  const member = await getTeamMemberBySlug(params.slug);
  if (!member) return { title: "Team Member Not Found" };

  return {
    title: `${member.name} (${member.designation})`,
    description: member.bio,
  };
}

export default async function TeamMemberDetailPage({ params }: TeamDetailPageProps) {
  const member = await getTeamMemberBySlug(params.slug);
  if (!member) {
    notFound();
  }

  // JSON-LD schema for Person structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.designation,
    worksFor: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Madurai",
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
      },
    },
    description: member.bio,
    image: member.avatar_url,
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://example.com"}/team/${member.slug}`,
    sameAs: [member.github_url, member.linkedin_url, member.website_url].filter(
      Boolean
    ),
  };

  return (
    <div className="container py-12 md:py-16 space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back Link */}
      <div>
        <Link
          href="/team"
          className="text-xs font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all team members
        </Link>
      </div>

      {/* Profile Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* Photo Column (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border shadow-md bg-muted">
            <Image
              src={member.avatar_url || "/brand/logo-icon.png"}
              alt={member.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 350px"
              className="object-cover"
            />
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {member.github_url && (
              <a
                href={member.github_url}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                aria-label={`${member.name} on GitHub`}
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                aria-label={`${member.name} on LinkedIn`}
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {member.website_url && (
              <a
                href={member.website_url}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                aria-label={`${member.name} personal website`}
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Bio & Details Column (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{member.designation}</Badge>
              {member.availability_status === "available" ? (
                <Badge variant="success" className="gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Available for new projects
                </Badge>
              ) : member.availability_status === "busy" ? (
                <Badge variant="warning" className="gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  Partially booked
                </Badge>
              ) : (
                <Badge variant="secondary">Currently booked</Badge>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {member.name}
            </h1>
          </div>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {member.bio}
          </p>

          {/* Specializations Tag List */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Core Technical Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
              {member.specializations.map((spec) => (
                <span
                  key={spec}
                  className="px-3 py-1 rounded-md text-xs font-semibold bg-card border border-border text-foreground"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Direct Project Request Action */}
          <div className="pt-4 border-t border-border">
            <Link href={`/dashboard/orders/new?preferredMember=${member.slug}`}>
              <Button size="lg" className="gap-2 font-semibold shadow-md">
                Request {member.name} for your project
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Work Experience Entries Timeline */}
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Experience & Engineering Projects
          </h2>
        </div>

        <div className="space-y-6 border-l-2 border-border pl-6 ml-2">
          {member.experience.map((exp) => (
            <div key={exp.id} className="relative space-y-1.5">
              {/* Dot */}
              <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-background border-2 border-primary" />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-base sm:text-lg text-foreground">
                  {exp.role} •{" "}
                  <span className="text-primary font-medium">
                    {exp.organization}
                  </span>
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatDate(exp.start_date)} -{" "}
                  {exp.is_current ? "Present" : exp.end_date ? formatDate(exp.end_date) : "Completed"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Portfolio Work */}
      {member.selected_projects && member.selected_projects.length > 0 && (
        <div className="space-y-6 max-w-4xl">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Selected Work Led by {member.name.split(" ")[0]}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {member.selected_projects.map((proj) => (
              <Card key={proj.slug} className="overflow-hidden hover:border-primary/50 transition-all">
                <div className="relative aspect-video w-full bg-muted">
                  <Image
                    src={proj.thumbnail_url}
                    alt={proj.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-base line-clamp-1">
                    {proj.title}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Link
                    href={`/portfolio/${proj.slug}`}
                    className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline"
                  >
                    View Project Case Study
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
