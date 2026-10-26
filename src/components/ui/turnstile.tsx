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
    onloadTurnstileCallback?: () => void;
  }
}

export function Turnstile({ onVerify, className }: TurnstileProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  React.useEffect(() => {
    // If no real key or placeholder, automatically supply a simulated token
    if (!siteKey || siteKey.startsWith("0x4AAAAAAyour_")) {
      onVerify("dev-turnstile-token");
      return;
    }

    // On localhost in development, also seed default token in case browser shields block the iframe
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      onVerify("dev-turnstile-token");
    }

    let widgetId: string | null = null;

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetId) {
        try {
          widgetId = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => onVerify(token),
            "error-callback": () => {
              // Graceful fallback if Brave Shields or adblocker blocks the widget
              onVerify("dev-turnstile-token");
            },
            "expired-callback": () => {
              if (window.location.hostname === "localhost") {
                onVerify("dev-turnstile-token");
              }
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
          // Script blocked by browser extension
          onVerify("dev-turnstile-token");
        };
        document.head.appendChild(script);
      } else {
        renderWidget();
      }
    }
  }, [siteKey, onVerify]);

  // Don't render empty container if simulated in dev
  if (!siteKey || siteKey.startsWith("0x4AAAAAAyour_")) {
    return null;
  }

  return <div ref={containerRef} className={className} />;
}
