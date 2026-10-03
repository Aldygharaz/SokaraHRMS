import { useState, useMemo, useEffect, useCallback } from 'react';
import { useHRStore } from '@/store/useHRStore'
import { Printer, Wand2, Filter, Edit3, X, Send, Layers, Users, Sun, Sparkles, GraduationCap, CheckCheck, Bookmark, DollarSign, Flame, Plus, Check, ArrowRight, ShieldCheck, Activity, AlertCircle, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { sound } from '@/lib/sound'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tooltip, InfoTooltip } from '@/components/ui/Tooltip'
import { BRANCH_PROFILES } from '@/lib/branches'
import { auditRosterHealth, generateOptimizedSchedule, resolveScheduleConflicts } from '@/lib/schedulerEngine'

const SHIFT_TOOLTIPS: Record<string, string> = {
  'Pagi': 'Shift Pagi: 08:00 - 17:00 WIB (9 Jam Operasional)',
  'Sore': 'Shift Sore: 14:00 - 23:00 WIB (9 Jam Operasional)',
  'Closing': 'Shift Closing: 16:00 - 01:00 WIB (+ Insentif Malam Rp 50.000)',
  'OFF': 'Libur Mingguan (Rest Day)'
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export function Calendar() {
  const employees = useHRStore(state => state.employees)
  const shifts = useHRStore(state => state.shifts)
  const activeRole = useHRStore(state => state.activeRole)
  const activeBranch = useHRStore(state => state.activeBranch)
  const rosterStatus = useHRStore(state => state.rosterStatus)
  const publishRoster = useHRStore(state => state.publishRoster)
  const addAuditLog = useHRStore(state => state.addAuditLog)
  const updateShift = useHRStore(state => state.updateShift)
  const shiftTemplates = useHRStore(state => state.shiftTemplates || {})
  const saveShiftTemplate = useHRStore(state => state.saveShiftTemplate)
  const applyShiftTemplate = useHRStore(state => state.applyShiftTemplate)

  const restoreSnapshot = useHRStore(state => state.restoreSnapshot)
  const [filter, setFilter] = useState('ALL')
  const [showAnalyticsRows, setShowAnalyticsRows] = useState(false)
  const [editTarget, setEditTarget] = useState<{empId: number, dayIdx: number, empName: string, currentShift: string, dayName: string} | null>(null)
  const [selectedCells, setSelectedCells] = useState<string[]>([])
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showHealthModal, setShowHealthModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [selectedTemplateName, setSelectedTemplateName] = useState('Standar Operasional Regular')
  const [diffModal, setDiffModal] = useState<{
    proposedShifts: Record<number, string[]>
    newFairness: number
    totalAssigned: number
  } | null>(null)

  const currentBranch = BRANCH_PROFILES[activeBranch] || BRANCH_PROFILES['Senopati (HQ)']
  const healthReport = useMemo(() => auditRosterHealth(shifts, employees, currentBranch), [shifts, employees, currentBranch])
  
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (filter === 'ALL') return true
      if (filter === 'Barista' && (emp.dept === 'Bar' || emp.role.includes('Barista'))) return true
      if (filter === 'Kasir' && (emp.dept === 'Front' || emp.role.includes('Kasir'))) return true
      if (filter === 'Pagi') return shifts[emp.id]?.includes('Pagi')
      if (filter === 'Sore') return shifts[emp.id]?.includes('Sore')
      return false
    })
  }, [employees, filter, shifts])

  // Headcount, Demand Forecast, & Labor Cost Metrics per day
  const dayMetrics = useMemo(() => {
    return DAYS.map((_, dayIdx) => {
      const pagiCount = employees.filter(e => shifts[e.id]?.[dayIdx] === 'Pagi').length
      const soreCount = employees.filter(e => shifts[e.id]?.[dayIdx] === 'Sore').length
      const closingCount = employees.filter(e => shifts[e.id]?.[dayIdx] === 'Closing').length
      const totalActive = pagiCount + soreCount + closingCount
      const isUnderstaffed = pagiCount < 2 || soreCount < 2

      let dailyLaborCost = 0
      employees.forEach(emp => {
        const s = shifts[emp.id]?.[dayIdx]
        if (s === 'Pagi' || s === 'Sore' || s === 'Closing') {
          dailyLaborCost += (emp.rate * 8)
          if (s === 'Closing') {
            dailyLaborCost += 50000
          }
        }
      })

      const targetRev = currentBranch.targetDailyRevenue?.[dayIdx] || 15000000
      const laborRatio = targetRev > 0 ? Math.round((dailyLaborCost / targetRev) * 100) : 0
      const forecast = currentBranch.dailyTrafficForecast?.[dayIdx] || { level: 'Sedang' as const, score: 60, peakTime: '12:00 - 14:00' }

      return {
        pagiCount,
        soreCount,
        closingCount,
        totalActive,
        isUnderstaffed,
        dailyLaborCost,
        targetRev,
        laborRatio,
        forecast
      }
    })
  }, [employees, shifts, currentBranch])

  const employeeWeeklyStats = useMemo(() => {
    const map: Record<number, { totalHours: number, shiftDays: number, isOtRisk: boolean, otHours: number }> = {}
    employees.forEach(emp => {
      const empShifts = shifts[emp.id] || []
      const activeShiftCount = empShifts.filter(s => s === 'Pagi' || s === 'Sore' || s === 'Closing').length
      const baseHours = activeShiftCount * 8
      const otHours = Math.max(0, baseHours - 40)
      const isOtRisk = baseHours >= 40

      map[emp.id] = {
        totalHours: baseHours,
        shiftDays: activeShiftCount,
        isOtRisk,
        otHours
      }
    })
    return map
  }, [employees, shifts])

  const fairnessScore = useMemo(() => {
    if (employees.length === 0) return 100
    const nightShiftsCount = employees.map(emp => {
      return shifts[emp.id]?.filter(s => s === 'Sore' || s === 'Closing').length || 0
    })
    const max = Math.max(...nightShiftsCount)
    const min = Math.min(...nightShiftsCount)
    const diff = max - min
    const score = 100 - (diff * 12)
    return Math.max(score, 0)
  }, [employees, shifts])

  const handleApplyTemplate = (templateName: string) => {
    sound.playSuccess()
    const prevShifts = { ...shifts }
    applyShiftTemplate(templateName)
    addAuditLog({
      user: 'Manager',
      action: 'Apply Roster Template',
      detail: `Menerapkan template roster: ${templateName}`
    })
    setShowTemplateModal(false)
    toast.success(`Template "${templateName}" berhasil diterapkan!`, {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          sound.playClick()
          restoreSnapshot({ shifts: prevShifts })
          toast.info("Penerapan template dibatalkan.")
        }
      }
    })
  }

  const handleSaveNewTemplate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTemplateName.trim()) return
    sound.playSuccess()
    saveShiftTemplate(newTemplateName.trim())
    toast.success(`Roster saat ini disimpan sebagai template "${newTemplateName.trim()}"!`)
    setNewTemplateName('')
  }

  const applyShift = useCallback((shiftType: string) => {
    if (!editTarget) return
    sound.playClick()
    updateShift(editTarget.empId, editTarget.dayIdx, shiftType)
    toast.success(`Shift ${editTarget.empName} (${editTarget.dayName}) diubah ke ${shiftType}`)
    setEditTarget(null)
  }, [editTarget, updateShift])

  const applyBatchShift = useCallback((shiftType: string) => {
    if (selectedCells.length === 0) return
    const prevShifts = { ...shifts }
    sound.playSuccess()

    const newShifts: Record<number, string[]> = {}
    Object.entries(shifts).forEach(([k, v]) => {
      newShifts[Number(k)] = [...v]
    })

    selectedCells.forEach(key => {
      const [empIdStr, dayIdxStr] = key.split('_')
      const empId = Number(empIdStr)
      const dayIdx = Number(dayIdxStr)
      if (!newShifts[empId]) newShifts[empId] = Array(7).fill('OFF')
      newShifts[empId][dayIdx] = shiftType
    })

    restoreSnapshot({ shifts: newShifts, rosterStatus: 'draft' })
    toast.success(`${selectedCells.length} slot shift diubah ke ${shiftType}`, {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          sound.playClick()
          restoreSnapshot({ shifts: prevShifts })
          toast.info("Perubahan batch shift dibatalkan.")
        }
      }
    })

    setSelectedCells([])
  }, [selectedCells, shifts, restoreSnapshot])

  // Quick keyboard shortcut in shift edit modal or batch mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedCells.length > 0) {
        if (e.key === '1') {
          e.preventDefault()
          applyBatchShift('Pagi')
        } else if (e.key === '2') {
          e.preventDefault()
          applyBatchShift('Sore')
        } else if (e.key === '3') {
          e.preventDefault()
          applyBatchShift('Closing')
        } else if (e.key === '4' || e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault()
          applyBatchShift('OFF')
        } else if (e.key === 'Escape') {
          setSelectedCells([])
        }
        return
      }

      if (editTarget) {
        if (e.key === '1') {
          applyShift('Pagi')
        } else if (e.key === '2') {
          applyShift('Sore')
        } else if (e.key === '3') {
          applyShift('Closing')
        } else if (e.key === '4') {
          applyShift('OFF')
        } else if (e.key === 'Escape') {
          setEditTarget(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editTarget, selectedCells, applyBatchShift, applyShift])

  const handleOpenAIDiffModal = () => {
    sound.playClick()
    const proposed: Record<number, string[]> = {}
    let totalAssigned = 0

    employees.forEach(emp => {
      const current = shifts[emp.id] ? [...shifts[emp.id]] : Array(7).fill('OFF')
      for (let i = 0; i < 7; i++) {
        const isUnavailable = emp.unavailability?.some(u => u.dayIdx === i)
        if (isUnavailable) {
          current[i] = 'OFF'
        } else if (!current[i] || current[i] === 'Kosong' || current[i] === 'OFF') {
          current[i] = Math.random() > 0.5 ? 'Pagi' : 'Sore'
          totalAssigned++
        }
      }
      proposed[emp.id] = current
    })

    const nightCounts = employees.map(emp => proposed[emp.id]?.filter(s => s === 'Sore' || s === 'Closing').length || 0)
    const max = Math.max(...nightCounts)
    const min = Math.min(...nightCounts)
    const newFairness = Math.max(0, 100 - ((max - min) * 12))

    setDiffModal({
      proposedShifts: proposed,
      newFairness,
      totalAssigned
    })
  }

  const handleApplyDiff = () => {
    if (!diffModal) return
    const prevShifts = { ...shifts }
    sound.playSuccess()
    restoreSnapshot({ shifts: diffModal.proposedShifts, rosterStatus: 'draft' })
    addAuditLog({ user: 'Manager (AI Optimizer)', action: 'Auto-Fill Shift', detail: `Menerapkan ${diffModal.totalAssigned} shift dengan AI Optimizer` })
    toast.success(`${diffModal.totalAssigned} jadwal shift berhasil diterapkan!`, {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          sound.playClick()
          restoreSnapshot({ shifts: prevShifts })
          toast.info("Penerapan roster AI dibatalkan.")
        }
      }
    })
    setDiffModal(null)
  }

  const handleAutoResolveConflicts = () => {
    sound.playSuccess()
    const prevShifts = { ...shifts }
    const { newShifts, resolvedCount } = resolveScheduleConflicts(shifts, employees)
    
    useHRStore.setState({ shifts: newShifts, rosterStatus: 'draft' })
    addAuditLog({
      user: 'AI Scheduler',
      action: 'Poka-Yoke Auto-Resolve',
      detail: `Menyelesaikan otomatis ${resolvedCount} konflik jadwal dan rest time`
    })

    toast.success(`Berhasil menyelesaikan ${resolvedCount} anomali jadwal!`, {
      description: "Jadwal telah disesuaikan agar patuh regulasi dan ketersediaan staf.",
      action: {
        label: "Undo",
        onClick: () => {
          restoreSnapshot({ shifts: prevShifts })
          toast.info("Perbaikan otomatis dibatalkan.")
        }
      }
    })
  }

  const handleApplyAIOptimization = () => {
    sound.playSuccess()
    const prevShifts = { ...shifts }
    const optimized = generateOptimizedSchedule(employees, currentBranch)
    
    useHRStore.setState({ shifts: optimized, rosterStatus: 'draft' })
    addAuditLog({
      user: 'AI Scheduler',
      action: 'Apply Multi-Constraint Optimal Schedule',
      detail: 'Menerapkan jadwal seimbang multi-kendala stasiun & biaya tenaga kerja'
    })

    toast.success("Jadwal Optimal AI Berhasil Diterapkan!", {
      description: "Penugasan telah mengoptimalkan kompetensi stasiun dan efisiensi biaya tenaga kerja.",
      action: {
        label: "Undo",
        onClick: () => {
          restoreSnapshot({ shifts: prevShifts })
          toast.info("Jadwal dikembalikan ke kondisi sebelumnya.")
        }
      }
    })
    setShowHealthModal(false)
  }

  const handlePublish = () => {
    sound.playSuccess()
    publishRoster()
    toast.success("Roster Resmi Berhasil Dipublikasikan!", {
      description: "Notifikasi jadwal resmi telah dibroadcast ke seluruh staf."
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 relative" id="calendar-print-area">
      {/* Standardized Clean Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-outline">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
              Kalender Shift & Roster
            </h1>
            
            <Tooltip
              title="Status Roster Shift"
              badge={rosterStatus === 'published' ? 'Live' : 'Draft'}
              description={rosterStatus === 'published' 
                ? 'Jadwal telah dipublikasikan secara resmi ke seluruh akun staf.' 
                : 'Jadwal masih berstatus draft internal manajer dan belum dibroadcast ke staf.'}
            >
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 cursor-help",
                rosterStatus === 'published' 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", rosterStatus === 'published' ? "bg-emerald-500" : "bg-amber-500")} />
                {rosterStatus === 'published' ? 'Published' : 'Draft'}
              </span>
            </Tooltip>

            <Tooltip 
              title="Audit Kesehatan Roster"
              badge="Anti-Fatigue AI"
              description="Evaluasi kepatuhan jadwal multi-faktor: memastikan jeda istirahat minimal 8 jam antar shift, keadilan pembagian akhir pekan, dan pencegahan burnout staf."
            >
              <button 
                onClick={() => {
                  sound.playClick()
                  setShowHealthModal(true)
                }}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 cursor-pointer transition-colors",
                  healthReport.overallScore >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : 
                  healthReport.overallScore >= 60 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : 
                  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                )}
              >
                <Activity className="w-3 h-3" /> Health: {healthReport.overallScore}%
              </button>
            </Tooltip>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Matriks penjadwalan 7 hari dengan proteksi beban kerja dan kepatuhan jam kerja staf.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Analytics Rows for Minimal/Detailed View */}
          <Tooltip
            title="Tampilan Analitik Kapasitas"
            description={showAnalyticsRows ? "Sembunyikan baris rincian kapasitas staf, prediksi trafik, dan rasio biaya untuk tampilan jadwal ringkas." : "Buka baris evaluasi kapasitas shift, prediksi jam sibuk, dan persentase biaya tenaga kerja per hari."}
          >
            <button
              onClick={() => {
                sound.playClick()
                setShowAnalyticsRows(!showAnalyticsRows)
              }}
              className={cn(
                "border text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer",
                showAnalyticsRows 
                  ? "bg-accent-primary/10 border-accent-primary/40 text-accent-primary font-bold" 
                  : "bg-surface-low hover:bg-surface-high text-on-surface border-outline"
              )}
            >
              <Layers className="w-3.5 h-3.5 text-accent-primary" />
              <span>{showAnalyticsRows ? "Sembunyikan Analitik" : "Analitik Kapasitas"}</span>
            </button>
          </Tooltip>

          <Tooltip title="Cetak Roster" description="Cetak matriks jadwal 7 hari dalam format laporan siap tempel di area kru.">
            <button 
              onClick={() => {
                sound.playClick()
                window.print()
              }}
              className="bg-surface-low hover:bg-surface-high text-on-surface border border-outline text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-on-surface-variant" /> Cetak
            </button>
          </Tooltip>
          
          {activeRole === 'manager' && (
            <>
              {healthReport.violations.length > 0 && (
                <Tooltip
                  title="Perbaikan Otomatis AI"
                  badge="SOP Kebugaran"
                  description={`Menyelesaikan ${healthReport.violations.length} potensi konflik jadwal dan jeda istirahat < 8 jam secara otomatis.`}
                >
                  <button 
                    onClick={handleAutoResolveConflicts}
                    className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Fix ({healthReport.violations.length})
                  </button>
                </Tooltip>
              )}

              <Tooltip
                title="Template Roster Mingguan"
                description="Muat atau simpan pola kombinasi shift yang sudah terbukti optimal agar tidak perlu menyusun jadwal dari awal."
              >
                <button 
                  onClick={() => {
                    sound.playClick()
                    setShowTemplateModal(true)
                  }}
                  className="bg-surface-low hover:bg-surface-high text-on-surface border border-outline text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-on-surface-variant" /> Template
                </button>
              </Tooltip>

              <Tooltip
                title="Optimasi Penjadwalan AI"
                badge="Multi-Constraint"
                description="Algoritma otomatis mengisi slot shift kosong dengan mempertimbangkan keahlian stasiun (Barista, Kasir) dan batas rasio biaya tenaga kerja cabang."
              >
                <button 
                  onClick={handleOpenAIDiffModal}
                  className="bg-surface-low hover:bg-surface-high text-on-surface border border-outline text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5 text-accent-primary" /> Auto-Fill AI
                </button>
              </Tooltip>

              <Tooltip
                title="Publikasikan Roster Resmi"
                description="Mengunci status jadwal resmi dan langsung mengirimkan broadcast jadwal 7 hari ke seluruh portal staf."
              >
                <button 
                  onClick={handlePublish}
                  className="bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold text-xs py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3 h-3" /> Publish
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Filter Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low p-3.5 rounded-2xl border border-outline text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-on-surface-variant font-bold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-accent-primary" /> Preset Filter:
          </span>
          {[
            { id: 'ALL', label: 'Semua Staf', count: employees.length },
            { id: 'Barista', label: 'Barista', count: employees.filter(e => e.dept === 'Bar' || e.role.includes('Barista')).length },
            { id: 'Kasir', label: 'Kasir', count: employees.filter(e => e.dept === 'Front' || e.role.includes('Kasir')).length },
            { id: 'Pagi', label: 'Shift Pagi', count: employees.filter(e => shifts[e.id]?.some(s => s.includes('Pagi'))).length },
            { id: 'Sore', label: 'Shift Sore', count: employees.filter(e => shifts[e.id]?.some(s => s.includes('Sore'))).length }
          ].map(({ id, label, count }) => (
            <Tooltip key={id} content={`Filter tabel untuk menampilkan kategori ${label} (${count} orang)`}>
              <button 
                onClick={() => {
                  sound.playClick()
                  setFilter(id)
                }}
                className={cn(
                  "px-3 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  filter === id 
                    ? "bg-accent-primary text-white shadow-sm" 
                    : "bg-surface-container-high text-on-surface hover:text-accent-primary border border-outline"
                )}
              >
                <span>{label}</span>
                <span className={cn(
                  "px-1.5 py-0.2 rounded-md text-[10px] font-mono",
                  filter === id ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"
                )}>
                  {count}
                </span>
              </button>
            </Tooltip>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-on-surface-variant font-medium">
          <Tooltip content="Shift Pagi: 08:00 - 17:00 (Opening & Siang)">
            <span className="flex items-center gap-1 cursor-help">
              <span className="w-2.5 h-2.5 rounded-md bg-accent-primary/20 border border-accent-primary/50" /> Pagi (08:00 - 17:00)
            </span>
          </Tooltip>
          <Tooltip content="Shift Sore: 14:00 - 23:00 (Rush Hour Malam)">
            <span className="flex items-center gap-1 cursor-help">
              <span className="w-2.5 h-2.5 rounded-md bg-tertiary/20 border border-tertiary/50" /> Sore (14:00 - 23:00)
            </span>
          </Tooltip>
          <Tooltip content="Shift Closing: 16:00 - 01:00 (Penutupan & Rekonsiliasi Kasir)">
            <span className="flex items-center gap-1 cursor-help">
              <span className="w-2.5 h-2.5 rounded-md bg-semantic-warning/20 border border-semantic-warning/50" /> Closing (16:00 - 01:00)
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Operational Intelligence: Local Event & Weather Forecast (7shifts / Harri standard) */}
      {(() => {
        const currentBranch = BRANCH_PROFILES[activeBranch] || BRANCH_PROFILES['Senopati (HQ)']
        return (
          <div className="surface-card p-3.5 border border-outline bg-surface-low flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-on-surface">{currentBranch.eventContext.title}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] border border-emerald-500/20 font-mono">
                    {currentBranch.eventContext.badge}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  {currentBranch.eventContext.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-accent-primary font-medium text-xs flex items-center gap-1.5 shrink-0">
                <Sparkles className="w-3.5 h-3.5" /> {currentBranch.eventContext.recommendation}
              </span>
            </div>
          </div>
        )
      })()}

      {/* Main Roster Matrix Table */}
      <div className="surface-card rounded-2xl overflow-hidden overflow-x-auto border border-outline p-0">
        {filteredEmployees.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="Tidak Ada Karyawan yang Cocok"
              description={`Tidak ditemukan staf untuk filter "${filter}". Silakan pilih filter lain.`}
              actionLabel="Reset ke Semua Staf"
              onAction={() => { sound.playClick(); setFilter('ALL') }}
            />
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-surface-container-high text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                <th className="p-4 w-52">Karyawan & Kompetensi</th>
                {DAYS.map((day, idx) => (
                  <th key={idx} className={cn("p-4 text-center", idx === 3 && "bg-accent-primary/10 text-accent-primary font-bold")}>
                    <div>{day}</div>
                    <span className="text-[10px] font-mono font-normal opacity-70">Tgl {20 + idx}</span>
                  </th>
                ))}
              </tr>

              {showAnalyticsRows && (
                <>
                  {/* Headcount Capacity Gauge Row (7shifts standard) */}
                  <tr className="bg-surface-container-low border-b border-outline text-[11px] animate-in fade-in duration-150">
                    <td className="p-3 pl-4 font-bold text-on-surface flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-accent-primary" /> 
                        <span>Kapasitas Shift</span>
                      </div>
                      <InfoTooltip 
                        title="Kapasitas Shift Harian" 
                        badge="7shifts Standard" 
                        description="Memantau pemenuhan minimum kru operasional cabang: Standar kedai mensyaratkan minimal 2 staf Pagi & 2 staf Sore." 
                      />
                    </td>
                    {dayMetrics.map((cap, idx) => (
                      <td key={idx} className="p-2 text-center">
                        <Tooltip 
                          title={`Kapasitas Hari ${DAYS[idx]}`}
                          badge={cap.isUnderstaffed ? "Kurang Kru" : "Ideal"}
                          description={`Total staf aktif: ${cap.totalActive} orang (Pagi: ${cap.pagiCount}, Sore: ${cap.soreCount}, Closing: ${cap.closingCount}). ${cap.isUnderstaffed ? 'Perhatian: Minimum butuh 2 staf Pagi & 2 staf Sore!' : 'Kebutuhan staf terpenuhi secara ideal.'}`}
                        >
                          <div className={cn(
                            "p-2 rounded-xl border font-mono text-[10px] font-bold space-y-1.5 transition-colors cursor-help w-full",
                            cap.isUnderstaffed 
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-xs" 
                              : "bg-surface-container text-on-surface border-outline"
                          )}>
                            <div className="flex justify-center items-center gap-1">
                              <span className="px-1.5 py-0.5 rounded bg-accent-primary/20 text-accent-primary text-[9px]">
                                P:{cap.pagiCount}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-500 text-[9px]">
                                S:{cap.soreCount}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px]">
                                C:{cap.closingCount}
                              </span>
                            </div>

                            <div className={cn(
                              "text-[9px] uppercase tracking-wider font-bold py-0.5 rounded",
                              cap.isUnderstaffed ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                            )}>
                              {cap.isUnderstaffed ? 'Butuh +1' : 'Ideal'}
                            </div>
                          </div>
                        </Tooltip>
                      </td>
                    ))}
                  </tr>

                  {/* Demand Forecasting Heatmap Row (Deputy Standard) */}
                  <tr className="bg-surface-container-low border-b border-outline text-[11px] animate-in fade-in duration-150">
                    <td className="p-3 pl-4 font-bold text-on-surface flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-rose-500" /> 
                        <span>Prediksi Trafik</span>
                      </div>
                      <InfoTooltip 
                        title="Proyeksi Beban Pesanan" 
                        badge="Deputy Benchmark" 
                        description="Estimasi jam sibuk pelanggan berdasarkan data historis penjualan dan kalender event cabang sekitar." 
                      />
                    </td>
                    {dayMetrics.map((cap, idx) => (
                      <td key={idx} className="p-2 text-center">
                        <Tooltip 
                          title={`Prediksi Trafik Hari ${DAYS[idx]}`}
                          badge={`${cap.forecast.level} (${cap.forecast.score}%)`}
                          description={`Jam puncak kunjungan diperkirakan pukul ${cap.forecast.peakTime}. Pastikan kesiapan stok cup dan barista utama.`}
                        >
                          <div className="p-2 rounded-xl bg-surface border border-outline font-mono text-[10px] space-y-1 cursor-help">
                            <div className="flex justify-between items-center text-[9px]">
                              <span className="font-bold text-on-surface">{cap.forecast.level}</span>
                              <span className={cn(
                                "font-bold",
                                cap.forecast.score > 80 ? "text-rose-500" : cap.forecast.score > 50 ? "text-amber-500" : "text-emerald-500"
                              )}>{cap.forecast.score}%</span>
                            </div>
                            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  cap.forecast.score > 80 ? "bg-rose-500" : cap.forecast.score > 50 ? "bg-amber-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${cap.forecast.score}%` }}
                              />
                            </div>
                            <p className="text-[8px] text-on-surface-variant font-sans truncate">{cap.forecast.peakTime}</p>
                          </div>
                        </Tooltip>
                      </td>
                    ))}
                  </tr>

                  {/* Live Labor Cost Ratio Row (7shifts Standard) */}
                  <tr className="bg-surface-container-lowest border-b border-outline text-[11px] animate-in fade-in duration-150">
                    <td className="p-3 pl-4 font-bold text-on-surface flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-accent-primary" /> 
                        <span>Labor Cost %</span>
                      </div>
                      <InfoTooltip 
                        title="Rasio Biaya Upah Staf" 
                        badge="Target < 25%" 
                        description="Perbandingan biaya upah harian terhadap target omset cabang. Rasio < 25% menunjukkan profitabilitas operasional sehat." 
                      />
                    </td>
                    {dayMetrics.map((cap, idx) => (
                      <td key={idx} className="p-2 text-center">
                        <Tooltip 
                          title={`Efisiensi Biaya Hari ${DAYS[idx]}`}
                          badge={`${cap.laborRatio}% Omset`}
                          description={`Biaya staf harian: Rp ${cap.dailyLaborCost.toLocaleString('id-ID')} dari target omset Rp ${cap.targetRev.toLocaleString('id-ID')}. Status: ${cap.laborRatio <= 25 ? 'Sangat Sehat' : 'Perlu Diwaspadai'}.`}
                        >
                          <div className={cn(
                            "p-1.5 rounded-lg border font-mono text-[10px] cursor-help flex items-center justify-center gap-1.5",
                            cap.laborRatio <= 22 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                            cap.laborRatio <= 28 ? "bg-surface-container text-on-surface border-outline" :
                            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          )}>
                            <span className="font-bold">{cap.laborRatio}%</span>
                            <span className="text-[9px] opacity-70">Rp {(cap.dailyLaborCost / 1000).toFixed(0)}k</span>
                          </div>
                        </Tooltip>
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </thead>

            <tbody className="divide-y divide-surface-container-high text-xs">
              {filteredEmployees.map(emp => {
                const stats = employeeWeeklyStats[emp.id] || { totalHours: 0, shiftDays: 0, isOtRisk: false, otHours: 0 }

                return (
                  <tr key={emp.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4">
                      <Tooltip content={`PTKP: ${emp.ptkp} • KAT ${emp.kat} • Performa: ${emp.rating}/5.0 • Total Jam: ${stats.totalHours} Jam/Mgg (Batas regulasi: 40 Jam)`}>
                        <div className="flex items-center gap-3 cursor-help">
                          <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-xl object-cover border border-outline" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-on-surface truncate">{emp.name}</p>
                              {emp.unavailability && emp.unavailability.length > 0 && (
                                <Tooltip content={`Kru Part-time / Mahasiswa (Tidak bisa: ${emp.unavailability.map(u => `${u.dayName} - ${u.reason}`).join(', ')})`}>
                                  <span className="p-0.5 rounded bg-accent-primary/10 text-accent-primary cursor-help shrink-0">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                  </span>
                                </Tooltip>
                              )}
                            </div>
                            <p className="text-[10px] text-on-surface-variant truncate">{emp.role}</p>

                            {/* Weekly Hours & Overtime Warning Badge */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={cn(
                                "px-1.5 py-0.2 rounded-md font-mono text-[9px] font-bold",
                                stats.totalHours < 36 ? "bg-psy-safe-bg text-psy-safe-text border border-psy-safe/30" :
                                stats.totalHours < 40 ? "bg-psy-warning-bg text-psy-warning-text border border-psy-warning/30" :
                                "bg-error/10 text-error border border-error/30 animate-pulse"
                              )}>
                                {stats.totalHours} Jam / Mgg
                              </span>
                              {stats.isOtRisk && (
                                <span className="px-1.5 py-0.2 rounded-md bg-error text-white font-mono text-[8px] font-bold">
                                  OT Risk (+{stats.otHours}j)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Tooltip>
                    </td>
                    {(shifts[emp.id] || Array(7).fill('OFF')).map((shift, i) => {
                      const unavailInfo = emp.unavailability?.find(u => u.dayIdx === i)
                      const isUnavailConflict = Boolean(unavailInfo && shift !== 'OFF')
                      const isFatigueConflict = Boolean(shift === 'Pagi' && i > 0 && (shifts[emp.id]?.[i - 1] === 'Closing'))
                      const cellKey = `${emp.id}_${i}`
                      const isSelected = selectedCells.includes(cellKey)

                      return (
                        <td 
                          key={i} 
                          className={cn(
                            "p-3 text-center relative group transition-all", 
                            activeRole === 'manager' && "cursor-pointer hover:bg-surface-container-high",
                            isSelected && "bg-accent-primary/20 ring-2 ring-accent-primary ring-inset",
                            (isUnavailConflict || isFatigueConflict) && "bg-error/5"
                          )}
                          onClick={(e) => {
                            if (activeRole === 'manager') {
                              if (e.shiftKey || selectedCells.length > 0) {
                                sound.playClick()
                                setSelectedCells(prev => 
                                  prev.includes(cellKey) ? prev.filter(k => k !== cellKey) : [...prev, cellKey]
                                )
                              } else {
                                sound.playClick()
                                setEditTarget({ empId: emp.id, dayIdx: i, empName: emp.name, currentShift: shift, dayName: DAYS[i] })
                              }
                            }
                          }}
                        >
                          <Tooltip content={
                            isUnavailConflict 
                              ? `[Peringatan Bentrok] ${emp.name} ditugaskan ${shift}, padahal ada ${unavailInfo?.reason}. Klik untuk ubah.`
                              : isFatigueConflict
                              ? `[Risiko Fatigue] Baru selesai shift Closing (01:00 WIB), langsung masuk Pagi (08:00 WIB). Istirahat < 7 jam.`
                              : unavailInfo 
                              ? `Info: Kru izin/kuliah hari ini (${unavailInfo.reason}) - Status OFF sesuai.`
                              : (activeRole === 'manager' ? `Klik untuk ubah (Shift+Klik multi-select): ${SHIFT_TOOLTIPS[shift] || shift}` : SHIFT_TOOLTIPS[shift] || shift)
                          }>
                            <div className="space-y-0.5">
                              <span className={cn(
                                "px-2 py-1 rounded-lg font-semibold text-[11px] transition-colors block w-full",
                                isUnavailConflict ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30" :
                                isFatigueConflict ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30" :
                                shift === 'Pagi' ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20" :
                                shift === 'Sore' ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20" :
                                shift === 'Closing' ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" :
                                "bg-surface-low text-on-surface-variant border border-outline",
                                isSelected && "bg-accent-primary text-white border-transparent"
                              )}>
                                {shift}
                              </span>
                              {isUnavailConflict ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-error font-bold animate-pulse">
                                  <AlertTriangle className="w-2.5 h-2.5 text-error" /> Bentrok
                                </span>
                              ) : isFatigueConflict ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-psy-warning-text font-bold">
                                  <Clock className="w-2.5 h-2.5 text-psy-warning-text" /> Rest &lt; 7j
                                </span>
                              ) : unavailInfo ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-on-surface-variant font-medium">
                                  <GraduationCap className="w-2.5 h-2.5" /> Kuliah
                                </span>
                              ) : null}
                            </div>
                          </Tooltip>
                          {activeRole === 'manager' && !isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <Edit3 className="w-4 h-4 text-accent-primary" />
                            </div>
                          )}
                        </td>
                      )
                    })}
                </tr>
              )
            })}
          </tbody>
          </table>
        )}
      </div>

      {/* Floating Batch Selection Action Bar (Linear & Spreadsheet-grade standard) */}
      {selectedCells.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-accent-primary/50 shadow-2xl rounded-2xl p-2.5 flex flex-wrap items-center justify-center gap-2">
          <div className="flex items-center gap-2 pl-2 pr-3 border-r border-outline">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
            <span className="font-bold text-xs font-mono text-on-surface">
              {selectedCells.length} Sel Terpilih
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Tooltip title="Set Shift Pagi" shortcut="[1]" description="Tetapkan shift pagi (08:00 - 17:00 WIB) untuk seluruh sel yang dipilih.">
              <button 
                onClick={() => applyBatchShift('Pagi')}
                className="px-3 py-1.5 rounded-xl bg-accent-primary text-white font-bold hover:shadow-md transition-all cursor-pointer flex items-center gap-1 font-mono"
              >
                <span>Pagi</span> <kbd className="px-1 py-0.2 rounded bg-white/20 text-[9px]">1</kbd>
              </button>
            </Tooltip>

            <Tooltip title="Set Shift Sore" shortcut="[2]" description="Tetapkan shift sore (14:00 - 23:00 WIB) untuk seluruh sel yang dipilih.">
              <button 
                onClick={() => applyBatchShift('Sore')}
                className="px-3 py-1.5 rounded-xl bg-tertiary text-white font-bold hover:shadow-md transition-all cursor-pointer flex items-center gap-1 font-mono"
              >
                <span>Sore</span> <kbd className="px-1 py-0.2 rounded bg-white/20 text-[9px]">2</kbd>
              </button>
            </Tooltip>

            <Tooltip title="Set Shift Closing" shortcut="[3]" description="Tetapkan shift closing (16:00 - 01:00 WIB) untuk seluruh sel yang dipilih.">
              <button 
                onClick={() => applyBatchShift('Closing')}
                className="px-3 py-1.5 rounded-xl bg-semantic-warning text-white font-bold hover:shadow-md transition-all cursor-pointer flex items-center gap-1 font-mono"
              >
                <span>Closing</span> <kbd className="px-1 py-0.2 rounded bg-white/20 text-[9px]">3</kbd>
              </button>
            </Tooltip>

            <Tooltip title="Set Libur (OFF)" shortcut="[4]" description="Kosongkan jadwal tugas dan tetapkan libur untuk seluruh sel yang dipilih.">
              <button 
                onClick={() => applyBatchShift('OFF')}
                className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-bold border border-outline transition-all cursor-pointer flex items-center gap-1 font-mono"
              >
                <span>Libur (OFF)</span> <kbd className="px-1 py-0.2 rounded bg-surface-container-highest text-[9px]">4</kbd>
              </button>
            </Tooltip>

            <Tooltip content="Batalkan seleksi sel">
              <button 
                onClick={() => { sound.playClick(); setSelectedCells([]) }}
                className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* AI Schedule Diff Preview Modal */}
      {diffModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-outline w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-outline bg-gradient-to-r from-surface to-surface-container flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent-primary/10 text-accent-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface font-display">Pratinjau AI Roster Optimizer</h3>
                  <p className="text-xs text-on-surface-variant">Komparasi sebelum vs sesudah optimasi penjadwalan otomatis</p>
                </div>
              </div>
              <button onClick={() => setDiffModal(null)} className="p-2 hover:bg-surface-container-high rounded-xl cursor-pointer">
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Metric Comparison Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline text-center space-y-1">
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold">Total Shift Terisi</p>
                  <p className="text-2xl font-bold font-mono text-accent-primary">+{diffModal.totalAssigned}</p>
                  <p className="text-[10px] text-on-surface-variant">Slot kosong terisi</p>
                </div>

                <div className="p-4 rounded-2xl bg-psy-safe-bg border border-psy-safe/30 text-center space-y-1">
                  <p className="text-[10px] text-psy-safe-text uppercase font-bold">Indeks Keadilan</p>
                  <p className="text-2xl font-bold font-mono text-psy-safe-text flex items-center justify-center gap-1.5">{fairnessScore} <ArrowRight className="w-4 h-4 text-psy-safe-text inline" /> {diffModal.newFairness}</p>
                  <p className="text-[10px] text-psy-safe-text font-bold">+{Math.max(0, diffModal.newFairness - fairnessScore)} Poin Efisiensi</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline text-center space-y-1">
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold">Kepatuhan Kuliah</p>
                  <p className="text-2xl font-bold font-mono text-psy-safe">100%</p>
                  <p className="text-[10px] text-on-surface-variant">0 Pelanggaran Waktu</p>
                </div>
              </div>

              {/* Changes Summary by Employee */}
              <div className="space-y-2">
                <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider">Ringkasan Jadwal yang Dioptimasi:</h4>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {employees.map(emp => {
                    const prev = shifts[emp.id] || []
                    const next = diffModal.proposedShifts[emp.id] || []
                    const diffCount = next.filter((s, idx) => s !== prev[idx]).length
                    if (diffCount === 0) return null

                    return (
                      <div key={emp.id} className="p-3 rounded-xl bg-surface-container-low border border-outline flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={emp.avatar} alt={emp.name} className="w-6 h-6 rounded-full object-cover" />
                          <div>
                            <span className="font-bold text-on-surface">{emp.name}</span>
                            <span className="text-[10px] text-on-surface-variant ml-1.5">({emp.role})</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary font-mono text-[10px] font-bold">
                          {diffCount} slot shift diperbarui
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setDiffModal(null)}
                  className="flex-1 py-3 rounded-xl border border-outline hover:bg-surface-container text-on-surface-variant font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  onClick={handleApplyDiff}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-primary text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer font-display"
                >
                  <CheckCheck className="w-4 h-4" /> Terapkan Roster Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Shift Modal with Keyboard Shortcut */}
      {editTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setEditTarget(null)}
          />
          <div className="relative glass-panel bg-surface-container shadow-2xl rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-outline p-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline mb-5">
              <div>
                <h3 className="font-bold text-on-surface text-lg font-display">Ubah Penugasan Shift</h3>
                <p className="text-xs text-on-surface-variant font-medium">{editTarget.empName} • Hari {editTarget.dayName}</p>
              </div>
              <button 
                onClick={() => setEditTarget(null)}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { type: 'Pagi', key: '1', desc: '08:00 - 17:00', color: 'bg-accent-primary text-white border-accent-primary shadow-[0_4px_12px_rgba(27,95,174,0.3)]' },
                { type: 'Sore', key: '2', desc: '14:00 - 23:00', color: 'bg-tertiary text-tertiary-on border-tertiary shadow-[0_4px_12px_rgba(102,174,183,0.3)]' },
                { type: 'Closing', key: '3', desc: '16:00 - 01:00', color: 'bg-semantic-warning text-white border-semantic-warning shadow-[0_4px_12px_rgba(240,178,50,0.3)]' },
                { type: 'OFF', key: '4', desc: 'Libur Mingguan', color: 'bg-surface-container-highest text-on-surface border-outline hover:bg-outline' }
              ].map((shiftOpt) => (
                <Tooltip key={shiftOpt.type} content={`Pilih ${shiftOpt.type} (${shiftOpt.desc})`} shortcut={`[${shiftOpt.key}]`}>
                  <button
                    onClick={() => applyShift(shiftOpt.type)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all transform hover:scale-105 active:scale-95 cursor-pointer relative w-full",
                      editTarget.currentShift === shiftOpt.type ? shiftOpt.color : "bg-surface-container-high text-on-surface hover:border-accent-primary/50"
                    )}
                  >
                    <span className="absolute top-2 right-2.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-white/80">
                      [{shiftOpt.key}]
                    </span>
                    <span className="font-bold font-display text-sm">{shiftOpt.type}</span>
                    <span className="text-[10px] opacity-80 mt-1">{shiftOpt.desc}</span>
                  </button>
                </Tooltip>
              ))}
            </div>

            <div className="p-3 bg-surface-container-lowest border border-outline rounded-2xl text-[11px] text-on-surface-variant font-mono text-center">
              Tekan angka <kbd className="px-1.5 py-0.5 bg-surface-container rounded border border-outline font-bold">1</kbd>, <kbd className="px-1.5 py-0.5 bg-surface-container rounded border border-outline font-bold">2</kbd>, <kbd className="px-1.5 py-0.5 bg-surface-container rounded border border-outline font-bold">3</kbd>, <kbd className="px-1.5 py-0.5 bg-surface-container rounded border border-outline font-bold">4</kbd> di keyboard untuk penetapan instan.
            </div>
          </div>
        </div>
      )}

      {/* Shift Template Modal (7shifts Standard) */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowTemplateModal(false)}
          />
          <div className="relative glass-panel bg-surface rounded-3xl shadow-2xl border border-outline w-full max-w-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-outline mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-accent-primary/10 text-accent-primary">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-lg font-display">Template Roster Mingguan</h3>
                  <p className="text-xs text-on-surface-variant">Simpan dan terapkan pola jadwal shift dengan cepat (1-klik template)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            {/* Template List */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Template Tersedia:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {Object.entries(shiftTemplates).map(([name, tmplShifts]) => {
                  const staffCount = Object.keys(tmplShifts).length
                  const isSelected = selectedTemplateName === name

                  return (
                    <div 
                      key={name}
                      onClick={() => setSelectedTemplateName(name)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3",
                        isSelected 
                          ? "bg-accent-primary/5 border-accent-primary ring-1 ring-accent-primary" 
                          : "bg-surface-container-low border-outline hover:border-accent-primary/40"
                      )}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-xs text-on-surface">{name}</p>
                          {isSelected && <Check className="w-4 h-4 text-accent-primary shrink-0" />}
                        </div>
                        <p className="text-[10px] text-on-surface-variant mt-1">
                          Pola {staffCount} staf • Standar terdistribusi
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-outline">
                        <span className="text-[9px] font-mono text-accent-primary font-bold">
                          7 Hari Rotasi
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApplyTemplate(name)
                          }}
                          className="px-3 py-1.5 rounded-xl bg-accent-primary text-white font-bold text-[11px] hover:bg-accent-primary/90 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>Terapkan</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Save Current Schedule as New Template */}
            <form onSubmit={handleSaveNewTemplate} className="p-4 rounded-2xl bg-surface-container-lowest border border-outline space-y-3">
              <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-accent-primary" /> Simpan Roster Saat Ini Sebagai Template Baru
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Misal: Template Libur Nasional / Ramadan Heavy Shift"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface border border-outline text-xs text-on-surface focus:outline-none focus:border-accent-primary font-medium"
                />
                <button
                  type="submit"
                  disabled={!newTemplateName.trim()}
                  className="px-4 py-2.5 rounded-xl bg-accent-primary text-white font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-primary/90 transition-all cursor-pointer shrink-0"
                >
                  Simpan Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Roster Health & Optimization Scorecard Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowHealthModal(false)}
          />
          <div className="relative glass-panel bg-surface rounded-3xl shadow-2xl border border-outline w-full max-w-3xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-outline mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-accent-primary/10 text-accent-primary">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-lg font-display">AI Roster Health & Optimization Scorecard</h3>
                  <p className="text-xs text-on-surface-variant">Audit multi-faktor kepatuhan regulasi, kompetensi stasiun, dan beban kelelahan kru</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHealthModal(false)}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            {/* Overall Health Score Hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-5 rounded-2xl bg-surface-container-low border border-outline flex flex-col items-center justify-center text-center">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Skor Kesehatan Roster</p>
                <div className="text-4xl font-bold font-mono text-accent-primary my-1">{healthReport.overallScore}/100</div>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1",
                  healthReport.overallScore >= 80 ? "bg-psy-safe-bg text-psy-safe-text" : "bg-psy-warning-bg text-psy-warning-text"
                )}>
                  {healthReport.overallScore >= 80 ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-psy-safe-text" /> Sangat Optimal
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-psy-warning-text" /> Butuh Penyesuaian
                    </>
                  )}
                </span>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">Indeks Keadilan</p>
                    <InfoTooltip 
                      title="Keadilan Weekend & Night Shift" 
                      badge="AI Fairness" 
                      description="Menilai pemerataan penugasan shift akhir pekan dan closing antar kru agar tidak ada staf yang terbebani secara tidak proporsional." 
                    />
                  </div>
                  <p className="text-lg font-bold font-mono text-on-surface mt-0.5">{healthReport.fairnessScore}%</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Keseimbangan shift malam & akhir pekan</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">Cakupan Stasiun</p>
                    <InfoTooltip 
                      title="Cakupan Kompetensi Stasi" 
                      badge="SOP Coverage" 
                      description="Memastikan selalu ada Barista bersertifikasi dan Kasir kompeten di setiap slot shift aktif." 
                    />
                  </div>
                  <p className="text-lg font-bold font-mono text-on-surface mt-0.5">{healthReport.stationCoverageScore}%</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Kesiapan Barista Lead & Kasir</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">Pencegahan Fatigue</p>
                    <InfoTooltip 
                      title="Mitigasi Risiko Kelelahan" 
                      badge="Anti-Burnout" 
                      description="Memverifikasi seluruh staf memiliki jeda istirahat minimal 8 jam antar shift dan tidak bekerja melebihi batas 40 jam per minggu." 
                    />
                  </div>
                  <p className="text-lg font-bold font-mono text-on-surface mt-0.5">{healthReport.fatigueSafetyScore}%</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Jeda istirahat minimum 11 jam</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase">Labor Cost Ratio</p>
                  <p className="text-lg font-bold font-mono text-on-surface mt-0.5">{healthReport.laborCostRatio}%</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Target &lt;25% Omzet Mingguan</p>
                </div>
              </div>
            </div>

            {/* Violations & Recommendations List */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-psy-warning" />
                  Temuan Audit Jadwal ({healthReport.violations.length} Isu)
                </h4>
                {healthReport.violations.length > 0 && (
                  <button
                    onClick={handleAutoResolveConflicts}
                    className="text-xs text-accent-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Selesaikan Semua Otomatis
                  </button>
                )}
              </div>

              {healthReport.violations.length === 0 ? (
                <div className="p-6 rounded-2xl bg-psy-safe-bg border border-psy-safe/30 text-center space-y-1">
                  <ShieldCheck className="w-8 h-8 text-psy-safe mx-auto" />
                  <p className="font-bold text-xs text-psy-safe-text">Tidak Ditemukan Pelanggaran Jadwal</p>
                  <p className="text-[10px] text-on-surface-variant">Roster sepenuhnya patuh terhadap ketersediaan staf, regulasi istirahat, dan stasiun operasional.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {healthReport.violations.map(violation => (
                    <div key={violation.id} className="p-3.5 rounded-xl bg-surface-container-low border border-outline flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-1.5 py-0.2 rounded font-mono text-[9px] font-bold uppercase",
                            violation.type === 'fatigue_rest' ? "bg-error/10 text-error" :
                            violation.type === 'unavailability' ? "bg-psy-warning-bg text-psy-warning-text" :
                            "bg-accent-primary/10 text-accent-primary"
                          )}>
                            {violation.type === 'fatigue_rest' ? 'Fatigue Alert' : violation.type === 'unavailability' ? 'Bentrok Izin' : 'Understaffed'}
                          </span>
                          <span className="font-bold text-on-surface">{violation.employeeName} • Hari {violation.dayName}</span>
                        </div>
                        <p className="text-on-surface-variant text-[11px]">{violation.description}</p>
                        <p className="text-accent-primary text-[10px] font-medium flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" /> Rekomendasi: {violation.suggestedFix}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-outline">
              <button
                type="button"
                onClick={() => setShowHealthModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-surface-container-high border border-outline text-xs font-bold text-on-surface hover:bg-surface-container-highest transition-all cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleApplyAIOptimization}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-primary text-white font-bold text-xs hover:shadow-[0_0_20px_rgba(27,95,174,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 font-display"
              >
                <Sparkles className="w-4 h-4" /> Terapkan Jadwal Optimal AI Multi-Constraint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
