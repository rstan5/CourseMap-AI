/** Shared cookie domain so www and apex hostnames share auth (production). */
export function getCookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== "production") return undefined;

  if (process.env.COOKIE_DOMAIN) {
    const domain = process.env.COOKIE_DOMAIN.trim();
    return domain.startsWith(".") ? domain : `.${domain}`;
  }

  const urlCandidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter(Boolean) as string[];

  for (const url of urlCandidates) {
    try {
      const host = new URL(url).hostname;
      if (host === "localhost" || host.endsWith(".localhost")) continue;
      const parts = host.split(".").filter(Boolean);
      if (parts.length >= 2) {
        return `.${parts.slice(-2).join(".")}`;
      }
    } catch {
      continue;
    }
  }

  return ".coursemap.live";
}
