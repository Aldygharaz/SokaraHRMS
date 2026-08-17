import { useState, useMemo, useEffect, useCallback } from 'react';
import { useHRStore } from '@/store/useHRStore'
import { Printer, Wand2, Filter, Edit3, X, Scale, Send, Layers, Users, Sun, Sparkles, GraduationCap, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { sound } from '@/lib/sound'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tooltip } from '@/components/ui/Tooltip'
import { BRANCH_PROFILES } from '@/lib/branches'

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

  const restoreSnapshot = useHRStore(state => state.restoreSnapshot)
  const [filter, setFilter] = useState('ALL')
  const [editTarget, setEditTarget] = useState<{empId: number, dayIdx: number, empName: string, currentShift: string, dayName: string} | null>(null)
  const [selectedCells, setSelectedCells] = useState<string[]>([])
  const [diffModal, setDiffModal] = useState<{
    proposedShifts: Record<number, string[]>
    newFairness: number
    totalAssigned: number
  } | null>(null)
  
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

  // Headcount Capacity Metrics per day
  const dayCapacities = useMemo(() => {
    return DAYS.map((_, dayIdx) => {
      const pagiCount = employees.filter(e => shifts[e.id]?.[dayIdx] === 'Pagi').length
      const soreCount = employees.filter(e => shifts[e.id]?.[dayIdx] === 'Sore').length
      const closingCount = employees.filter(e => shifts[e.id]?.[dayIdx] === 'Closing').length
      const totalActive = pagiCount + soreCount + closingCount
      const isUnderstaffed = pagiCount < 2 || soreCount < 2

      return {
        pagiCount,
        soreCount,
        closingCount,
        totalActive,
        isUnderstaffed
      }
    })
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

  const handlePublish = () => {
    sound.playSuccess()
    publishRoster()
    toast.success("Roster Resmi Berhasil Dipublikasikan!", {
      description: "Notifikasi jadwal resmi telah dibroadcast ke seluruh staf."
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative" id="calendar-print-area">
      {/* Header Panel */}
      <div className="glass-panel spotlight-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface font-display">Shift Calendar & Rostering</h2>
            
            <Tooltip content={rosterStatus === 'published' ? 'Jadwal telah dipublikasikan dan dapat diakses semua staf di portal karyawan.' : 'Jadwal masih dalam status draf, belum dibroadcast ke staf.'}>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border font-mono flex items-center gap-1.5 cursor-help",
                rosterStatus === 'published' 
                  ? "bg-psy-safe-bg text-psy-safe-text border-psy-safe/30" 
                  : "bg-psy-warning-bg text-psy-warning-text border-psy-warning/30"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", rosterStatus === 'published' ? "bg-psy-safe" : "bg-psy-warning animate-pulse")} />
                {rosterStatus === 'published' ? 'Published Roster' : 'Draft / Unsaved Changes'}
              </span>
            </Tooltip>

            <Tooltip content="Indeks Keadilan Jadwal mengukur distribusi beban shift malam agar merata antar seluruh kru (Skor 0-100).">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm cursor-help",
                fairnessScore >= 80 ? "bg-psy-safe-bg text-psy-safe-text border-psy-safe/40" : 
                fairnessScore >= 60 ? "bg-psy-warning-bg text-psy-warning-text border-psy-warning/40" : 
                "bg-psy-danger-bg text-psy-danger-text border-psy-danger/40"
              )}>
                <Scale className="w-3.5 h-3.5" /> Indeks Keadilan: {fairnessScore}/100
              </span>
            </Tooltip>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Matriks penjadwalan 7 hari berstandar 7shifts & Deputy dengan validasi kapasitas kru dan pencegahan kelelahan otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Tooltip content="Cetak jadwal roster ke format A4 atau simpan sebagai PDF">
            <button 
              onClick={() => {
                sound.playClick()
                window.print()
              }}
              className="bg-surface-container-high text-on-surface hover:text-accent-primary border border-surface-container-highest text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-accent-primary" /> Cetak Roster A4
            </button>
          </Tooltip>
          
          {activeRole === 'manager' && (
            <>
              <Tooltip content="Buka pratinjau komparasi AI untuk mengisi slot kosong dan melihat peningkatan Indeks Keadilan">
                <button 
                  onClick={handleOpenAIDiffModal}
                  className="bg-surface-container-high text-on-surface hover:text-accent-primary border border-outline text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Wand2 className="w-4 h-4 text-accent-primary" /> Auto-Fill AI Preview
                </button>
              </Tooltip>

              <Tooltip content="Publikasikan roster resmi dan kirim notifikasi jadwal ke seluruh staf">
                <button 
                  onClick={handlePublish}
                  className="bg-gradient-to-r from-accent-primary to-primary text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 hover:shadow-[0_0_18px_rgba(27,95,174,0.4)] transition-all font-display cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Publish & Broadcast
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
          <div className="glass-panel p-4 rounded-2xl border border-outline bg-gradient-to-r from-surface-container-lowest to-surface-container-low flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent-primary/10 text-accent-primary">
                <Sun className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-on-surface font-display">{currentBranch.eventContext.title}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-psy-safe-bg text-psy-safe-text font-bold text-[10px] border border-psy-safe/30 font-mono">
                    {currentBranch.eventContext.badge}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  {currentBranch.eventContext.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip content={`Rekomendasi AI spesifik untuk ${currentBranch.name}`}>
                <span className="px-3 py-1.5 rounded-xl bg-accent-primary/10 border border-accent-primary/30 text-accent-primary font-bold text-xs flex items-center gap-1.5 cursor-help shrink-0">
                  <Sparkles className="w-3.5 h-3.5" /> {currentBranch.eventContext.recommendation}
                </span>
              </Tooltip>
            </div>
          </div>
        )
      })()}

      {/* Main Roster Matrix Table */}
      <div className="glass-panel spotlight-card rounded-3xl overflow-hidden overflow-x-auto border border-outline p-0">
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

              {/* Headcount Capacity Gauge Row (7shifts standard) */}
              <tr className="bg-surface-container-low border-b border-outline text-[11px]">
                <td className="p-3 pl-4 font-bold text-on-surface-variant flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-accent-primary" /> Kapasitas Shift
                </td>
                {dayCapacities.map((cap, idx) => (
                  <td key={idx} className="p-2 text-center">
                    <Tooltip content={`Total Staf: ${cap.totalActive} orang (Pagi: ${cap.pagiCount}, Sore: ${cap.soreCount}, Closing: ${cap.closingCount}). ${cap.isUnderstaffed ? 'Perhatian: Minimum butuh 2 staf Pagi & 2 staf Sore!' : 'Kebutuhan staf terpenuhi secara ideal.'}`}>
                      <div className={cn(
                        "p-2 rounded-2xl border font-mono text-[10px] font-bold space-y-1.5 transition-colors cursor-help w-full",
                        cap.isUnderstaffed 
                          ? "bg-psy-warning-bg/60 text-psy-warning-text border-psy-warning/40 shadow-sm" 
                          : "bg-surface-container-high text-on-surface border-outline"
                      )}>
                        <div className="flex justify-center items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded-md bg-accent-primary/20 text-accent-primary text-[9px]">
                            P:{cap.pagiCount}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-tertiary/20 text-tertiary text-[9px]">
                            S:{cap.soreCount}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-semantic-warning/20 text-semantic-warning text-[9px]">
                            C:{cap.closingCount}
                          </span>
                        </div>

                        <div className={cn(
                          "text-[9px] uppercase tracking-wider font-bold py-0.5 rounded-md",
                          cap.isUnderstaffed ? "text-psy-warning-text" : "text-psy-safe-text"
                        )}>
                          {cap.isUnderstaffed ? '⚠️ Butuh +1' : '✓ Ideal'}
                        </div>
                      </div>
                    </Tooltip>
                  </td>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-container-high text-xs">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-4">
                    <Tooltip content={`PTKP: ${emp.ptkp} • KAT ${emp.kat} • Performa: ${emp.rating}/5.0 • Ketepatan Waktu: ${emp.punctuality}%`}>
                      <div className="flex items-center gap-3 cursor-help">
                        <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-xl object-cover border border-outline" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-on-surface">{emp.name}</p>
                            {emp.unavailability && emp.unavailability.length > 0 && (
                              <Tooltip content={`Kru Part-time / Mahasiswa (Tidak bisa: ${emp.unavailability.map(u => `${u.dayName} - ${u.reason}`).join(', ')})`}>
                                <span className="p-0.5 rounded bg-accent-primary/10 text-accent-primary cursor-help">
                                  <GraduationCap className="w-3.5 h-3.5" />
                                </span>
                              </Tooltip>
                            )}
                          </div>
                          <p className="text-[10px] text-on-surface-variant">{emp.role}</p>
                        </div>
                      </div>
                    </Tooltip>
                  </td>
                  {(shifts[emp.id] || Array(7).fill('OFF')).map((shift, i) => {
                    const unavailInfo = emp.unavailability?.find(u => u.dayIdx === i)
                    const cellKey = `${emp.id}_${i}`
                    const isSelected = selectedCells.includes(cellKey)

                    return (
                      <td 
                        key={i} 
                        className={cn(
                          "p-3 text-center relative group transition-all", 
                          activeRole === 'manager' && "cursor-pointer hover:bg-surface-container-high",
                          isSelected && "bg-accent-primary/20 ring-2 ring-accent-primary ring-inset"
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
                          unavailInfo 
                            ? `⚠️ Jadwal Kuliah: ${unavailInfo.reason}. ${activeRole === 'manager' ? 'Klik untuk ubah (Shift+Klik untuk multi-select).' : ''}`
                            : (activeRole === 'manager' ? `Klik untuk ubah (Shift+Klik multi-select): ${SHIFT_TOOLTIPS[shift] || shift}` : SHIFT_TOOLTIPS[shift] || shift)
                        }>
                          <div className="space-y-1">
                            <span className={cn(
                              "px-2.5 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all block w-full",
                              shift === 'Pagi' ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30" :
                              shift === 'Sore' ? "bg-tertiary/20 text-tertiary border border-tertiary/30" :
                              shift === 'Closing' ? "bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30" :
                              "bg-surface-container text-on-surface-variant border border-transparent",
                              isSelected && "bg-accent-primary text-white border-transparent"
                            )}>
                              {shift}
                            </span>
                            {unavailInfo && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-psy-warning-text font-bold">
                                <GraduationCap className="w-2.5 h-2.5" /> Kuliah
                              </span>
                            )}
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Floating Batch Selection Action Bar (Linear & Spreadsheet-grade standard) */}
      {selectedCells.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-surface/95 backdrop-blur-xl border border-accent-primary/50 shadow-2xl rounded-2xl p-2.5 flex flex-wrap items-center justify-center gap-2">
          <div className="flex items-center gap-2 pl-2 pr-3 border-r border-outline">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
            <span className="font-bold text-xs font-mono text-on-surface">
              {selectedCells.length} Sel Terpilih
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button 
              onClick={() => applyBatchShift('Pagi')}
              className="px-3 py-1.5 rounded-xl bg-accent-primary text-white font-bold hover:shadow-md transition-all cursor-pointer flex items-center gap-1 font-mono"
            >
              <span>Pagi</span> <kbd className="px-1 py-0.2 rounded bg-white/20 text-[9px]">1</kbd>
            </button>

            <button 
              onClick={() => applyBatchShift('Sore')}
              className="px-3 py-1.5 rounded-xl bg-tertiary text-white font-bold hover:shadow-md transition-all cursor-pointer flex items-center gap-1 font-mono"
            >
              <span>Sore</span> <kbd className="px-1 py-0.2 rounded bg-white/20 text-[9px]">2</kbd>
            </button>

            <button 
              onClick={() => applyBatchShift('Closing')}
              className="px-3 py-1.5 rounded-xl bg-semantic-warning text-white font-bold hover:shadow-md transition-all cursor-pointer flex items-center gap-1 font-mono"
            >
              <span>Closing</span> <kbd className="px-1 py-0.2 rounded bg-white/20 text-[9px]">3</kbd>
            </button>

            <button 
              onClick={() => applyBatchShift('OFF')}
              className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-bold border border-outline transition-all cursor-pointer flex items-center gap-1 font-mono"
            >
              <span>Libur (OFF)</span> <kbd className="px-1 py-0.2 rounded bg-surface-container-highest text-[9px]">4</kbd>
            </button>

            <button 
              onClick={() => { sound.playClick(); setSelectedCells([]) }}
              className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
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

                <div className="p-4 rounded-2xl bg-psy-safe-bg/40 border border-psy-safe/30 text-center space-y-1">
                  <p className="text-[10px] text-psy-safe-text uppercase font-bold">Indeks Keadilan</p>
                  <p className="text-2xl font-bold font-mono text-psy-safe-text">{fairnessScore} ➔ {diffModal.newFairness}</p>
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
            className="absolute inset-0 bg-surface/60 backdrop-blur-sm animate-in fade-in"
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
    </div>
  )
}
