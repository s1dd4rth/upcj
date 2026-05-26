/**
 * Indian locale formatting helpers.
 *
 * All formatting goes through Intl.NumberFormat / Intl.DateTimeFormat — no
 * manual digit grouping or string concatenation.
 */

export function formatINR(amount: number, options: { language?: string } = {}): string {
  const lang = options.language ?? "en-IN";
  return new Intl.NumberFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIndianDate(iso: string, options: { language?: string } = {}): string {
  const lang = options.language ?? "en";
  const d = new Date(iso);
  return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatIndianDateTime(iso: string, options: { language?: string } = {}): string {
  const lang = options.language ?? "en";
  const d = new Date(iso);
  return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}
