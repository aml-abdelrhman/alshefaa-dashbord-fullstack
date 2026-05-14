// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format currency */
export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

/** Format large numbers with K/M */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** Truncate string */
export function truncate(str: string, len = 80) {
  return str.length > len ? str.slice(0, len) + "…" : str;
}

/** Generate initials from name */
export function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

/** Sleep promise */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Random between min and max */
export const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** Generate a color from a string (deterministic) */
export function stringToColor(str: string): string {
  const COLORS = [
    "var(--neon-violet)",
    "var(--neon-cyan)",
    "var(--neon-emerald)",
    "var(--neon-rose)",
    "var(--neon-amber)",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}