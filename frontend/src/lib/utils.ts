import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shorten property display names by removing common suffixes.
 * "Oakwood Apartments" → "Oakwood", "Riverside Commons" → "Riverside"
 */
export function shortenPropertyName(name: string): string {
  return name.replace(" Apartments", "").replace(" Commons", "");
}

/**
 * Format a dollar amount compactly.
 * ≥10K → "$150K", ≥1K → "$1.2K", <1K → "$800"
 */
export function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(0)}K`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}
