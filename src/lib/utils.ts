import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Klasslarni xavfsiz va tartibli birlashtiruvchi funksiya
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}