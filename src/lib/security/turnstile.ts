/**
 * Cloudflare Turnstile Server Verification Helper
 */

export async function verifyTurnstileToken(token?: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // In test / dev environments without real Cloudflare keys configured, allow bypass
  if (!secretKey || secretKey === "your-turnstile-secret" || secretKey.startsWith("0x4AAAAAAyour_")) {
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    });

    const data = await res.json();
    return Boolean(data.success);
  } catch (error) {
    console.error("[Turnstile Verification Error]", error);
    return false;
  }
}
