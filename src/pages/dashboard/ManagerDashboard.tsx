import { useHRStore } from '@/store/useHRStore'
import { Users, BrainCircuit, AlertTriangle, Clock, DollarSign, Flame, UserCheck, TrendingUp, Shield, ShieldCheck, Filter, Building2, ArrowRight, Sparkles, CheckCircle2, Zap, Coffee } from 'lucide-react'
import { toast } from 'sonner'
import { useMemo, useState, useEffect } from 'react'
import { sound } from '@/lib/sound'
import { useNavigate } from 'react-router-dom'
import { Tooltip, InfoTooltip } from '@/components/ui/Tooltip'
import { BRANCH_PROFILES } from '@/lib/branches'
import { cn, timeAgo } from '@/lib/utils'

// Helper to parse '09:45 WIB' from mock data back to Date object for timeAgo
function parseWibToDate(timeStr: string) {
  if (!timeStr.includes(':')) return new Date()
  const [hh, mm] = timeStr.replace(/[^0-9:]/g, '').split(':').map(Number)
  const d = new Date()
  d.setHours(hh || 0, mm || 0, 0, 0)
  return d
}

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

  const urgentNotes = handoverNotes.filter(n => n.priority === 'urgent')

  const activeBranch = useHRStore(state => state.activeBranch)
  const currentBranch = BRANCH_PROFILES[activeBranch] || BRANCH_PROFILES['Senopati (HQ)']

  return (
    <div className="space-y-6">
      {/* Standardized Clean Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-outline">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
              Dashboard Operasional
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
              {currentBranch.name} • {currentBranch.status}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Monitoring staf aktif di lantai, rasio biaya tenaga kerja, dan kesehatan operasional kedai.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active Shift Indicator */}
          <Tooltip
            title="Shift Operasional Berjalan"
            badge={activeShiftName !== 'Tidak Ada Shift' ? "Sedang Berjalan" : "Tutup"}
            description={`Shift yang aktif saat ini di cabang ${currentBranch.name}. Waktu tersisa hingga rotasi shift: ${remainingLabel}.`}
          >
            <div className="px-3 py-1.5 rounded-lg bg-surface-low border border-outline text-xs flex items-center gap-2 cursor-help">
              <Clock className="w-3.5 h-3.5 text-accent-primary" />
              <span className="text-on-surface-variant">Shift:</span>
              <strong className="text-on-surface font-semibold">
                {activeShiftName !== 'Tidak Ada Shift' ? `${activeShiftName} (Sisa ${remainingLabel})` : 'Selesai'}
              </strong>
            </div>
          </Tooltip>

          {/* Rush Hour Badge */}
          {isRushHour && (
            <Tooltip
              title="Jam Sibuk Kedai (Rush Hour)"
              badge="Peak Hours F&B"
              description="Rentang waktu lonjakan pesanan tertinggi pelanggan (11:00-14:00 & 17:00-20:00). Pastikan seluruh kru stasiun berada di posisi masing-masing."
            >
              <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 cursor-help">
                <Flame className="w-3.5 h-3.5" />
                <span>Rush Hour Aktif</span>
              </div>
            </Tooltip>
          )}

          {/* Urgent Note Alert */}
          {urgentNotes.length > 0 && (
            <Tooltip
              title="Catatan Serah Terima Mendesak"
              badge="Prioritas Tinggi"
              description="Terdapat catatan operasional penting antar-shift yang belum ditindaklanjuti. Klik untuk membuka panel catatan presensi."
            >
              <button
                onClick={() => { sound.playClick(); navigate('/attendance') }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{urgentNotes.length} Catatan Urgent</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Multi-Branch Operational Command Center (Enterprise Matrix) */}
      <div className="surface-card p-5 rounded-xl border border-outline space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <Building2 className="w-4 h-4 text-accent-primary" />
              Multi-Branch Command Center
            </h3>
            <p className="text-xs text-on-surface-variant">Monitoring komparatif 3 cabang real-time, rasio biaya tenaga kerja, dan peminjaman kru roaming</p>
          </div>
          <button
            onClick={() => { sound.playClick(); navigate('/approval') }}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-high border border-outline text-xs font-bold text-accent-primary hover:bg-surface-container-highest transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Bursa Kru Roaming</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(BRANCH_PROFILES).map(([branchKey, profile]) => {
            const isCurrentActive = activeBranch === branchKey
            const targetRevTotal = profile.targetDailyRevenue.reduce((a, b) => a + b, 0)
            const isSudirmanDeficit = branchKey === 'Sudirman'
            const isKemangFestival = branchKey === 'Kemang'

            return (
              <div 
                key={branchKey}
                onClick={() => {
                  sound.playClick()
                  useHRStore.setState({ activeBranch: branchKey })
                  toast.success(`Cabang aktif dialihkan ke ${branchKey}`)
                }}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative",
                  isCurrentActive 
                    ? "bg-accent-primary/5 border-accent-primary ring-1 ring-accent-primary shadow-sm" 
                    : "bg-surface-container-low border-outline hover:border-accent-primary/40"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-psy-safe" />
                      <p className="font-bold text-sm text-on-surface">{profile.name}</p>
                    </div>
                    {isCurrentActive && (
                      <span className="px-2 py-0.5 rounded-full bg-accent-primary text-white text-[9px] font-bold uppercase font-mono">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1 font-mono">{profile.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline text-xs">
                  <div className="p-2 rounded-xl bg-surface-container-lowest border border-outline">
                    <p className="text-[9px] text-on-surface-variant font-bold uppercase">Staf Terisi</p>
                    <p className="font-bold font-mono text-on-surface mt-0.5">{profile.staffTarget} Staf</p>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-container-lowest border border-outline">
                    <p className="text-[9px] text-on-surface-variant font-bold uppercase">Target Omzet/Mgg</p>
                    <p className="font-bold font-mono text-on-surface mt-0.5">Rp {(targetRevTotal / 1000000).toFixed(1)} Jt</p>
                  </div>
                </div>

                {isSudirmanDeficit ? (
                  <div className="p-2 rounded-xl bg-psy-warning-bg border border-psy-warning/30 flex items-center justify-between text-[10px]">
                    <span className="text-psy-warning-text font-bold inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-psy-warning-text" /> Butuh +2 Kru Roaming
                    </span>
                    <span className="font-mono text-accent-primary font-bold">+Rp 50k Saku</span>
                  </div>
                ) : isKemangFestival ? (
                  <div className="p-2 rounded-xl bg-tertiary/10 border border-tertiary/30 flex items-center justify-between text-[10px]">
                    <span className="text-tertiary font-bold inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-tertiary" /> Event Art Bazaar Weekend
                    </span>
                    <span className="font-mono text-tertiary font-bold">Trafik 98%</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-psy-safe-bg border border-psy-safe/30 flex items-center justify-between text-[10px]">
                    <span className="text-psy-safe-text font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-psy-safe-text" /> Operasional Optimal
                    </span>
                    <span className="font-mono text-on-surface-variant">Labor 21%</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Headcount */}
        <div className="surface-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-on-surface-variant font-medium">Total Tim Terdaftar</p>
                <InfoTooltip
                  title="Kapasitas Karyawan Cabang"
                  badge="Kuota 20 Staf"
                  description="Jumlah total staf terdaftar di cabang aktif. Target kuota 20 staf disesuaikan dengan volume operasional 3 shift kedai."
                />
              </div>
              <h3 className="text-2xl font-bold text-on-surface mt-1 font-mono flex items-baseline gap-1.5">
                <span>{headcount}</span>
                <span className="text-xs text-on-surface-variant font-normal">/ 20 staf</span>
              </h3>
            </div>
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-on-surface-variant mb-1.5 font-medium">
              <span>Kapasitas Roster</span>
              <span className="font-semibold text-on-surface">{Math.round((headcount / 20) * 100)}%</span>
            </div>
            <div className="w-full bg-surface-low h-1.5 rounded-full overflow-hidden">
              <div className="bg-accent-primary h-full rounded-full transition-all" style={{ width: `${(headcount / 20) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Labor Cost Barometer */}
        <div className="surface-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-on-surface-variant font-medium">Labor Cost Ratio</p>
                <InfoTooltip
                  title="Rasio Biaya Tenaga Kerja"
                  badge="Target < 25%"
                  description="Persentase biaya upah terhadap proyeksi omset mingguan kedai. Benchmark F&B: < 25% Sehat, 25-35% Waspada, > 35% Kritis."
                />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-on-surface font-mono">{laborCostRatioPercent}%</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md font-mono ${laborRatioColor} ${laborRatioBg}`}>
                  {laborRatioStatus}
                </span>
              </div>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-on-surface-variant mb-1.5 font-medium">
              <span>Estimasi Gaji Minggu Ini</span>
              <span className="font-semibold text-on-surface font-mono">Rp {Math.round(weeklyLaborCost).toLocaleString('id-ID')}</span>
            </div>
            <div className="w-full bg-surface-low h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${laborCostRatioPercent < 25 ? 'bg-emerald-500' : laborCostRatioPercent < 35 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(laborCostRatioPercent * 2, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Attrition Risk */}
        <div className="surface-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-on-surface-variant font-medium">Risiko Kelelahan (Fatigue)</p>
                <InfoTooltip
                  title="Audit Kelelahan Staf"
                  badge="Anti-Burnout AI"
                  description="Dihitung dari frekuensi shift malam berturut-turut, akumulasi jam lembur bulanan, dan jeda istirahat antar shift kurang dari 8 jam."
                />
              </div>
              <h3 className="text-2xl font-bold text-on-surface mt-1 font-mono flex items-baseline gap-1.5">
                <span className={highRiskEmployees.length > 0 ? "text-rose-500" : ""}>{highRiskEmployees.length}</span>
                <span className="text-xs text-on-surface-variant font-normal">staf berisiko</span>
              </h3>
            </div>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="space-y-1.5">
              {highRiskEmployees.slice(0, 1).map(e => (
                <div key={e.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-low text-xs border border-outline">
                  <div className="flex items-center gap-2 truncate">
                    <img src={e.avatar} alt={e.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                    <span className="font-medium text-on-surface truncate">{e.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-500 font-bold shrink-0">{e.attritionRisk}%</span>
                </div>
              ))}
              {highRiskEmployees.length === 0 && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium py-1">
                  Semua kru dalam kondisi bugar.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Optimization Card */}
        <div className="surface-card p-5 flex flex-col justify-between bg-sky-50/40 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/50">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider font-mono">
                  Smart Recommendation
                </span>
                <InfoTooltip
                  title="Rekomendasi Cerdas AI"
                  badge="Efisiensi Biaya"
                  description="Algoritma mendeteksi peluang penghematan biaya lembur melalui redistribusi shift malam ke staf yang lebih bugar."
                />
              </div>
              <BrainCircuit className="w-4 h-4 text-accent-primary" />
            </div>
            <p className="text-xs text-on-surface leading-snug font-medium mb-3">
              Seimbangkan shift malam untuk potensi penghematan <strong className="text-on-surface">Rp 975.000</strong>.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playSuccess()
              autoBalanceShifts()
              addAuditLog({ user: 'System AI', action: 'Shift Auto-Balance', detail: 'Mengalihkan shift lembur untuk staf risiko tinggi' })
              toast.success("Shift berhasil diseimbangkan!", {
                action: { label: 'Lihat Kalender', onClick: () => navigate('/calendar') }
              })
            }}
            className="w-full py-2 px-3 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold text-xs transition-colors cursor-pointer text-center"
          >
            Auto-Balance Shift
          </button>
        </div>
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
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-outline text-xs">
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
                  key={`floor-staff-${record.id}-${record.dutyStatus}`} 
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
                            <span className="px-1.5 py-0.5 rounded-md bg-accent-primary/10 text-accent-primary text-[9px] font-bold font-mono inline-flex items-center gap-1">
                              {mood.mood === 'ready' ? (
                                <>
                                  <Zap className="w-2.5 h-2.5 text-amber-400" /> Siap Tempur
                                </>
                              ) : mood.mood === 'good' ? (
                                <>
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Bugar
                                </>
                              ) : (
                                <>
                                  <Coffee className="w-2.5 h-2.5 text-orange-400" /> Butuh Kopi
                                </>
                              )}
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
                <div key={`urgent-note-${note.id}`} className="p-2.5 rounded-xl bg-semantic-warning/10 border border-semantic-warning/30 text-[11px] text-on-surface">
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
                    <span className="flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" /> Break 1 Jam</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" /> K3 Fit</span>
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
                    <span className="text-[9px] font-mono text-on-surface-variant font-semibold shrink-0 ml-2 whitespace-nowrap">
                      {timeAgo(parseWibToDate(log.timestamp))}
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
