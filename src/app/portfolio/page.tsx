import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPortfolioProjects, getServices } from "@/lib/data/content";
import { SITE_CONFIG } from "@/lib/constants/site";

export const metadata = {
  title: `Case Studies & Work | ${SITE_CONFIG.name}`,
  description:
    `Explore digital products and cinematic videos engineered by student specialists at ${SITE_CONFIG.name} in Madurai.`,
};

export const revalidate = 60;

export default async function PortfolioPage() {
  const [projects, services] = await Promise.all([
    getPortfolioProjects(),
    getServices(),
  ]);

  return (
    <div className="container py-12 md:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <Badge variant="accent">Proof of Work</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Case Studies & Client Deliverables
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Explore measurable digital products and creative assets engineered for
          clinics, retailers, restaurants, and startups across Tamil Nadu.
        </p>
      </div>

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center max-w-xl mx-auto space-y-3">
          <Sparkles className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
          <h3 className="font-semibold text-foreground text-base">Case Studies Coming Soon</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Client engagement case studies and verified performance metrics will be published here upon completion of active projects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="overflow-hidden hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full bg-muted overflow-hidden">
                <Image
                  src={project.thumbnail_url}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-primary">
                    {project.service_title}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {project.client_name}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-1">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 leading-relaxed">
                  {project.challenge}
                </CardDescription>
              </CardHeader>

              <CardFooter className="pt-0 border-t border-border/60 p-6 flex items-center justify-between">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {Object.entries(project.outcome_metrics)[0] && (
                    <span>
                      {Object.entries(project.outcome_metrics)[0][0]}:{" "}
                      {Object.entries(project.outcome_metrics)[0][1]}
                    </span>
                  )}
                </div>
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline"
                >
                  Read Case Study
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
