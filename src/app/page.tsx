import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Video,
  Sparkles,
  Cpu,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  Star,
  MessageCircle,
} from "lucide-react";
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
import { StatusChip } from "@/components/ui/status-chip";
import { SITE_CONFIG } from "@/lib/constants/site";
import {
  getServices,
  getPortfolioProjects,
  getTestimonials,
  getFaqs,
} from "@/lib/data/content";

export const revalidate = 60; // On-demand ISR with 60s fallback cache

export default async function HomePage() {
  const [services, portfolio, testimonials, faqs] = await Promise.all([
    getServices(),
    getPortfolioProjects(),
    getTestimonials(),
    getFaqs(),
  ]);

  const featuredProjects = portfolio.slice(0, 2);
  const featuredTestimonials = testimonials.slice(0, 3);
  const miniFaqs = faqs.slice(0, 3);

  return (
    <div className="flex flex-col gap-20 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 lg:pt-28 pb-10">
        <div className="container relative z-10 flex flex-col items-start gap-6 max-w-4xl">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-vermilion-200 bg-vermilion-50 px-3.5 py-1 text-xs font-semibold text-vermilion-800 dark:border-vermilion-900 dark:bg-vermilion-950 dark:text-vermilion-300">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Madurai, Tamil Nadu • Student Engineering Studio</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08]">
            We craft digital products that make local brands{" "}
            <span className="text-primary underline decoration-vermilion-300/60 underline-offset-8">
              impossible to ignore.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Founded by engineering students in Madurai. We build high-conversion
            websites, cinematic videos, and strategic brand content for
            ambitious businesses across Tamil Nadu and remote clients worldwide.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full sm:w-auto">
            <Link href={SITE_CONFIG.links.contact}>
              <Button size="lg" className="gap-2 w-full sm:w-auto font-semibold">
                Start a project
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href={SITE_CONFIG.links.portfolio}>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-medium"
              >
                Explore selected work
              </Button>
            </Link>
          </div>

          {/* Value Props Strip */}
          <div className="pt-8 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-muted-foreground border-t border-border/80 w-full">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              No corporate overhead
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-emerald-600" />
              24-hour brief turnaround
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Transparent pricing in INR (₹)
            </span>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC SERVICES CATALOGUE */}
      <section className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <Badge variant="accent" className="mb-2">
              Capabilities
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Studio Services
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mt-1 max-w-xl">
              Services are driven from our database catalogue. New capabilities
              appear seamlessly across the site, filters, and order forms.
            </p>
          </div>
          <Link
            href="/services"
            className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:underline underline-offset-4"
          >
            All services & packages
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <Card
              key={svc.id}
              className="hover:border-primary/50 transition-colors flex flex-col justify-between"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-vermilion-50 dark:bg-vermilion-950 flex items-center justify-center text-primary mb-4 border border-vermilion-200 dark:border-vermilion-900">
                  {svc.icon_name === "Code2" && <Code2 className="w-6 h-6" />}
                  {svc.icon_name === "Video" && <Video className="w-6 h-6" />}
                  {svc.icon_name === "Sparkles" && (
                    <Sparkles className="w-6 h-6" />
                  )}
                  {svc.icon_name !== "Code2" &&
                    svc.icon_name !== "Video" &&
                    svc.icon_name !== "Sparkles" && (
                      <Sparkles className="w-6 h-6" />
                    )}
                </div>
                <CardTitle>{svc.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {svc.short_description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Link
                  href={`/services/${svc.slug}`}
                  className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline"
                >
                  Learn more & view packages
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Coming Soon Teaser: Hardware & IoT */}
        <div className="mt-6 rounded-xl border border-dashed border-border p-6 bg-card/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-foreground">
                  Hardware & IoT Prototypes
                </h4>
                <Badge variant="accent" className="text-[10px] py-0">
                  Coming soon
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Microcontroller firmware, sensor telemetry, and automation
                engineering by student specialists.
              </p>
            </div>
          </div>
          <Link href="/hardware">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              Join the waitlist
            </Button>
          </Link>
        </div>
      </section>

      {/* 3. FEATURED WORK & CASE STUDIES */}
      {featuredProjects.length > 0 && (
        <section className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <Badge variant="secondary" className="mb-2">
                Case Studies
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                Selected Work
              </h2>
              <p className="text-muted-foreground text-sm md:text-base mt-1 max-w-xl">
                Real projects delivered for businesses across Madurai and Tamil
                Nadu, engineered for measurable results.
              </p>
            </div>
            <Link
              href="/portfolio"
              className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:underline underline-offset-4"
            >
              Explore all portfolio projects
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredProjects.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full bg-muted overflow-hidden">
                  <Image
                    src={project.thumbnail_url}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{project.service_title}</span>
                    <Badge variant="outline">{project.client_name}</Badge>
                  </div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.challenge}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 flex items-center justify-between border-t border-border/60 p-6">
                  <div className="flex items-center gap-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
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
        </section>
      )}

      {/* 4. WORKFLOW PROCESS */}
      <section className="container py-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-2">
            The Method
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            How We Work
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-2">
            A straightforward process with direct creator communication and zero
            corporate telephone game.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              num: "01",
              title: "Discover & Quote",
              desc: "Submit your requirements. We analyze your scope and issue a fixed, transparent quote in INR (₹) within 24 hours.",
            },
            {
              num: "02",
              title: "Design & Iterate",
              desc: "We build live clickable prototypes and staging previews so you can test before final sign-off.",
            },
            {
              num: "03",
              title: "Refine with Team",
              desc: "Direct communication with assigned student specialists. Fast revisions with no middle managers.",
            },
            {
              num: "04",
              title: "Deliver & Launch",
              desc: "Full code and asset transfer, deployment to your domain, and ongoing technical support.",
            },
          ].map((step) => (
            <div
              key={step.num}
              className="relative rounded-xl border border-border bg-card p-6 flex flex-col gap-3"
            >
              <span className="font-display text-3xl font-bold text-primary/30">
                {step.num}
              </span>
              <h3 className="font-semibold text-base text-foreground">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SOCIAL PROOF & TESTIMONIALS */}
      {featuredTestimonials.length > 0 && (
        <section className="container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="accent" className="mb-2">
              Client Feedback
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Trusted by Leaders in Madurai & Beyond
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTestimonials.map((t) => (
              <Card key={t.id} className="flex flex-col justify-between">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </CardHeader>
                <CardFooter className="pt-0 border-t border-border/60 p-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">
                      {t.client_name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {t.client_role_company}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 6. SHORT FAQ SECTION */}
      <section className="container max-w-3xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-2">
            Questions
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {miniFaqs.map((faq) => (
            <Card key={faq.id}>
              <CardHeader className="py-4">
                <CardTitle className="text-base font-semibold">
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/faq"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            View all frequently asked questions
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 7. CLOSING CALL TO ACTION */}
      <section className="container">
        <div className="rounded-2xl bg-gradient-to-br from-vermilion-900 to-vermilion-950 text-white p-8 md:p-14 text-center flex flex-col items-center gap-6 shadow-xl">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold max-w-2xl leading-tight">
            Have a project in mind? Let&apos;s build it right.
          </h2>
          <p className="text-vermilion-100 max-w-xl text-sm md:text-base leading-relaxed">
            Whether you run a clinic in Madurai, a growing restaurant in Tamil
            Nadu, or an ambitious remote startup, our student engineering studio
            is ready to partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href={SITE_CONFIG.links.contact}>
              <Button
                size="lg"
                className="bg-white text-ink-950 hover:bg-cream-100 font-semibold"
              >
                Send project details
              </Button>
            </Link>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                SITE_CONFIG.whatsappDefaultMessage
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 font-medium"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Us
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
