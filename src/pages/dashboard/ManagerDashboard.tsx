import { useHRStore } from '@/store/useHRStore'
import { Users, BrainCircuit, AlertTriangle, Activity, Sparkles, Clock, DollarSign, Flame, UserCheck, TrendingUp, Shield, Info, ShieldCheck, Filter } from 'lucide-react'
import { TiltCard } from '@/components/motion/TiltCard'
import { toast } from 'sonner'
import { useMemo, useState, useEffect } from 'react'
import { sound } from '@/lib/sound'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from '@/components/ui/Tooltip'
import { BRANCH_PROFILES } from '@/lib/branches'
import { cn } from '@/lib/utils'

// Shift schedule config: [startHour, endHour]
const SHIFT_SCHEDULE: Record<string, [number, number]> = {
  'Pagi': [8, 17],
  'Sore': [14, 23],
  'Closing': [16, 1], // next day
}

function useShiftCountdown() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentSecond = now.getSeconds()
  const totalCurrentSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond

  let activeShiftName = 'Tidak Ada Shift'
  let remainingLabel = '--'
  let remainingPercent = 0

  for (const [name, [start, end]] of Object.entries(SHIFT_SCHEDULE)) {
    const startSec = start * 3600
    let endSec = end * 3600
    // Closing shift crosses midnight
    if (name === 'Closing') {
      const isInShift = currentHour >= 16 || currentHour < 1
      if (isInShift) {
        activeShiftName = name
        const totalDuration = (24 - 16 + 1) * 3600 // 9 jam
        let remaining: number
        if (currentHour >= 16) {
          remaining = totalDuration - (totalCurrentSeconds - startSec)
        } else {
          remaining = endSec - totalCurrentSeconds
        }
        if (remaining > 0) {
          const hrs = Math.floor(remaining / 3600)
          const mins = Math.floor((remaining % 3600) / 60)
          remainingLabel = `${hrs}j ${mins}m`
          remainingPercent = Math.max(0, Math.min(100, 100 - (remaining / totalDuration) * 100))
        }
        break
      }
    } else {
      if (totalCurrentSeconds >= startSec && totalCurrentSeconds < endSec) {
        activeShiftName = name
        const totalDuration = endSec - startSec
        const elapsed = totalCurrentSeconds - startSec
        const remaining = totalDuration - elapsed
        if (remaining > 0) {
          const hrs = Math.floor(remaining / 3600)
          const mins = Math.floor((remaining % 3600) / 60)
          remainingLabel = `${hrs}j ${mins}m`
          remainingPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))
        }
        break
      }
    }
  }

  return { activeShiftName, remainingLabel, remainingPercent, now }
}

