import type { Metadata } from "next";
import { fontSans, fontDisplay, fontTamil } from "@/app/fonts";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { SITE_CONFIG } from "@/lib/constants/site";

const siteBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: {
    default: `${SITE_CONFIG.name} | Student-Founded Freelance Studio in Madurai`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "freelance studio Madurai",
    "web development Madurai",
    "video editing Tamil Nadu",
    "content creation India",
    "student engineering studio",
    "Next.js web agency",
  ],
  authors: [{ name: SITE_CONFIG.name, url: siteBaseUrl }],
  creator: SITE_CONFIG.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteBaseUrl,
    title: `${SITE_CONFIG.name} | Student-Founded Freelance Studio in Madurai`,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} | Student-Founded Freelance Studio in Madurai`,
    description: SITE_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for Google Search
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE_CONFIG.name,
  image: `${siteBaseUrl}/og-image.png`,
  description: SITE_CONFIG.description,
  url: siteBaseUrl,
  telephone: SITE_CONFIG.phone,
  email: SITE_CONFIG.email,
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Madurai Hub",
    addressLocality: "Madurai",
    addressRegion: "Tamil Nadu",
    postalCode: "625020",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 9.9252,
    longitude: 78.1198,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "09:00",
      closes: "20:00",
    },
  ],
  sameAs: [
    SITE_CONFIG.socials.instagram,
    SITE_CONFIG.socials.linkedin,
    SITE_CONFIG.socials.youtube,
    SITE_CONFIG.socials.github,
  ].filter(Boolean),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} ${fontTamil.variable} font-sans min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Accessible Skip Link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 rounded-md bg-primary px-4 py-2 text-white font-semibold shadow-lg"
          >
            Skip to main content
          </a>

          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
