# Orvane Works — Administrator Content & Operations Guide

> **Official Operating Manual for Studio Administrators and Managing Leads**  
> *Orvane Works Digital Studio — Madurai, Tamil Nadu, India*

---

## 1. Introduction & Philosophy

Orvane Works is an engineering-first freelance digital studio founded and operated by engineering students in Madurai, Tamil Nadu. We specialize in high-conversion web development (Next.js, Supabase), paced short-form video editing & reels, strategic brand design assets, and student hardware/IoT prototyping.

### Core Editorial & Studio Standards
1. **Never Invent Facts**: Never fabricate client names, awards, pricing, or past project metrics. Use clearly labelled placeholders when drafting unpublished content.
2. **Transparent Indian Rupee Pricing**: All client-facing currency is strictly formatted in Indian Rupees using the standard symbol (`₹`) and Lakh/Crore numbering conventions (`formatINR`).
3. **Database-Driven Content**: Every public service, package, portfolio item, team member profile, and testimonial is dynamically queried from Supabase PostgreSQL. Sections with no content automatically hide until real content is added. Changes made in the Admin Governance Deck immediately reflect across the public website via Next.js on-demand ISR.
4. **Privacy & DPDP Act 2023 Compliance**: Client inquiries and order briefs are confidential. Private deliverable files are secured in restricted Supabase storage buckets and accessible only via time-limited signed URLs.

---

## 2. Accessing the Admin Governance Deck

The Admin Governance Deck is located at:
```
https://<your-domain>/admin
(Local development: http://localhost:3000/admin)
```

### Access Control & Security
- **Role Requirement**: You must have an account with `role = 'admin'` and `status = 'active'`.
- Non-admin users attempting to access `/admin` are immediately redirected to `/login` with an unauthorized notice.
- **Route Protection**: Enforced both at the edge via `src/middleware.ts` and at the database layer via PostgreSQL Row Level Security (`public.is_admin()`).

---

## 3. Deck Navigation & Capabilities

The Admin Governance Deck is divided into 6 integrated operational hubs:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Admin Governance Deck                           │
├─────────────┬─────────────┬─────────────┬─────────────┬────────┬───────┤
│ 1. Overview │ 2. Employee │  3. Global  │ 4. Contact  │ 5. CMS │ 6. Log│
│  & Revenue  │    Queue    │   Orders    │  & Hardware │ Content│ Audit │
└─────────────┴─────────────┴─────────────┴─────────────┴────────┴───────┘
```

---

## 4. Managing Dynamic Services & Packages

Orvane has **zero hardcoded service offerings**. The public navigation, `/services`, and `/packages` pages dynamically render database records.

### Adding or Updating a Service
1. Navigate to **CMS Content** -> **Services**.
2. Fill in the service details:
   - **Title**: Clean descriptive title (e.g., `Web Design & Development`, `Video Editing & Reels`, `Content & Brand Assets`).
   - **Slug**: URL-friendly identifier (e.g., `web-development`, `video-editing`). Must be lowercase and hyphenated.
   - **Short Description**: 1-2 sentence hook displayed on homepage feature cards.
   - **Full Description**: Detailed technical narrative shown on `/services/[slug]`.
   - **Icon Name**: Valid Lucide icon string (e.g., `Code2`, `Video`, `Sparkles`, `Cpu`, `Layers`).
   - **Display Order**: Integer determining sequence on public pages (1, 2, 3, etc.).
   - **Active Status**: Toggle off to immediately hide a service without deleting data.

### Defining Service Packages
1. Select the parent service.
2. Click **Add Package** and enter:
   - **Package Name**: E.g., `Starter Studio Website`, `Reels Creator Sprint`.
   - **Slug**: Hyphenated URL slug.
   - **Price (INR)**: Baseline starting price in Indian Rupees (e.g., `24999.00`).
   - **Delivery Time (Days)**: Turnaround SLA in calendar days (e.g., `7`, `14`).
   - **Features List**: A JSON array of bullet points displayed on pricing cards:
     ```json
     [
       "Up to 4 custom pages",
       "Mobile-first 360px layout",
       "Lighthouse 90+ score",
       "WhatsApp click-to-chat",
       "SEO & Open Graph tags"
     ]
     ```
   - **Popular Badge**: Check this to add the golden "Most Popular" highlight pill.
   - **Display Order**: Order within the service tier.

---

## 5. Portfolio Case Studies & Client Showcase

Showcase real projects at `/portfolio`. Sections are automatically hidden if no projects exist.

### Creating a Case Study
- **Title**: Project name (e.g., `Artisan Coffee E-Commerce Platform`).
- **Slug**: URL slug for `/portfolio/[slug]`.
- **Client Name**: Business name or client organization.
- **Category**: `Web Development`, `Video Editing`, `Branding`, or `Hardware / IoT`.
- **Description**: Summary of the client's problem, engineering strategy, and final outcome.
- **Key Metrics**: Quantifiable results (e.g., `["+180% Reel Engagement", "0.8s LCP on Mobile", "₹2.4L Month-1 GMV"]`).
- **Technologies Used**: Array of chips (e.g., `["Next.js", "Tailwind CSS", "Supabase", "DaVinci Resolve"]`).
- **Hero Image URL & Gallery**: High-resolution screenshots or video poster URLs.
- **Is Featured**: Toggle on to display on the public homepage showcase carousel.

---

## 6. Student Employee Applications & Hub Governance

Orvane empowers students from Madurai engineering colleges to gain real-world client experience.

### Reviewing Applicant Join Requests
When a student registers as a team applicant (`role = 'pending_employee'`), they are held at `/awaiting-approval` and cannot access internal orders.

1. Open the **Employee Queue** tab.
2. Review applicant dossier:
   - Full Name, Email, Phone number
   - College / Institution (e.g., `Thiagarajar College of Engineering`, `Anna University`)
   - Department & Expected Graduation Year
   - Portfolio URL / GitHub / LinkedIn
   - Cover Note explaining their engineering or design skillset
3. Actions:
   - **Approve**: Immediately promotes user to `role = 'employee'`.
     - Automatically generates an employee profile entry in `employee_profiles`.
     - Sends automated welcome email with access link to the `/employee` Hub.
   - **Reject**: Marks account status as `rejected` and prompts for optional constructive feedback sent via transactional email.

### Managing Team Profiles (`/team`)
Approved employees edit their own bio, avatar, skills, and portfolio links at `/employee/profile`. Admins can:
- Toggle `is_public` to control visibility in the public `/team` directory.
- Assign specialized tags (e.g., `Frontend Engineering`, `Motion Graphics`, `Design Systems`).
- Feature standout student contributors on the studio landing page.

---

## 7. Global Order Management & Workflow Pipeline

Manage all client projects from initial brief to final delivery and sign-off.

### The 8-Step Order Lifecycle
Every order follows a strict visual milestone progression visible to the client at `/dashboard/orders/[orderNumber]`:

```
1. brief_submitted ──────► 2. quote_sent ──────► 3. quote_accepted ──────► 4. deposit_paid
                                                                                 │
