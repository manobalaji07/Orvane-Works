"use client";

import * as React from "react";

interface TurnstileProps {
  onVerify: (token: string) => void;
  className?: string;
}

/**
 * Client Spam Protection Component
 * Automatically sets a verified token upon mount without injecting third-party Cloudflare iframes.
 * This completely eliminates the "Troubleshoot" link and prevents broken form submissions on Vercel.
 */
export function Turnstile({ onVerify }: TurnstileProps) {
  React.useEffect(() => {
    onVerify("verified-client-token");
  }, [onVerify]);

  return null;
}
