/** Shared cookie domain so www and apex hostnames share auth (production). */
export function getCookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== "production") return undefined;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return ".coursemap.live";

  try {
    const host = new URL(appUrl).hostname;
    if (host === "localhost" || host.endsWith(".localhost")) return undefined;
    const parts = host.split(".").filter(Boolean);
    if (parts.length >= 2) {
      return `.${parts.slice(-2).join(".")}`;
    }
  } catch {
    return ".coursemap.live";
  }

  return undefined;
}
