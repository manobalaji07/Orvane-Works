import { Star, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { getTestimonials } from "@/lib/data/content";
import { SITE_CONFIG } from "@/lib/constants/site";

export const metadata = {
  title: `Client Testimonials & Reviews | ${SITE_CONFIG.name}`,
  description:
    `Honest client reviews from businesses and startups across Madurai and Tamil Nadu who work with ${SITE_CONFIG.name}.`,
};

export const revalidate = 60;

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="container py-12 md:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <Badge variant="accent">Social Proof</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          What our partners say about working with us.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Every review is submitted directly by clients through their project
          dashboard and published following founder verification.
        </p>
      </div>

      {/* Testimonials Grid or Empty State */}
      {testimonials.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center max-w-xl mx-auto space-y-3">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
          <h3 className="font-semibold text-foreground text-base">Reviews Coming Soon</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Client testimonials submitted after project delivery will appear here following verification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
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
              <CardFooter className="pt-0 border-t border-border/60 p-6">
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
      )}
    </div>
  );
}
