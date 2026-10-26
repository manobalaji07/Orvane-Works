import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, CheckCircle2, Clock, Calendar, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTeamMembers } from "@/lib/data/team";
import { SITE_CONFIG } from "@/lib/constants/site";

export const metadata = {
  title: `Meet the Team | ${SITE_CONFIG.name}`,
  description:
    `The engineering students and creative specialists behind ${SITE_CONFIG.name} in Madurai, Tamil Nadu.`,
};

export const revalidate = 60;

function AvailabilityBadge({ status }: { status: "available" | "busy" | "unavailable" }) {
  if (status === "available") {
    return (
      <Badge variant="success" className="gap-1.5 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
        Available for projects
      </Badge>
    );
  }
  if (status === "busy") {
    return (
      <Badge variant="warning" className="gap-1.5 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
        Partially booked
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1.5 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
      Currently booked
    </Badge>
  );
}

export default async function TeamPage() {
  const team = await getTeamMembers();

  return (
    <div className="container py-12 md:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <Badge variant="accent">The Studio Team</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Meet our student engineers and creators.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Every member is an approved specialist in Madurai with deep technical
          focus. You can request specific team members to lead your project.
        </p>
      </div>

      {/* Team Cards Grid or Empty State */}
      {team.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center max-w-xl mx-auto space-y-3">
          <Users className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
          <h3 className="font-semibold text-foreground text-base">Specialist Bench Under Review</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We are currently updating our public directory of student leads and specialists. Verified member profiles will appear here once finalized.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member) => (
            <Card
              key={member.id}
              className="overflow-hidden hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo */}
                <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
                  <Image
                    src={member.avatar_url || "/brand/logo-icon.png"}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <AvailabilityBadge status={member.availability_status} />
                  </div>
                </div>

                <CardHeader className="space-y-1.5">
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <p className="text-xs font-semibold text-primary">
                    {member.designation}
                  </p>
                  <CardDescription className="text-xs line-clamp-3 pt-2 leading-relaxed">
                    {member.bio}
                  </CardDescription>
                </CardHeader>

                {/* Specializations Tags */}
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {member.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-foreground/80 border border-border"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-0 border-t border-border/60 p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Link
                  href={`/team/${member.slug}`}
                  className="text-xs font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
                >
                  View Profile & Experience
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link href={`/dashboard/orders/new?preferredMember=${member.slug}`}>
                  <Button size="sm" className="font-semibold text-xs whitespace-nowrap">
                    Request {member.name.split(" ")[0]}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Join the Team Callout */}
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 md:p-12 text-center max-w-3xl mx-auto space-y-4">
        <Sparkles className="w-8 h-8 text-primary mx-auto" />
        <h3 className="font-display text-2xl font-bold text-foreground">
          Are you an engineering student or creator in Madurai?
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
          We are expanding our team across web engineering, DaVinci video editing,
          and embedded IoT automation. Submit your portfolio to apply.
        </p>
        <Link href="/join">
          <Button size="lg" variant="outline" className="gap-2 font-semibold">
            Apply to Join {SITE_CONFIG.name}
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
