# Orvane Works — Engineering-First Digital Studio Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_15-green?logo=supabase)](https://supabase.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E_Tested-orange?logo=playwright)](https://playwright.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit_Tested-yellow?logo=vitest)](https://vitest.dev/)
[![Compliance](https://img.shields.io/badge/DPDP_Act_2023-Ready-success)](#-india-dpdp-act-2023-compliance)

> **Orvane Works** is a production-ready, full-stack digital agency web application crafted for a student-founded freelance engineering studio based in **Madurai, Tamil Nadu, India**.
>
> It pairs an accessible, high-performance public marketing website with a multi-tenant client portal, a student employee workspace, and an executive administrative governance deck.

---

## 🌟 Key Highlights

- **Dynamic, Database-Driven Catalog**: Zero hardcoded services, packages, or portfolio items. Everything is dynamically populated from Supabase PostgreSQL and editable via the Admin Deck.
- **Strict Indian Rupee Localization**: All monetary values are strictly formatted using the Indian Rupee symbol (`₹`) and Lakh/Crore numbering system (`formatINR`).
- **Multi-Tenant Role Architecture**: Role-based access control (`client`, `pending_employee`, `employee`, `admin`) enforced by Edge Middleware, Server Actions, and Postgres Row Level Security (RLS) on 100% of tables.
- **Client Order Lifecycle Hub (`/dashboard`)**: Interactive project tracker featuring an 8-stage visual milestone timeline, itemized quotes, real-time message threads, post-completion reviews, and a secure deliverables vault with time-limited signed URLs.
- **Student Employee Workspace (`/employee`)**: Dedicated hub where approved student engineers and video editors manage assigned projects, advance milestones, upload deliverables, and customize their public team profiles (`/employee/profile`).
- **Admin Governance Deck (`/admin`)**: Command center for reviewing student employee applicants with custom email feedback, reassigning order leads, moderating client reviews, managing CMS content, and monitoring tamper-evident audit logs.
- **Spam & Abuse Defense**: Cloudflare Turnstile token validation on all public forms paired with a database sliding-window rate limiter RPC (`check_rate_limit()`).
- **Transactional Email Engine**: Resend + React Email templates supporting all 5 core studio events: Contact received, Order received, Milestone updated, Employee approved/rejected, and New message alert.
- **DPDP Act 2023 Compliance**: Draft legal terms, explicit consent checkboxes, machine-readable JSON data portability export, and account erasure workflows.
- **Rigorous Quality Standards**: Tested across 3 viewports (**360px Mobile**, **768px Tablet**, **1280px Desktop**), 100% passing Vitest unit tests and Playwright E2E suites.

---

## 🏗️ Architecture & Tech Stack

| Domain | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Components, Server Actions) |
| **Language** | Strict TypeScript (no implicit `any`, zero build errors) |
| **Styling & UI** | Tailwind CSS, shadcn/ui primitives, Framer Motion animations |
| **Database & Auth** | Supabase PostgreSQL 15, GoTrue Auth, Row Level Security (RLS) |
| **Storage** | Supabase Private & Public Storage Buckets |
| **Email** | Resend API + React Email |
| **Spam Protection**| Cloudflare Turnstile |
| **Testing** | Vitest (unit & permission logic) + Playwright (cross-viewport E2E) |

*For deep architectural details, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).*

---

## 📋 Prerequisites

Before setting up Orvane locally or in production, ensure you have:
- **Node.js**: `v18.17.0` or later (Node.js `v20+` recommended)
- **npm**: `v9.0.0+` (or `pnpm` / `yarn`)
- **Supabase Account**: A Supabase project (hosted cloud or local CLI instance)
- **Resend Account**: Free API key for sending transactional emails
- **Cloudflare Turnstile**: Free Turnstile site key & secret key for bot protection

---

## ⚙️ Environment Variables Setup

1. Copy the example configuration to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required credentials:
   ```env
   # Studio Admin Bootstrap Email
   ADMIN_EMAIL="admin@example.com"

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

   # Transactional Email (Resend)
   RESEND_API_KEY="re_your_resend_api_key"
   EMAIL_FROM="Orvane Works <hello@example.com>"
   COMPANY_INBOX="hello@example.com"

   # Public Form Spam Protection (Cloudflare Turnstile)
   NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAyour_site_key"
   TURNSTILE_SECRET_KEY="0x4AAAAAAyour_secret_key"

   # Public Application URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

---

## 🗄️ Supabase Database Setup

Run the SQL migration files in sequence using the **Supabase Dashboard SQL Editor** (or via the Supabase CLI):

1. **Schema & Tables (21 tables)**:
   - Run `supabase/migrations/20261023000001_initial_schema.sql`
2. **Row Level Security (RLS) Policies**:
   - Run `supabase/migrations/20261023000002_rls_policies.sql`
3. **Sliding-Window Rate Limiting RPC**:
   - Run `supabase/migrations/20261023000003_rate_limiting.sql`
4. **Auth Triggers & Role Enforcement**:
   - Run `supabase/migrations/20261023000004_auth_triggers.sql`
5. **Initial Foundational Seed Data**:
   - Run `supabase/seed.sql` to populate services, packages, specializations, and FAQs.

### Storage Buckets Setup
In your Supabase Storage dashboard, create two buckets:
- `public-assets`: Set to **Public** (for team avatars, portfolio media, and service icons).
- `order-deliverables`: Set to **Private** (for client deliverables and project files; access is governed by RLS and served via time-limited signed URLs).

---

## 🔑 Creating the First Administrator

Because Orvane Works prevents regular users from elevating themselves to the `admin` role, you must bootstrap the first administrator using one of the two methods below:

### Method A: Automated CLI Script (Recommended)
1. Sign up for an account through the web interface (e.g., at `http://localhost:3000/login`).
2. Run the bootstrap script with your registered email in `ADMIN_EMAIL`:
   ```bash
   ADMIN_EMAIL="admin@example.com" npm run admin:create
   ```
   *The script automatically verifies the profile and updates the role to `admin` with `active` status.*

