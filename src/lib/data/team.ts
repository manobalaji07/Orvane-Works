import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ExperienceEntry {
  id: string;
  role: string;
  organization: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  description: string;
  display_order: number;
}

export interface TeamMember {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  avatar_url?: string;
  designation: string;
  bio: string;
  availability_status: "available" | "busy" | "unavailable";
  is_featured: boolean;
  display_order: number;
  is_published: boolean;
  specializations: string[];
  experience: ExperienceEntry[];
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  selected_projects?: {
    title: string;
    slug: string;
    thumbnail_url: string;
  }[];
}

export const DEFAULT_TEAM_MEMBERS: TeamMember[] = [];

// Cache team data — 5-minute TTL, tag: "public-content"
export const getTeamMembers = unstable_cache(
  async (): Promise<TeamMember[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("employee_profiles")
        .select("*, profiles(full_name, avatar_url)")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          ...d,
          name: d.profiles?.full_name || "Specialist",
          avatar_url: d.profiles?.avatar_url || "",
          specializations: d.specializations || [],
          experience: d.experience || [],
        }));
      }
    } catch {}
    return DEFAULT_TEAM_MEMBERS;
  },
  ["team-members-list"],
  { tags: ["public-content"], revalidate: 300 }
);

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | null> {
  const members = await getTeamMembers();
  return members.find((m) => m.slug === slug) || null;
}
