import { Shield, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SITE_CONFIG } from "@/lib/constants/site";

export const metadata = {
  title: `Privacy Policy (DPDP Draft) | ${SITE_CONFIG.name}`,
  description:
    `Privacy Policy draft for ${SITE_CONFIG.name}, prepared in alignment with India's Digital Personal Data Protection (DPDP) Act 2023.`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12 md:py-16 max-w-4xl space-y-10">
      {/* Notice Banner */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/60 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong className="block font-semibold mb-0.5">
            Legal Status: Draft, Needs Lawyer Review
          </strong>
          This document is drafted with India&apos;s Digital Personal Data
          Protection (DPDP) Act, 2023 in mind. It outlines our operational
          commitments to consent, purpose limitation, retention, and deletion on
          request.
        </div>
      </div>

      <div className="space-y-3">
        <Badge variant="accent">Data Governance</Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted-foreground">
          Last Updated: October 2026 • Madurai, Tamil Nadu, India
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-muted-foreground space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Introduction</h2>
          <p>
            {SITE_CONFIG.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;)
            is a freelance digital engineering studio founded by students in
            Madurai, Tamil Nadu. We respect the privacy of every client, visitor,
            and applicant, and we process personal data in accordance with the
            Digital Personal Data Protection (DPDP) Act, 2023 of India.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">
            2. Personal Data We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Client Identification:</strong> Full name, business email,
              phone/WhatsApp number, and project briefs.
            </li>
            <li>
              <strong>Employee Applicants:</strong> Resume links, portfolio links,
              specializations, and engineering motivation notes.
            </li>
            <li>
              <strong>Public Inquiries:</strong> Contact messages, service interest,
              and hardware waitlist entries.
            </li>
            <li>
              <strong>Project Files:</strong> Reference files and deliverables stored
              in private, authenticated storage buckets with signed URLs.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">
            3. Purpose of Processing (Purpose Limitation)
          </h2>
          <p>
            We process your personal data exclusively for the following specified
            purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Delivering contracted web development, video, and content assets.</li>
            <li>Issuing itemized quotes in Indian Rupees (₹).</li>
            <li>Direct communication with assigned student leads.</li>
            <li>Reviewing student applications for team admittance.</li>
            <li>Fulfilling statutory tax and legal recordkeeping in India.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">
            4. Consent & Withdrawal
          </h2>
          <p>
            By submitting an inquiry, creating a client account, or applying to
            join the studio, you provide affirmative consent for us to process your
            data for the stated purpose. You may withdraw consent at any time by
            contacting {SITE_CONFIG.email} or deleting your account from your Client
            Portal settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">
            5. Right to Erasure & Deletion
          </h2>
          <p>
            Under the DPDP Act, clients and applicants may request complete deletion
            of their personal profile, uploaded project references, and contact
            records. Account deletion can be triggered self-service from your Client
            Portal or by emailing our Data Grievance Lead at {SITE_CONFIG.email}.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">
            6. Analytics & Cookies
          </h2>
          <p>
            We prioritize privacy-friendly, cookieless telemetry. Any analytics are
            strictly performance-oriented and disabled by default.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">
            7. Grievance Redressal
          </h2>
          <p>
            For any questions, concerns, or data requests under Indian law, contact
            our Data Protection Lead:
          </p>
          <p className="font-semibold text-foreground">
            {SITE_CONFIG.name} • Data Protection Lead
            <br />
            Email: {SITE_CONFIG.email}
            <br />
            Madurai, Tamil Nadu 625020, India
          </p>
        </section>
      </div>
    </div>
  );
}
