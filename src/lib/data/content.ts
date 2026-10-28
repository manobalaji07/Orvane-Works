import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  full_description: string;
  icon_name: string;
  is_active: boolean;
  display_order: number;
}

export interface PackageItem {
  id: string;
  service_id: string;
  name: string;
  slug: string;
  price_inr: number;
  delivery_time_days: number;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
}

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  service_id?: string;
  service_title?: string;
  client_name: string;
  thumbnail_url: string;
  gallery_urls: string[];
  challenge: string;
  solution: string;
  outcome_metrics: Record<string, string>;
  project_url?: string;
  is_featured: boolean;
  display_order: number;
}

export interface TestimonialItem {
  id: string;
  client_name: string;
  client_role_company: string;
  avatar_url?: string;
  rating: number;
  content: string;
  is_featured: boolean;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
}

// ─── Fallback seed catalog (strictly labelled as demo placeholders) ───────────

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "web-development",
    title: "Web Design & Development",
    short_description:
      "High-conversion, accessible web apps and marketing sites built on Next.js, strict TypeScript, and Supabase.",
    full_description:
      "Full-stack engineering for businesses in Madurai and across India. We specialize in fast-loading, mobile-first architectures with strict WCAG 2.2 accessibility, custom design tokens, private client dashboards, and sub-100ms response times.",
    icon_name: "Code2",
    is_active: true,
    display_order: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "video-editing",
    title: "Video Editing & Reels",
    short_description:
      "Story-driven short-form reels, brand commercials, and high-retention YouTube edits.",
    full_description:
      "Engineered visual pacing for higher audience retention. Complete sound design, professional color grading, motion graphics, and subtitles formatted for Instagram, YouTube Shorts, and LinkedIn campaigns.",
    icon_name: "Video",
    is_active: true,
    display_order: 2,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    slug: "content-creation",
    title: "Content & Brand Assets",
    short_description:
      "Strategic social media carousels, visual branding guidelines, and digital marketing materials.",
    full_description:
      "Strategic brand communication crafted for ambitious Tamil Nadu leaders and remote businesses. Comprehensive typography palettes, layout systems, educational carousels, and visual collateral.",
    icon_name: "Sparkles",
    is_active: true,
    display_order: 3,
  },
];

export const DEFAULT_PACKAGES: PackageItem[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    service_id: "00000000-0000-0000-0000-000000000001",
    name: "Starter Studio Website",
    slug: "starter-website",
    price_inr: 24999,
    delivery_time_days: 7,
    features: [
      "Up to 4 custom responsive pages",
      "Mobile-first 360px layout",
      "Lighthouse 90+ score guarantee",
      "WhatsApp click-to-chat integration",
      "SEO & Open Graph metadata",
    ],
    is_popular: false,
    is_active: true,
    display_order: 1,
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    service_id: "00000000-0000-0000-0000-000000000001",
    name: "Growth Web Platform",
    slug: "growth-platform",
    price_inr: 49999,
    delivery_time_days: 14,
    features: [
      "Up to 10 pages + Client portal",
      "Database-driven content CMS",
      "Turnstile spam-protected forms",
      "Automated transactional emails",
      "Private deliverable storage bucket",
      "30 days post-launch support",
    ],
    is_popular: true,
    is_active: true,
    display_order: 2,
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    service_id: "00000000-0000-0000-0000-000000000002",
    name: "Reels Creator Sprint",
    slug: "reels-sprint",
    price_inr: 14999,
    delivery_time_days: 5,
    features: [
      "8 Short-form Reels / Shorts",
      "Sound design & audio mastering",
      "High-retention captions & pacing",
      "4K Vertical export",
      "2 rounds of revisions included",
    ],
    is_popular: true,
    is_active: true,
    display_order: 1,
  },
  {
    id: "10000000-0000-0000-0000-000000000004",
    service_id: "00000000-0000-0000-0000-000000000003",
    name: "Brand Identity Essentials",
    slug: "brand-identity-essentials",
    price_inr: 18999,
    delivery_time_days: 10,
    features: [
      "Logo mark & icon system",
      "Typography & color design tokens",
      "10 Editable social carousel templates",
      "Business cards & letterheads",
      "Complete vector raw files handoff",
    ],
    is_popular: false,
    is_active: true,
    display_order: 1,
  },
];

