/**
 * Data-Access Layer: Team & Specialist Profiles
 */

import { createClient } from "@/lib/supabase/server";

export interface TeamMember {
  id: string;
  name: string;
  slug: string;
  role: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
  collegeYear?: number;
  institution?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export async function getPublicTeamMembers(): Promise<TeamMember[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("employee_profiles")
      .select(`
        id,
        slug,
        bio,
        college_year,
        institution_name,
        github_url,
        linkedin_url,
        skills,
        profiles (
          full_name,
          avatar_url,
          role
        )
      `)
      .eq("is_public_visible", true);

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      name: item.profiles?.full_name || "Specialist",
      slug: item.slug || item.id,
      role: item.profiles?.role === "admin" ? "Studio Lead" : "Engineer / Editor",
      avatarUrl: item.profiles?.avatar_url || "/brand/logo-icon.png",
      bio: item.bio || "",
      skills: item.skills || [],
      collegeYear: item.college_year,
      institution: item.institution_name,
      githubUrl: item.github_url,
      linkedinUrl: item.linkedin_url,
    }));
  } catch {
    return [];
  }
}

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("employee_profiles")
      .select(`
        id,
        slug,
        bio,
        college_year,
        institution_name,
        github_url,
        linkedin_url,
        skills,
        profiles (
          full_name,
          avatar_url,
          role
        )
      `)
      .eq("slug", slug)
      .eq("is_public_visible", true)
      .single();

    if (error || !data) return null;

    const item: any = data;
    return {
      id: item.id,
      name: item.profiles?.full_name || "Specialist",
      slug: item.slug || item.id,
      role: item.profiles?.role === "admin" ? "Studio Lead" : "Engineer / Editor",
      avatarUrl: item.profiles?.avatar_url || "/brand/logo-icon.png",
      bio: item.bio || "",
      skills: item.skills || [],
      collegeYear: item.college_year,
      institution: item.institution_name,
      githubUrl: item.github_url,
      linkedinUrl: item.linkedin_url,
    };
  } catch {
    return null;
  }
}