export function ManagerDashboard() {
  const employees = useHRStore(state => state.employees)
  const auditLogs = useHRStore(state => state.auditLogs)
  const attendances = useHRStore(state => state.attendances)
  const autoBalanceShifts = useHRStore(state => state.autoBalanceShifts)
  const addAuditLog = useHRStore(state => state.addAuditLog)
  const handoverNotes = useHRStore(state => state.handoverNotes)
  const employeeMoods = useHRStore(state => state.employeeMoods)
  const attestationRecords = useHRStore(state => state.attestationRecords || [])
  const navigate = useNavigate()

  const [floorStatusFilter, setFloorStatusFilter] = useState<'ALL' | 'ON_DUTY' | 'LATE' | 'OFF'>('ALL')

  const { activeShiftName, remainingLabel, now } = useShiftCountdown()

  const headcount = employees.length

  const highRiskEmployees = useMemo(() => {
    return employees.filter(e => (e.attritionRisk || 0) > 40)
  }, [employees])

  const onDutyEmployees = useMemo(() => {
    return attendances.filter(a => a.timeIn !== '--:--' && a.timeOut === '--:--')
  }, [attendances])

  const lateEmployees = useMemo(() => {
    return attendances.filter(a => a.status === 'Terlambat')
  }, [attendances])

  const offDutyEmployees = useMemo(() => {
    const activeIds = new Set(onDutyEmployees.map(a => a.employeeId))
    return employees.filter(e => !activeIds.has(e.id))
  }, [employees, onDutyEmployees])

  const filteredFloorStaff = useMemo(() => {
    if (floorStatusFilter === 'ON_DUTY') {
      return onDutyEmployees.map(att => ({
        ...att,
        employee: employees.find(e => e.id === att.employeeId),
        dutyStatus: 'On-Duty' as const
      }))
    }
    if (floorStatusFilter === 'LATE') {
      return lateEmployees.map(att => ({
        ...att,
        employee: employees.find(e => e.id === att.employeeId),
        dutyStatus: 'Late' as const
      }))
    }
    if (floorStatusFilter === 'OFF') {
      return offDutyEmployees.map(emp => {
        const att = attendances.find(a => a.employeeId === emp.id)
        return {
          id: emp.id,
          employeeId: emp.id,
          name: emp.name,
          role: emp.role,
          avatar: emp.avatar,
          timeIn: att?.timeIn || '--:--',
          timeOut: att?.timeOut || '--:--',
          status: att?.status || 'Belum Hadir',
          geofence: att?.geofence || 'Off Shift',
          coordinates: att?.coordinates,
          date: 'Hari Ini',
          employee: emp,
          dutyStatus: 'Off' as const
        }
      })
    }
    // ALL
    return employees.map(emp => {
      const att = attendances.find(a => a.employeeId === emp.id)
      const isOnDuty = att && att.timeIn !== '--:--' && att.timeOut === '--:--'
      const isLate = att && att.status === 'Terlambat'
      return {
        id: emp.id,
        employeeId: emp.id,
        name: emp.name,
        role: emp.role,
        avatar: emp.avatar,
        timeIn: att?.timeIn || '--:--',
        timeOut: att?.timeOut || '--:--',
        status: att?.status || 'Belum Hadir',
        geofence: att?.geofence || 'Belum Clock-In',
        coordinates: att?.coordinates,
        date: 'Hari Ini',
        employee: emp,
        dutyStatus: isOnDuty ? ('On-Duty' as const) : isLate ? ('Late' as const) : ('Off' as const)
      }
    })
  }, [floorStatusFilter, onDutyEmployees, lateEmployees, offDutyEmployees, employees, attendances])

  // Total monthly estimated labor cost
  const monthlyLaborCost = useMemo(() => {
    return employees.reduce((total, emp) => {
      const base = emp.baseSalary
      const overtime = emp.overtimeHours * emp.rate * 4 // weekly avg * 4
      const night = emp.nightShiftsMonth * 50000
      const grossSalary = base + overtime + night
      return total + grossSalary
    }, 0)
  }, [employees])

  const weeklyLaborCost = monthlyLaborCost / 4

  // Estimated revenue (cafe context: ~Rp 85k avg order * 150 customers * 7 days / week)
  const estimatedWeeklyRevenue = 85000 * 150 * 7
  const laborCostRatioPercent = Math.round((weeklyLaborCost / estimatedWeeklyRevenue) * 100)
  const laborRatioStatus = laborCostRatioPercent < 25 ? 'Sehat' : laborCostRatioPercent < 35 ? 'Waspada' : 'Kritis'
  const laborRatioColor = laborCostRatioPercent < 25 ? 'text-psy-safe-text' : laborCostRatioPercent < 35 ? 'text-semantic-warning' : 'text-error'
  const laborRatioBg = laborCostRatioPercent < 25 ? 'bg-psy-safe-bg' : laborCostRatioPercent < 35 ? 'bg-semantic-warning/10' : 'bg-error/10'

  // Rush hour detection
  const currentHour = now.getHours()
  const isRushHour = (currentHour >= 11 && currentHour < 14) || (currentHour >= 17 && currentHour < 20)
  const nextRushHour = currentHour < 12 ? '12:00 - 14:00' : currentHour < 18 ? '18:00 - 20:00' : 'Besok 12:00'

  const urgentNotes = handoverNotes.filter(n => n.priority === 'urgent')

  const activeBranch = useHRStore(state => state.activeBranch)
  const currentBranch = BRANCH_PROFILES[activeBranch] || BRANCH_PROFILES['Senopati (HQ)']

  return (
    <div className="space-y-6">
      {/* Real-time Operational Barometer Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-outline bg-gradient-to-r from-surface to-surface-container flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-psy-safe/10 border border-psy-safe/30 flex items-center justify-center text-psy-safe">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-on-surface font-display">Operasional {currentBranch.name}</h3>
              <Tooltip content={`Status live cabang: ${currentBranch.status}. Target staf: ${currentBranch.staffTarget}`}>
                <span className="px-2 py-0.5 rounded-full bg-psy-safe-bg text-psy-safe-text text-[10px] font-bold uppercase font-mono cursor-help">
                  {currentBranch.status}
                </span>
              </Tooltip>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Shift Aktif: <strong className="text-on-surface">
                {activeShiftName !== 'Tidak Ada Shift' ? `Shift ${activeShiftName}` : 'Di Luar Jam Operasional'}
              </strong> • {onDutyEmployees.length} staf bertugas di lantai kedai • <span className="font-mono text-[10px] opacity-70">{currentBranch.address}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <Tooltip content="Hitung mundur sisa waktu durasi shift operasional aktif saat ini">
            <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline flex items-center gap-2 cursor-help">
              <Clock className="w-4 h-4 text-accent-primary" />
              <span>
                {activeShiftName !== 'Tidak Ada Shift'
                  ? <>Shift {activeShiftName}: <strong className="text-on-surface">Sisa {remainingLabel}</strong></>
                  : <strong className="text-on-surface-variant">Semua Shift Selesai</strong>
                }
              </span>
            </div>
          </Tooltip>

          <Tooltip content={isRushHour ? 'Saat ini jam sibuk kedai sedang aktif. Pastikan semua barista & kasir di posisi.' : 'Estimasi jam sibuk berikutnya berdasarkan pola transaksi kedai.'}>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-help ${isRushHour ? 'bg-error/10 border-error/30' : 'bg-surface-container-lowest border-outline'}`}>
              <Flame className={`w-4 h-4 ${isRushHour ? 'text-error animate-pulse' : 'text-semantic-warning'}`} />
              <span>
                {isRushHour ? <><strong className="text-error">Rush Hour AKTIF!</strong></> : <>Rush Hour: <strong className="text-semantic-warning">{nextRushHour}</strong></>}
              </span>
            </div>
          </Tooltip>

          {urgentNotes.length > 0 && (
            <Tooltip content="Terdapat catatan serah terima dengan prioritas urgent yang butuh perhatian manajer">
              <button
                onClick={() => { sound.playClick(); navigate('/attendance') }}
                className="p-2.5 rounded-xl bg-semantic-warning/10 border border-semantic-warning/30 flex items-center gap-2 cursor-pointer hover:bg-semantic-warning/20 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-semantic-warning" />
                <span className="text-semantic-warning font-bold">{urgentNotes.length} Catatan Urgent</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Headcount */}
        <TiltCard className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-outline hover:border-accent-primary/50 transition-colors shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Total Headcount Tim</p>
                <Tooltip content="Total kapasitas tim yang terdaftar vs batas maksimum struktur organisasi kedai (20 staf).">
                  <Info className="w-3.5 h-3.5 text-on-surface-variant cursor-help mb-1" />
                </Tooltip>
              </div>
              <h3 className="text-4xl font-bold text-on-surface mt-1 font-display">
                {headcount} <span className="text-base text-on-surface-variant font-semibold">/ 20</span>
              </h3>
            </div>
            <div className="p-3.5 bg-accent-primary/10 rounded-2xl text-accent-primary">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-on-surface-variant font-semibold mb-2">
              <span>Kapasitas Roster</span>
              <span className="text-accent-primary font-bold">{Math.round((headcount / 20) * 100)}% Terisi</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-accent-primary to-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${(headcount / 20) * 100}%` }} />
            </div>
          </div>
        </TiltCard>

        {/* Labor Cost Barometer */}
        <TiltCard className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-outline hover:border-tertiary/50 transition-colors shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Labor Cost Ratio</p>
                <Tooltip content="Rasio biaya tenaga kerja mingguan terhadap proyeksi omzet kedai (Standar F&B: <25% Sehat, 25-35% Waspada, >35% Kritis).">
                  <Info className="w-3.5 h-3.5 text-on-surface-variant cursor-help mb-1" />
                </Tooltip>
              </div>
              <h3 className="text-3xl font-bold text-on-surface mt-1 font-display">
                {laborCostRatioPercent}%{' '}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md font-mono ${laborRatioColor} ${laborRatioBg}`}>
                  {laborRatioStatus}
                </span>
              </h3>
            </div>
            <div className="p-3.5 bg-tertiary/10 rounded-2xl text-tertiary">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-on-surface-variant font-semibold mb-2">
              <span>Estimasi Gaji Minggu Ini</span>
              <span className="text-on-surface font-mono font-bold">Rp {Math.round(weeklyLaborCost).toLocaleString('id-ID')}</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${laborCostRatioPercent < 25 ? 'bg-gradient-to-r from-psy-safe to-psy-safe/60' : laborCostRatioPercent < 35 ? 'bg-gradient-to-r from-semantic-warning to-semantic-warning/60' : 'bg-gradient-to-r from-error to-error/60'}`}
                style={{ width: `${Math.min(laborCostRatioPercent * 2, 100)}%` }}
              />
            </div>
          </div>
        </TiltCard>

        {/* Attrition Risk */}
        <TiltCard className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-error/20 bg-error/5 hover:border-error/40 transition-colors shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-error font-bold uppercase tracking-wider mb-1">Attrition / Fatigue Risk</p>
                <Tooltip content="Pencegahan risiko kelelahan dan burnout berdasarkan akumulasi shift malam dan lembur beruntun.">
                  <Info className="w-3.5 h-3.5 text-error cursor-help mb-1" />
                </Tooltip>
              </div>
              <h3 className="text-4xl font-bold text-error mt-1 font-display">
                {highRiskEmployees.length} <span className="text-base text-error/70 font-semibold">Staf</span>
              </h3>
            </div>
            <div className="p-3.5 bg-error/10 rounded-2xl text-error">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant mb-2">Risiko Tinggi Kelelahan:</p>
            <div className="space-y-2">
              {highRiskEmployees.slice(0, 2).map(e => (
                <Tooltip key={e.id} content={`Penyebab: ${(e.attritionFactors || []).join(', ')} • Skor Risiko: ${e.attritionRisk}%`}>
                  <div className="flex items-center gap-3 p-2 bg-surface rounded-xl border border-error/10 shadow-sm cursor-help w-full">
                    <img src={e.avatar} alt={e.name} className="w-8 h-8 rounded-full object-cover border border-error/20" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-on-surface truncate">{e.name}</p>
                      <p className="text-[10px] text-error truncate">{e.attritionFactors?.[0]}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-error bg-error/10 px-2 py-1 rounded-lg">{e.attritionRisk}%</span>
                  </div>
                </Tooltip>
              ))}
              {highRiskEmployees.length === 0 && (
                <div className="text-center py-2 text-xs text-psy-safe-text font-bold">Semua kru berada dalam kondisi aman.</div>
              )}
            </div>
          </div>
        </TiltCard>

        {/* AI Auto-Balance */}
        <TiltCard className="glass-panel rounded-3xl p-6 border-2 border-accent-primary/20 bg-gradient-to-br from-accent-primary/5 to-surface-container flex flex-col justify-between hover:border-accent-primary/40 transition-all shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3 bg-surface w-fit px-3 py-1 rounded-full text-[11px] text-accent-primary font-bold shadow-sm border border-accent-primary/10">
              <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
              <BrainCircuit className="w-4 h-4" />
              <span>AI Anomaly Insight</span>
            </div>
            <p className="text-xs text-on-surface leading-relaxed mb-3 font-medium">
              Biaya lembur terdeteksi naik <strong className="text-semantic-warning font-bold">23%</strong> minggu ini akibat shift malam beruntun.
            </p>
            <div className="p-3 rounded-2xl bg-surface border border-accent-primary/20 text-[11px] text-on-surface-variant shadow-sm mb-3">
              <p className="leading-relaxed"><Sparkles className="w-3.5 h-3.5 inline-block text-accent-primary mr-1" /> Rekomendasi: Seimbangkan shift malam untuk hemat estimasi <strong>Rp 975.000</strong>.</p>
            </div>
          </div>
          <Tooltip content="AI otomatis membagi ulang shift lembur staf berisiko ke staf yang memiliki kapasitas jam kerja">
            <button
              onClick={() => {
                sound.playSuccess()
                autoBalanceShifts()
                addAuditLog({ user: 'System AI', action: 'Shift Auto-Balance', detail: 'Mengalihkan shift lembur untuk staf risiko tinggi' })
                toast.success("Shift berhasil diseimbangkan secara otomatis!", {
                  description: "Estimasi penghematan: Rp 975.000",
                  action: { label: 'Lihat Kalender', onClick: () => navigate('/calendar') }
                })
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-accent-primary text-white hover:bg-accent-primary/90 hover:shadow-lg font-bold text-xs transition-all font-display cursor-pointer"
            >
              Auto-Balance Shift AI
            </button>
          </Tooltip>
        </TiltCard>
      </div>

      {/* Live Who's On Floor Matrix (Deputy / 7shifts Standard) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* On-Duty & Floor Staf Live Status */}
        <div className="lg:col-span-2 glass-panel p-6 border border-outline rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-accent-primary" />
              <div>
                <h3 className="font-bold text-on-surface text-base font-display">Who's On Floor — Live Status</h3>
                <p className="text-[11px] text-on-surface-variant">Monitoring real-time staf di lantai operasional, presensi GPS, dan status kesiapan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-psy-safe-bg text-psy-safe-text text-xs font-bold font-mono">
                {onDutyEmployees.length} Bertugas
              </span>
              {lateEmployees.length > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-error/10 text-error text-xs font-bold font-mono">
                  {lateEmployees.length} Terlambat
                </span>
              )}
            </div>
          </div>

          {/* Filter Preset Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-outline/50 text-xs">
            <span className="text-on-surface-variant font-bold text-[11px] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-accent-primary" /> Filter:
            </span>
            {[
              { id: 'ALL', label: 'Semua Staf', count: employees.length },
              { id: 'ON_DUTY', label: 'On-Duty (Lantai)', count: onDutyEmployees.length },
              { id: 'LATE', label: 'Terlambat', count: lateEmployees.length },
              { id: 'OFF', label: 'Off / Belum Masuk', count: offDutyEmployees.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick()
                  setFloorStatusFilter(tab.id as any)
                }}
                className={cn(
                  "px-3 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  floorStatusFilter === tab.id
                    ? "bg-accent-primary text-white shadow-sm"
                    : "bg-surface-container-high text-on-surface hover:text-accent-primary border border-outline"
                )}
              >
                <span>{tab.label}</span>
                <span className={cn(
                  "px-1.5 py-0.2 rounded-md text-[10px] font-mono",
                  floorStatusFilter === tab.id ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {filteredFloorStaff.map((record) => {
              const mood = employeeMoods[record.employeeId]
              const isOnDuty = record.dutyStatus === 'On-Duty'
              const isLate = record.dutyStatus === 'Late'

              return (
                <Tooltip 
                  key={record.id} 
                  content={`Staf: ${record.name} • Departemen: ${record.employee?.dept} • Check-in: ${record.timeIn} WIB • Geofence: ${record.geofence} • Koordinat: ${record.coordinates || '-6.2289, 106.8021'}`}
                >
                  <div className={cn(
                    "p-3.5 rounded-2xl border transition-all cursor-help flex items-start justify-between gap-3",
                    isOnDuty ? "bg-surface-container-low border-psy-safe/30 hover:border-psy-safe/60" :
                    isLate ? "bg-error/5 border-error/30 hover:border-error/50" :
                    "bg-surface-container-lowest border-outline opacity-80"
                  )}>
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img src={record.avatar} alt={record.name} className="w-10 h-10 rounded-2xl object-cover border border-outline" />
                        <span className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface",
                          isOnDuty ? "bg-psy-safe" : isLate ? "bg-error" : "bg-on-surface-variant/40"
                        )} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-on-surface truncate">{record.name}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{record.role} • {record.employee?.dept}</p>
                        
                        {/* Readiness Mood Badge */}
                        {mood && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="px-1.5 py-0.5 rounded-md bg-accent-primary/10 text-accent-primary text-[9px] font-bold font-mono">
                              {mood.mood === 'ready' ? '⚡ Siap Tempur' : mood.mood === 'good' ? '✓ Bugar' : '☕ Butuh Kopi'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11px] shrink-0">
                      <p className="font-bold text-on-surface">
                        {isOnDuty ? `In: ${record.timeIn}` : isLate ? `Telat: ${record.timeIn}` : 'Off Shift'}
                      </p>
                      <p className={cn(
                        "text-[9px] font-sans font-bold mt-0.5",
                        isOnDuty ? (record.geofence.startsWith('Inside') ? 'text-psy-safe-text' : 'text-error') :
                        isLate ? 'text-error' : 'text-on-surface-variant'
                      )}>
                        {isOnDuty ? (record.geofence.startsWith('Inside') ? '● Radius HQ' : '▲ Luar Area') :
                         isLate ? '● Terlambat' : 'Rest Day'}
                      </p>
                    </div>
                  </div>
                </Tooltip>
              )
            })}
            {filteredFloorStaff.length === 0 && (
              <div className="col-span-2 text-center py-8 text-xs text-on-surface-variant font-semibold">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-20" />
                Tidak ada staf yang sesuai dengan filter
              </div>
            )}
          </div>

          {/* Live Handover Urgent Notes */}
          {urgentNotes.length > 0 && (
            <div className="mt-2 pt-3 border-t border-outline">
              <p className="text-[10px] font-bold text-semantic-warning uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Catatan Handover Urgent
              </p>
              {urgentNotes.slice(0, 1).map(note => (
                <div key={note.id} className="p-2.5 rounded-xl bg-semantic-warning/10 border border-semantic-warning/30 text-[11px] text-on-surface">
                  <p className="font-bold text-semantic-warning text-[10px]">{note.author} — {note.shift}</p>
                  <p className="leading-relaxed mt-0.5">{note.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log & Digital Attestation Trail */}
        <div className="space-y-6">
          {/* Digital Attestations Signed */}
          <div className="glass-panel p-6 border border-outline rounded-3xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-psy-safe" />
                <h3 className="font-bold text-on-surface text-sm font-display">Attestation Compliance</h3>
              </div>
              <span className="text-[10px] font-mono text-psy-safe-text bg-psy-safe-bg px-2 py-0.5 rounded-md font-bold">
                {attestationRecords.length} Tervalidasi
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant mb-3">Audit trail konfirmasi istirahat & K3 saat karyawan clock-out</p>
            
            <div className="space-y-2">
              {attestationRecords.slice(0, 2).map((rec) => (
                <div key={rec.id} className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline text-[10px]">
                  <div className="flex justify-between items-center font-bold text-on-surface">
                    <span>{rec.employeeName}</span>
                    <span className="font-mono text-on-surface-variant">{rec.timestamp}</span>
                  </div>
                  <p className="text-on-surface-variant text-[9px] mt-0.5 line-clamp-1">{rec.notes || 'Istirahat & K3 terkonfirmasi aman.'}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[8px] font-mono text-psy-safe-text">
                    <span>✓ Break 1 Jam</span>
                    <span>•</span>
                    <span>✓ K3 Fit</span>
                  </div>
                </div>
              ))}
              {attestationRecords.length === 0 && (
                <div className="text-center py-4 text-[10px] text-on-surface-variant">Belum ada attestation hari ini</div>
              )}
            </div>
          </div>

          {/* Audit Log Activities */}
          <div className="glass-panel p-6 border border-outline rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-on-surface text-sm font-display">Log Audit Sistem</h3>
              <div className="flex items-center gap-2">
                <Tooltip content="Jumlah aktivitas perubahan jadwal & tindakan operasional yang tersimpan di log audit">
                  <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-lg border border-outline cursor-help">
                    <TrendingUp className="w-3 h-3 inline mr-1" />{auditLogs.length}
                  </span>
                </Tooltip>
                <button onClick={() => navigate('/calendar')} className="text-[11px] text-accent-primary font-bold hover:underline cursor-pointer">
                  Kalender
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {auditLogs.slice(0, 3).map((log, idx) => (
                <Tooltip key={idx} content={`Eksekutor: ${log.user} • Waktu: ${log.timestamp} • Aksi: ${log.action}`}>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline cursor-help w-full text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary shrink-0">
                        <BrainCircuit className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-on-surface truncate">{log.action}</p>
                        <p className="text-[10px] text-on-surface-variant truncate font-medium">
                          {log.detail}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-on-surface-variant font-semibold shrink-0 ml-2">
                      {log.timestamp}
                    </span>
                  </div>
                </Tooltip>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-4 text-xs text-on-surface-variant font-semibold">
                  Belum ada aktivitas tercatat
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
