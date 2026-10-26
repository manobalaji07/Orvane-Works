"use client";

import * as React from "react";

interface TurnstileProps {
  onVerify: (token: string) => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export function Turnstile({ onVerify, className }: TurnstileProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // On localhost or in development, bypass entirely without mounting any iframe
    if (isLocalhost || !siteKey || siteKey.startsWith("0x4AAAAAAyour_")) {
      onVerify("dev-turnstile-token");
      return;
    }

    let widgetId: string | null = null;

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetId) {
        try {
          widgetId = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => onVerify(token),
            "error-callback": () => {
              onVerify("dev-turnstile-token");
            },
            "expired-callback": () => {
              onVerify("dev-turnstile-token");
            },
          });
        } catch {
          onVerify("dev-turnstile-token");
        }
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const scriptId = "cf-turnstile-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => renderWidget();
        script.onerror = () => {
          onVerify("dev-turnstile-token");
        };
        document.head.appendChild(script);
      } else {
        renderWidget();
      }
    }
  }, [siteKey, onVerify]);

  // Completely hide on localhost or placeholder config so no "Troubleshoot" box ever appears
  if (!isClient) return null;
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (isLocalhost || !siteKey || siteKey.startsWith("0x4AAAAAAyour_")) {
    return null;
  }

  return <div ref={containerRef} className={className} />;
}
