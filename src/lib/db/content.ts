/**
 * Data-Access Layer: CMS Content (Services, Packages, Portfolio, Testimonials, FAQs)
 */

import { createClient } from "@/lib/supabase/server";
import type {
  Service,
  Package,
  PortfolioProject,
  Testimonial,
  FAQ,
} from "@/types/database";

export async function getActiveServices(): Promise<Service[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return data as Service[];
  } catch {
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) return null;
    return data as Service;
  } catch {
    return null;
  }
}

export async function getActivePackages(serviceId?: string): Promise<Package[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (serviceId) {
      query = query.eq("service_id", serviceId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as Package[];
  } catch {
    return [];
  }
}

export async function getFeaturedProjects(): Promise<PortfolioProject[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return data as PortfolioProject[];
  } catch {
    return [];
  }
}

export async function getPublishedProjects(): Promise<PortfolioProject[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return data as PortfolioProject[];
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error || !data) return null;
    return data as PortfolioProject;
  } catch {
    return null;
  }
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return data as Testimonial[];
  } catch {
    return [];
  }
}

export async function getActiveFaqs(): Promise<FAQ[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return data as FAQ[];
  } catch {
    return [];
  }
}