export const DEFAULT_PORTFOLIO: PortfolioProject[] = [];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [];

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "60000000-0000-0000-0000-000000000001",
    category: "General",
    question: "Who works on my project at Orvane Works?",
    answer:
      "Your project is built directly by vetted engineering students and specialists in Madurai. An experienced student lead supervises quality and delivery, giving you top-tier craft without corporate markup.",
    display_order: 1,
  },
  {
    id: "60000000-0000-0000-0000-000000000002",
    category: "Services",
    question: "Can I request custom work outside the pre-set packages?",
    answer:
      "Absolutely. Our packages represent starting points. You can submit a custom project brief with your exact budget range in INR (₹) and target deadline.",
    display_order: 2,
  },
  {
    id: "60000000-0000-0000-0000-000000000003",
    category: "Billing",
    question: "How do payments work in Version 1?",
    answer:
      "We issue an itemized quote upon reviewing your scope. In Version 1, payments are made securely via Bank Transfer or UPI and recorded with status receipts inside your Client Portal. Razorpay integration is on our roadmap.",
    display_order: 3,
  },
  {
    id: "60000000-0000-0000-0000-000000000004",
    category: "Hardware",
    question: "When will Hardware & IoT projects be available?",
    answer:
      "Our student R&D team is currently developing custom IoT telemetry firmware and test benches. Join our waitlist to be notified when client intake begins.",
    display_order: 4,
  },
];

// ─── Cached Content Fetchers ──────────────────────────────────────────────────
// unstable_cache wraps each Supabase call so results are stored in the
// Next.js Data Cache and reused across requests until revalidated via tag.
// Admin server actions call revalidateTag('public-content') after mutations.

const CACHE_OPTS = { tags: ["public-content"], revalidate: 300 }; // 5 min max-age

export const getServices = unstable_cache(
  async (): Promise<ServiceItem[]> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (!error && data && data.length > 0) return data as ServiceItem[];
    } catch {}
    return DEFAULT_SERVICES;
  },
  ["services-list"],
  CACHE_OPTS
);

export async function getServiceBySlug(slug: string): Promise<ServiceItem | null> {
  const services = await getServices();
  return services.find((s) => s.slug === slug) || null;
}

export const getPackages = unstable_cache(
  async (): Promise<PackageItem[]> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (!error && data && data.length > 0) return data as PackageItem[];
    } catch {}
    return DEFAULT_PACKAGES;
  },
  ["packages-list"],
  CACHE_OPTS
);

export async function getPackagesByService(serviceId: string): Promise<PackageItem[]> {
  const packages = await getPackages();
  return packages.filter((p) => p.service_id === serviceId);
}

export const getPortfolioProjects = unstable_cache(
  async (): Promise<PortfolioProject[]> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*, services(title)")
        .order("display_order", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          ...d,
          service_title: d.services?.title,
        })) as PortfolioProject[];
      }
    } catch {}
    return DEFAULT_PORTFOLIO;
  },
  ["portfolio-list"],
  CACHE_OPTS
);

export async function getProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  const projects = await getPortfolioProjects();
  return projects.find((p) => p.slug === slug) || null;
}

export const getTestimonials = unstable_cache(
  async (): Promise<TestimonialItem[]> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_approved", true)
        .order("display_order", { ascending: true });
      if (!error && data && data.length > 0) return data as TestimonialItem[];
    } catch {}
    return DEFAULT_TESTIMONIALS;
  },
  ["testimonials-list"],
  CACHE_OPTS
);

export const getFaqs = unstable_cache(
  async (): Promise<FaqItem[]> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (!error && data && data.length > 0) return data as FaqItem[];
    } catch {}
    return DEFAULT_FAQS;
  },
  ["faqs-list"],
  CACHE_OPTS
);
