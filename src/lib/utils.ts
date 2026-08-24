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

export function timeAgo(dateString: string | Date): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Baru saja'
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit yang lalu`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam yang lalu`
  
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari yang lalu`
  
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} minggu yang lalu`
  
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} bulan yang lalu`
  
  return `${Math.floor(days / 365)} tahun yang lalu`
}

/**
 * Calculate tiered overtime pay according to Kepmenakertrans No. 102/2004
 * - Jam Kerja Reguler: Jam ke-1 x 1.5, Jam ke-2 dst x 2.0
 * - Hari Libur/Istirahat: 8 jam pertama x 2.0, jam ke-9 x 3.0, jam ke-10 dst x 4.0
 */
export function calculateTieredOvertimePay(
  hourlyRate: number,
  overtimeHours: number,
  isHoliday: boolean = false
): { totalPay: number, breakdown: { hours: number, multiplier: number, amount: number }[] } {
  if (overtimeHours <= 0) return { totalPay: 0, breakdown: [] }

  const breakdown: { hours: number, multiplier: number, amount: number }[] = []
  let remaining = overtimeHours
  let totalPay = 0

  if (!isHoliday) {
    // Regular workday overtime
    const firstHour = Math.min(1, remaining)
    if (firstHour > 0) {
      const amount = firstHour * 1.5 * hourlyRate
      breakdown.push({ hours: firstHour, multiplier: 1.5, amount })
      totalPay += amount
      remaining -= firstHour
    }

    if (remaining > 0) {
      const amount = remaining * 2.0 * hourlyRate
      breakdown.push({ hours: remaining, multiplier: 2.0, amount })
      totalPay += amount
    }
  } else {
    // Holiday/Weekend overtime
    const first8 = Math.min(8, remaining)
    if (first8 > 0) {
      const amount = first8 * 2.0 * hourlyRate
      breakdown.push({ hours: first8, multiplier: 2.0, amount })
      totalPay += amount
      remaining -= first8
    }

    const ninthHour = Math.min(1, remaining)
    if (ninthHour > 0) {
      const amount = ninthHour * 3.0 * hourlyRate
      breakdown.push({ hours: ninthHour, multiplier: 3.0, amount })
      totalPay += amount
      remaining -= ninthHour
    }

    if (remaining > 0) {
      const amount = remaining * 4.0 * hourlyRate
      breakdown.push({ hours: remaining, multiplier: 4.0, amount })
      totalPay += amount
    }
  }

  return { totalPay, breakdown }
}