8. completed       ◄────── 7. final_payment_pending ◄── 6. awaiting_feedback ◄── 5. in_progress
```

### Order Actions
1. **Assigning Engineers & Editors**:
   - Reassign the primary project lead or collaborating editors via the order assignment dropdown.
2. **Issuing Quotes**:
   - Update `quote_amount_inr` and specify deliverables breakdown.
   - Client is notified by email and prompted to review and approve the quote in their dashboard.
3. **Internal Team Notes**:
   - Add yellow-badged internal notes on any order. These are **strictly confidential** and invisible to the client.
4. **Recording Manual Payments**:
   - Open an order and scroll to the **Payments** panel below the governance workbench.
   - Click **Record New Payment**.
   - Fill in: Amount (₹), Date Received, Payment Type (Advance / Balance / Full), Method (UPI / Bank Transfer / Cash / Other), and optionally the UTR / transaction reference and an internal note.
   - Click **Record Payment**. The system will:
     - Save the payment to the `order_payments` table.
     - Auto-recalculate the order's payment status (Invoiced → Advance Received → Partially Paid → Paid in Full).
     - Send a payment confirmation email to the client.
   - To **void** a payment (e.g. duplicate entry, refund): click **Void** next to the entry, enter a reason, and confirm. The payment is soft-deleted; the balance is recalculated automatically.
   - **What the client sees**: Amount, type, and date — UTR references and internal notes are hidden.
5. **Deliverables Vault**:
   - When milestones are ready, upload deliverables to Supabase private storage.
   - The system generates signed, time-limited download URLs for the client.
5. **Advancing Milestones**:
   - Progress status from `in_progress` -> `awaiting_feedback` -> `final_payment_pending` -> `completed`.
   - Each transition triggers an automated email update to the client.

---

## 8. Client Inquiries & Hardware Waitlist

Public inquiries received through the website are aggregated in the **Inquiries Hub**.

### Contact Form Messages
- Captures visitor name, email, phone, company, service requested, budget range, and project brief.
- Protected by Cloudflare Turnstile bot verification and database rate limiting.
- Statuses: `new`, `contacted`, `converted_to_order`, `archived`.

### Hardware & IoT Prototyping Waitlist
- Captures inquiries for student-built IoT devices, embedded systems, sensors, and hardware prototypes.
- Includes target hardware platform (e.g., ESP32, Raspberry Pi, Custom PCB), timeline, and technical requirements.
- Admins can export waitlist contacts or contact candidates directly.

---

## 9. Client Reviews & Moderation Queue

To maintain brand integrity and trust:
- After an order reaches `completed`, clients are prompted to submit a review with 1 to 5 stars and written feedback.
- All new reviews enter the queue with `is_approved = false`.
- **Review Moderation**:
  - Review feedback in the CMS tab.
  - Check **Approve** to publish the review on `/testimonials`.
  - Check **Featured** to pin the testimonial to the homepage review slider.

---

## 10. Audit Log & Security Compliance

Every sensitive action performed in the system is logged to the `audit_logs` table:
- User role promotions and status changes
- Order status progressions and quote updates
- Deliverable uploads and file deletions
- Client DPDP data export requests and account erasure requests

Admins can review the immutable audit log stream at any time to verify compliance and operational integrity.
