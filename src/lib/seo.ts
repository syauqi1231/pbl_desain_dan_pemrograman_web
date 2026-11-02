const DEFAULT_SITE_URL = "http://localhost:3000";

export function siteUrl(): string {
  return (process.env.APP_URL?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
