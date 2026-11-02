export function safeNextPath(
  value: string | null | undefined,
  fallback = "/akun",
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}