### Method B: Supabase SQL Editor
1. Sign up on the web app with your intended admin email.
2. In the Supabase Dashboard, open the **SQL Editor**, open [`supabase/create-first-admin.sql`](supabase/create-first-admin.sql), replace `'admin@example.com'` with your registered email, and execute.

---

## 🚀 Running the Project Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Open in browser
# http://localhost:3000
```

### Production Build & Emulation
```bash
# Type check TypeScript
npm run type-check

# Run ESLint
npm run lint

# Compile production Next.js build
npm run build

# Start production server
npm run start
```

---

## 🧪 Testing Suites

### Unit & Permission Tests (Vitest)
Validates RBAC permission rules, role escalation guards, and INR currency formatting:
```bash
npm run test
```

### End-to-End Tests (Playwright)
Executes cross-viewport flows (**360px Mobile**, **768px Tablet**, and **1280px Desktop**):
```bash
# Ensure server is running or let Playwright spawn it
npm run test:e2e
```

**Tested User Journeys:**
- **Flow 1 (`e2e/client-order-flow.spec.ts`)**: Client registration, route protection, dynamic new order brief submission, 8-step timeline, deliverables vault, and discussions.
- **Flow 2 (`e2e/employee-approval-flow.spec.ts`)**: Student employee application, awaiting approval holding screen, admin approval queue, employee workspace access, and profile editor.
- **Flow 3 (`e2e/contact-flow.spec.ts`)**: Public contact form, Madurai studio location coordinates, and admin inquiry inbox verification.

---

## 🚢 Deploying to Production

### Deploying to Vercel (Recommended)
1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the project in your [Vercel Dashboard](https://vercel.com).
3. Configure the **Environment Variables** matching your `.env.local` keys.
4. Set the build command to `next build` and output directory to default.
5. Deploy! Vercel automatically configures edge locations and ISR caching.

### Deploying to Netlify or Container Platforms
- Ensure Node.js 18.17+ or 20+ runtime is specified.
- Set all environment variables in your deployment dashboard.
- Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g., `https://yourdomain.com`).

---

## 🛡️ India DPDP Act 2023 Compliance

Orvane incorporates privacy-by-design under India's Digital Personal Data Protection Act 2023:
- **Consent Gateways**: Explicit consent checkboxes on all contact and order intake forms.
- **Data Portability**: Registered clients can request an instant JSON export of their account history, active orders, messages, and uploaded assets via `/dashboard/settings`.
- **Right to Erasure**: Clients can trigger an irreversible account anonymization request.
- **Legal Drafts**: Privacy Policy (`/privacy`) and Terms of Service (`/terms`) are explicitly marked *"Draft, pending legal counsel review"*.

---

## 📚 Documentation Index

- 📐 [**System Architecture (`docs/ARCHITECTURE.md`)**](docs/ARCHITECTURE.md): Database ERD, RLS security matrix, rate limiting mechanics, and edge routing.
- 📖 [**Admin Operating Guide (`docs/CONTENT-GUIDE.md`)**](docs/CONTENT-GUIDE.md): CMS management manual for editing services, packages, portfolio, reviews, and approving employees.
- 📋 [**Product Requirements Brief (`docs/BRIEF.md`)**](docs/BRIEF.md): Complete client specification for Orvane Studio.
- 🗺️ [**Master Execution Plan (`docs/PLAN.md`)**](docs/PLAN.md): 9-phase development blueprint and verification criteria.
- 📸 [**Responsive Screenshot Gallery (`docs/screenshots/`)**](docs/screenshots/): Verification screenshots captured across 360px, 768px, and 1280px viewports.

---

## 👥 Studio Credits & Location

- **Studio**: Orvane Works Digital Studio
- **Origin**: Madurai, Tamil Nadu, India
- **Founders**: Engineering Students passionate about software craftsmanship, film pacing, and hardware prototyping.
- **License**: Private & Proprietary. All rights reserved.
