import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  turnstileToken: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const clientSignupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please provide a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  phone: z
    .string()
    .regex(/^[+0-9\s-]{10,15}$/, "Please enter a valid phone number (10-15 digits).")
    .optional()
    .or(z.literal("")),
  turnstileToken: z.string().optional(),
});

export type ClientSignupInput = z.infer<typeof clientSignupSchema>;

export const joinTeamSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please provide a valid college or personal email."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  phone: z
    .string()
    .min(10, "Phone number is required for WhatsApp coordination."),
  portfolioUrl: z
    .string()
    .url("Please provide a valid URL (GitHub, Behance, YouTube, or portfolio).")
    .optional()
    .or(z.literal("")),
  resumeUrl: z
    .string()
    .url("Please provide a valid link to your resume/CV.")
    .optional()
    .or(z.literal("")),
  skills: z
    .array(z.string())
    .min(1, "Please select or list at least one engineering or creative skill."),
  turnstileToken: z.string().optional(),
  coverNote: z
    .string()
    .min(30, "Please tell us briefly about your engineering background and why you want to join Orvane Works (at least 30 characters)."),
});

export type JoinTeamInput = z.infer<typeof joinTeamSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
