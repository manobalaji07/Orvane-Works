-- Orvane Works Database Seed Script
-- Realistic foundational data for development and testing

-- Seed Services
insert into public.services (id, slug, title, short_description, full_description, icon_name, is_active, display_order)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'web-development',
    'Web Design & Development',
    'High-conversion, accessible web apps and marketing sites built on Next.js and Supabase.',
    'Full-stack engineering for businesses in Madurai and across India. We specialize in fast-loading, mobile-first architectures with strict accessibility, custom design tokens, and private client dashboards.',
    'Code2',
    true,
    1
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'video-editing',
    'Video Editing & Reels',
    'Paced, high-retention short-form reels, brand commercials, and documentary-style YouTube edits.',
    'Engineered visual pacing for higher audience retention. Complete sound design, professional color grading, motion graphics, and subtitles formatted for Instagram, YouTube Shorts, and LinkedIn.',
    'Video',
    true,
    2
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'content-creation',
    'Content & Brand Assets',
    'Social media carousels, brand visual identity, and print-ready digital marketing assets.',
    'Strategic brand communication crafted for Tamil Nadu leaders and remote clients. Comprehensive typography palettes, layout systems, social media carousels, and visual collateral.',
    'Sparkles',
    true,
    3
  )
on conflict (slug) do nothing;

-- Seed Packages ("Starting from ₹")
insert into public.packages (id, service_id, name, slug, price_inr, delivery_time_days, features, is_popular, is_active, display_order)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Starter Studio Website',
    'starter-website',
    24999.00,
    7,
    '["Up to 4 custom pages", "Mobile-first 360px layout", "Lighthouse 90+ score", "WhatsApp click-to-chat", "SEO & Open Graph tags"]'::jsonb,
    false,
    true,
    1
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Growth Web Platform',
    'growth-platform',
    49999.00,
    14,
    '["Up to 10 pages + Client portal", "Database-driven content", "Turnstile spam-protected forms", "Automated email confirmations", "Private file downloads", "30 days post-launch support"]'::jsonb,
    true,
    true,
    2
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'Reels Creator Sprint',
    'reels-sprint',
    14999.00,
    5,
    '["8 Short-form Reels / Shorts", "Sound effects & audio mastering", "High-retention captions", "4K Vertical export", "2 rounds of revisions"]'::jsonb,
    true,
    true,
    1
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    'Brand Identity Essentials',
    'brand-identity-essentials',
    18999.00,
    10,
    '["Logo marks & icon system", "Typography & color token guide", "10 Editable social templates", "Business cards & letterheads", "Vector raw files transfer"]'::jsonb,
    false,
    true,
    1
  )
on conflict (slug) do nothing;

-- Seed Specializations
insert into public.specializations (id, name, slug)
values
  ('20000000-0000-0000-0000-000000000001', 'Frontend Engineering', 'frontend-engineering'),
  ('20000000-0000-0000-0000-000000000002', 'Next.js & React', 'nextjs-react'),
  ('20000000-0000-0000-0000-000000000003', 'Motion Graphics', 'motion-graphics'),
  ('20000000-0000-0000-0000-000000000004', 'Short-form Storytelling', 'short-form-storytelling'),
  ('20000000-0000-0000-0000-000000000005', 'Design Systems', 'design-systems'),
  ('20000000-0000-0000-0000-000000000006', 'Database Architecture', 'database-architecture')
on conflict (slug) do nothing;

-- Seed FAQs
insert into public.faqs (id, category, question, answer, display_order, is_active)
values
  (
    '30000000-0000-0000-0000-000000000001',
    'General',
    'Who is behind Orvane Works?',
    'Orvane Works is founded and operated by engineering students based in Madurai, Tamil Nadu. We combine academic engineering discipline with modern, production-grade digital design and development.',
    1,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'Workflow',
    'How do quotes and billing work?',
    'All quotes are provided transparently in Indian Rupees (₹). Once we review your brief, we issue an itemized estimate with deliverables and milestones. Payments are handled via direct bank transfer or UPI and tracked manually in your client dashboard.',
    2,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    'Team',
    'Can I request a specific student engineer or editor for my project?',
    'Yes! Our public Team directory highlights member specialties, past work, and availability. You can click "Request for project" directly from their profile to start an order with them pre-assigned.',
    3,
    true
  )
on conflict do nothing;
