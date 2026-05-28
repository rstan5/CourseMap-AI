/** Parse and merge Set-Cookie headers (JWT-safe). */
export function mergeSetCookies(existing, setCookieHeaders) {
  const jar = {};
  for (const part of existing.split("; ").filter(Boolean)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    jar[part.slice(0, eq)] = part.slice(eq + 1);
  }
  for (const header of setCookieHeaders) {
    const pair = header.split(";")[0];
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    jar[pair.slice(0, eq)] = pair.slice(eq + 1);
  }
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}
