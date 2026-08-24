import type { Employee } from '@/store/useHRStore'
import type { BranchInfo } from './branches'

export interface RosterViolation {
  id: string
  type: 'unavailability' | 'fatigue_rest' | 'station_understaffed' | 'overtime_risk'
  employeeId: number
  employeeName: string
  dayIdx: number
  dayName: string
  description: string
  suggestedFix: string
  suggestedEmployeeId?: number
  suggestedEmployeeName?: number | string
}

export interface RosterHealthReport {
  overallScore: number // 0-100
  fairnessScore: number // 0-100
  stationCoverageScore: number // 0-100
  fatigueSafetyScore: number // 0-100
  laborCostEfficiencyScore: number // 0-100
  uuComplianceScore: number // 0-100
  violations: RosterViolation[]
  estimatedWeeklyLaborCost: number
  targetWeeklyRevenue: number
  laborCostRatio: number
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

/**
 * Audits full roster health and checks multi-constraint violations
 */
export function auditRosterHealth(
  shifts: Record<number, string[]>,
  employees: Employee[],
  branch: BranchInfo
): RosterHealthReport {
  const violations: RosterViolation[] = []
  let totalFatigueViolations = 0
  let totalUnavailViolations = 0
  let totalStationCoverageIssues = 0
  let totalOtRiskCount = 0

  // 1. Check Unavailability & Fatigue per Employee
  employees.forEach(emp => {
    const empShifts = shifts[emp.id] || Array(7).fill('OFF')
    const activeShiftCount = empShifts.filter(s => s === 'Pagi' || s === 'Sore' || s === 'Closing').length
    const weeklyHours = activeShiftCount * 8

    if (weeklyHours >= 40) {
      totalOtRiskCount++
      violations.push({
        id: `ot-${emp.id}`,
        type: 'overtime_risk',
        employeeId: emp.id,
        employeeName: emp.name,
        dayIdx: 6,
        dayName: 'Minggu',
        description: `Beban kerja ${weeklyHours} jam/minggu mencapai batas maksimum regulasi (40 jam).`,
        suggestedFix: 'Kurangi 1 penugasan shift dan alihkan ke staf part-time.'
      })
    }

    empShifts.forEach((shift, dayIdx) => {
      // Check Unavailability constraint
      if (emp.unavailability && shift !== 'OFF') {
        const unavail = emp.unavailability.find(u => u.dayIdx === dayIdx)
        if (unavail) {
          totalUnavailViolations++
          // Find replacement
          const candidate = employees.find(other => 
            other.id !== emp.id && 
            other.dept === emp.dept && 
            shifts[other.id]?.[dayIdx] === 'OFF' &&
            !other.unavailability?.some(u => u.dayIdx === dayIdx)
          )

          violations.push({
            id: `unavail-${emp.id}-${dayIdx}`,
            type: 'unavailability',
            employeeId: emp.id,
            employeeName: emp.name,
            dayIdx,
            dayName: DAYS[dayIdx],
            description: `Bentrok jadwal: ${emp.name} memiliki izin/jadwal kuliah (${unavail.reason}).`,
            suggestedFix: candidate 
              ? `Alihkan shift ke ${candidate.name} (Tersedia / Rest Day).`
              : 'Alihkan shift ke staf cadangan / buka slot Open Shift.',
            suggestedEmployeeId: candidate?.id,
            suggestedEmployeeName: candidate?.name
          })
        }
      }

      // Check Fatigue Constraint: Closing shift on day D followed by Pagi on day D+1 (rest < 7 hours!)
      if (shift === 'Closing' && dayIdx < 6) {
        const nextDayShift = empShifts[dayIdx + 1]
        if (nextDayShift === 'Pagi') {
          totalFatigueViolations++
          violations.push({
            id: `fatigue-${emp.id}-${dayIdx}`,
            type: 'fatigue_rest',
            employeeId: emp.id,
            employeeName: emp.name,
            dayIdx: dayIdx + 1,
            dayName: DAYS[dayIdx + 1],
            description: `Rest Time < 7 Jam: Selesai Closing (01:00 WIB) langsung ditugaskan Pagi (08:00 WIB).`,
            suggestedFix: 'Ubah shift hari berikutnya ke Sore atau OFF untuk memenuhi istirahat 11+ jam.'
          })
        }
      }
    })
  })

  // 2. Check Station Coverage per Day
  DAYS.forEach((dayName, dayIdx) => {
    const pagiStaff = employees.filter(e => shifts[e.id]?.[dayIdx] === 'Pagi')
    const soreStaff = employees.filter(e => shifts[e.id]?.[dayIdx] === 'Sore')

    // Must have at least 1 Barista on morning and evening
    const hasPagiBarista = pagiStaff.some(e => e.dept === 'Bar' || e.role.includes('Barista'))
    const hasPagiKasir = pagiStaff.some(e => e.dept === 'Front' || e.role.includes('Kasir'))

    if (pagiStaff.length > 0 && !hasPagiBarista) {
      totalStationCoverageIssues++
      violations.push({
        id: `station-bar-${dayIdx}`,
        type: 'station_understaffed',
        employeeId: 0,
        employeeName: 'Station Bar',
        dayIdx,
        dayName,
        description: `Hari ${dayName}: Shift Pagi tidak memiliki Barista terkualifikasi.`,
        suggestedFix: 'Tugaskan minimal 1 Barista di Shift Pagi.'
      })
    }

    if (pagiStaff.length > 0 && !hasPagiKasir && employees.some(e => e.dept === 'Front')) {
      totalStationCoverageIssues++
      violations.push({
        id: `station-kasir-${dayIdx}`,
        type: 'station_understaffed',
        employeeId: 0,
        employeeName: 'Station Kasir',
        dayIdx,
        dayName,
        description: `Hari ${dayName}: Shift Pagi tidak memiliki Kasir Frontline.`,
        suggestedFix: 'Tugaskan minimal 1 Kasir di Shift Pagi.'
      })
    }

    if (pagiStaff.length < 2 || soreStaff.length < 2) {
      totalStationCoverageIssues++
    }
  })

  // 3. Compute Component Scores
  const fairnessDelta = employees.length > 0 ? (() => {
    const counts = employees.map(emp => (shifts[emp.id] || []).filter(s => s === 'Sore' || s === 'Closing').length)
    return Math.max(...counts) - Math.min(...counts)
  })() : 0

  const fairnessScore = Math.max(0, Math.min(100, 100 - fairnessDelta * 12))
  const stationCoverageScore = Math.max(0, Math.min(100, 100 - totalStationCoverageIssues * 15))
  const fatigueSafetyScore = Math.max(0, Math.min(100, 100 - totalFatigueViolations * 25))
  const unavailComplianceScore = Math.max(0, Math.min(100, 100 - totalUnavailViolations * 20))
  const uuComplianceScore = Math.max(0, Math.min(100, 100 - (totalOtRiskCount * 15 + totalFatigueViolations * 20)))

  // Total weekly estimated labor cost
  let estimatedWeeklyLaborCost = 0
  DAYS.forEach((_, dayIdx) => {
    employees.forEach(emp => {
      const shift = shifts[emp.id]?.[dayIdx]
      if (shift && shift !== 'OFF') {
        estimatedWeeklyLaborCost += (emp.rate * 8)
      }
    })
  })

  const targetWeeklyRevenue = branch.targetDailyRevenue ? branch.targetDailyRevenue.reduce((a, b) => a + b, 0) : 100000000
  const laborCostRatio = targetWeeklyRevenue > 0 ? (estimatedWeeklyLaborCost / targetWeeklyRevenue) * 100 : 25
  const laborCostEfficiencyScore = Math.max(0, Math.min(100, Math.round(100 - Math.abs(laborCostRatio - 25) * 4)))

  const overallScore = Math.round(
    fairnessScore * 0.2 +
    stationCoverageScore * 0.25 +
    fatigueSafetyScore * 0.2 +
    unavailComplianceScore * 0.15 +
    uuComplianceScore * 0.1 +
    laborCostEfficiencyScore * 0.1
  )

  return {
    overallScore,
    fairnessScore,
    stationCoverageScore,
    fatigueSafetyScore,
    laborCostEfficiencyScore,
    uuComplianceScore,
    violations,
    estimatedWeeklyLaborCost,
    targetWeeklyRevenue,
    laborCostRatio
  }
}

/**
 * Generates an optimized, constraint-compliant roster
 */
export function generateOptimizedSchedule(
  employees: Employee[],
  _branch: BranchInfo
): Record<number, string[]> {
  const result: Record<number, string[]> = {}
  employees.forEach(e => {
    result[e.id] = Array(7).fill('OFF')
  })

  const baristas = employees.filter(e => e.dept === 'Bar' || e.role.includes('Barista'))
  const cashiers = employees.filter(e => e.dept === 'Front' || e.role.includes('Kasir'))
  const others = employees.filter(e => !baristas.includes(e) && !cashiers.includes(e))

  DAYS.forEach((_, dayIdx) => {
    const isWeekend = dayIdx >= 4 // Friday, Saturday, Sunday

    // 1. Assign Barista Pagi & Sore
    baristas.forEach((barista, bIdx) => {
      const isUnavail = barista.unavailability?.some(u => u.dayIdx === dayIdx)
      if (isUnavail) {
        result[barista.id][dayIdx] = 'OFF'
        return
      }

      // Alternate shifts
      if ((dayIdx + bIdx) % 3 === 0) {
        result[barista.id][dayIdx] = 'Pagi'
      } else if ((dayIdx + bIdx) % 3 === 1) {
        result[barista.id][dayIdx] = 'Sore'
      } else {
        result[barista.id][dayIdx] = isWeekend ? 'Closing' : 'OFF'
      }
    })

    // 2. Assign Cashiers
    cashiers.forEach((cashier, cIdx) => {
      const isUnavail = cashier.unavailability?.some(u => u.dayIdx === dayIdx)
      if (isUnavail) {
        result[cashier.id][dayIdx] = 'OFF'
        return
      }

      if ((dayIdx + cIdx) % 2 === 0) {
        result[cashier.id][dayIdx] = 'Pagi'
      } else {
        result[cashier.id][dayIdx] = isWeekend ? 'Closing' : 'Sore'
      }
    })

    // 3. Assign Others
    others.forEach((emp, oIdx) => {
      if ((dayIdx + oIdx) % 2 === 0) {
        result[emp.id][dayIdx] = 'Pagi'
      } else {
        result[emp.id][dayIdx] = 'Sore'
      }
    })
  })

  // Prevent Fatigue Violation (Closing -> Pagi)
  employees.forEach(emp => {
    for (let d = 0; d < 6; d++) {
      if (result[emp.id][d] === 'Closing' && result[emp.id][d + 1] === 'Pagi') {
        result[emp.id][d + 1] = 'Sore'
      }
    }
  })

  return result
}

/**
 * 1-Click Poka-Yoke Auto-Resolve Conflicts
 */
export function resolveScheduleConflicts(
  currentShifts: Record<number, string[]>,
  employees: Employee[]
): { newShifts: Record<number, string[]>, resolvedCount: number } {
  const newShifts: Record<number, string[]> = {}
  Object.entries(currentShifts).forEach(([k, v]) => {
    newShifts[Number(k)] = [...v]
  })

  let resolvedCount = 0

  employees.forEach(emp => {
    if (!emp.unavailability) return
    emp.unavailability.forEach(unavail => {
      const currentShift = newShifts[emp.id]?.[unavail.dayIdx]
      if (currentShift && currentShift !== 'OFF') {
        // Swap with an available coworker
        const candidate = employees.find(other => 
          other.id !== emp.id &&
          other.dept === emp.dept &&
          newShifts[other.id]?.[unavail.dayIdx] === 'OFF' &&
          !other.unavailability?.some(u => u.dayIdx === unavail.dayIdx)
        )

        if (candidate) {
          newShifts[candidate.id][unavail.dayIdx] = currentShift
          newShifts[emp.id][unavail.dayIdx] = 'OFF'
          resolvedCount++
        } else {
          newShifts[emp.id][unavail.dayIdx] = 'OFF'
          resolvedCount++
        }
      }
    })

    // Fix fatigue closing -> pagi
    for (let d = 0; d < 6; d++) {
      if (newShifts[emp.id]?.[d] === 'Closing' && newShifts[emp.id]?.[d + 1] === 'Pagi') {
        newShifts[emp.id][d + 1] = 'Sore'
        resolvedCount++
      }
    }
  })

  return { newShifts, resolvedCount }
}
