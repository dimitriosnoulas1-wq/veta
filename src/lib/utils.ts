import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(cents: number) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const rem = abs % 100;
  return rem === 0 ? `${sign}$${dollars.toLocaleString("en-US")}` : `${sign}$${dollars.toLocaleString("en-US")}.${String(rem).padStart(2, "0")}`;
}

export function perCredit(credits: number, cents: number) {
  const value = cents / 100 / credits;
  return `$${value.toFixed(4)}`;
}
