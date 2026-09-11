import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

/** 保留一位小数但不留尾巴：1.0 → "1"，1.25 → "1.3" */
export function trim1(v: number) {
  return (Math.round(v * 10) / 10).toString();
}
