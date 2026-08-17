import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format numeric value with dot thousand separators (Indonesian locale)
 * Example: 4800000 -> "4.800.000"
 */
export function formatThousandDots(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return ''
  if (val === 0 || val === '0') return '0'
  const cleanStr = String(val).replace(/\D/g, '')
  if (!cleanStr) return ''
  return parseInt(cleanStr, 10).toLocaleString('id-ID')
}

/**
 * Parse a dot-formatted string into clean integer
 * Example: "4.800.000" -> 4800000
 */
export function parseThousandDots(str: string | undefined | null): number {
  if (!str) return 0
  const cleanStr = String(str).replace(/\D/g, '')
  return parseInt(cleanStr, 10) || 0
}
