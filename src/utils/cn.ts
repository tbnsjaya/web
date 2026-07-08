import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility untuk menggabungkan class Tailwind secara aman
 * Menghindari konflik class (misal: bg-red-500 dan bg-blue-500)
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-orange-500", "text-sm")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
