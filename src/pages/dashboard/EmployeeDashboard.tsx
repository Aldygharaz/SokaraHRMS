import { useHRStore } from '@/store/useHRStore'
import { CalendarCheck, TrendingUp, Coffee, BellRing, CheckCircle2, Sparkles, ClipboardCheck, Store, ShieldCheck, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { sound } from '@/lib/sound'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tooltip, InfoTooltip } from '@/components/ui/Tooltip'

// Shift hours definition
const SHIFT_TIMES: Record<string, { start: number; end: number; range: string }> = {
  'Pagi': { start: 8, end: 17, range: '08:00 - 17:00' },
  'Sore': { start: 14, end: 23, range: '14:00 - 23:00' },
  'Closing': { start: 16, end: 1, range: '16:00 - 01:00' }
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export function EmployeeDashboard() {
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  const employees = useHRStore(state => state.employees)
  const shifts = useHRStore(state => state.shifts)
  const terRates = useHRStore(state => state.terRates)
  const attendances = useHRStore(state => state.attendances)
  const navigate = useNavigate()

  const [showPayrollBreakdown, setShowPayrollBreakdown] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const activeEmployee = useMemo(() => employees.find(e => e.id === activeEmployeeId), [employees, activeEmployeeId])

  const currentDayIdx = (now.getDay() + 6) % 7 // 0 = Senin, 6 = Minggu
  const todayShift = (shifts[activeEmployeeId] || [])[currentDayIdx] || 'OFF'

  const myWorkDays = useMemo(() => {
    const myShifts = shifts[activeEmployeeId] || []
    return myShifts.map((shift, idx) => ({ day: DAYS[idx], shift, isToday: idx === currentDayIdx })).filter(s => s.shift !== 'OFF' && s.shift !== 'Kosong')
  }, [shifts, activeEmployeeId, currentDayIdx])

  // Net Take-Home Pay with TER tax calculation
  const payrollCalculations = useMemo(() => {
    if (!activeEmployee) return { gross: 0, tax: 0, net: 0, terRate: 0, overtimePay: 0, nightPay: 0 }
    const base = activeEmployee.baseSalary
    const overtimePay = (activeEmployee.overtimeHours || 0) * (activeEmployee.rate || 0)
    const nightPay = (activeEmployee.nightShiftsMonth || 0) * 50000
    const gross = base + overtimePay + nightPay
    const terRate = terRates[activeEmployee.kat] || 0
    const tax = gross * (terRate / 100)
    const net = gross - tax

    return { gross, tax, net, terRate, overtimePay, nightPay }
  }, [activeEmployee, terRates])

  // Personal shift countdown
  const personalShiftStatus = useMemo(() => {
    if (todayShift === 'OFF' || !SHIFT_TIMES[todayShift]) {
      return { status: 'off', text: 'Hari Ini Libur (OFF)', subtext: 'Nikmati waktu istirahat Anda' }
    }

    const config = SHIFT_TIMES[todayShift]
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()
    const currentSecs = currentHour * 3600 + currentMin * 60 + now.getSeconds()
    const startSecs = config.start * 3600
    let endSecs = config.end * 3600

    // Closing shift crosses midnight
    if (todayShift === 'Closing') {
      const isOngoing = currentHour >= 16 || currentHour < 1
      if (isOngoing) {
        let remaining = currentHour >= 16 ? ((25 * 3600) - currentSecs) : (endSecs - currentSecs)
        const hrs = Math.floor(remaining / 3600)
        const mins = Math.floor((remaining % 3600) / 60)
        return { status: 'active', text: `Shift Closing Sedang Berjalan`, subtext: `Sisa durasi ${hrs}j ${mins}m (${config.range})` }
      } else if (currentHour < 16) {
        const untilStart = startSecs - currentSecs
        const hrs = Math.floor(untilStart / 3600)
        const mins = Math.floor((untilStart % 3600) / 60)
        return { status: 'upcoming', text: `Shift Closing Hari Ini`, subtext: `Mulai dalam ${hrs}j ${mins}m (${config.range})` }
      }
    } else {
      if (currentSecs >= startSecs && currentSecs < endSecs) {
        const remaining = endSecs - currentSecs
        const hrs = Math.floor(remaining / 3600)
        const mins = Math.floor((remaining % 3600) / 60)
        return { status: 'active', text: `Shift ${todayShift} Sedang Berjalan`, subtext: `Sisa durasi ${hrs}j ${mins}m (${config.range})` }
      } else if (currentSecs < startSecs) {
        const untilStart = startSecs - currentSecs
        const hrs = Math.floor(untilStart / 3600)
        const mins = Math.floor((untilStart % 3600) / 60)
        return { status: 'upcoming', text: `Shift ${todayShift} Hari Ini`, subtext: `Mulai dalam ${hrs}j ${mins}m (${config.range})` }
      } else {
        return { status: 'completed', text: `Shift ${todayShift} Selesai`, subtext: `Terima kasih atas kerja keras Anda hari ini!` }
      }
    }

    return { status: 'off', text: 'Jadwal Selesai', subtext: '' }
  }, [todayShift, now])

  const myTodayAttendance = attendances.find(a => a.employeeId === activeEmployeeId && a.date === 'Hari Ini')

  return (
    <div className="space-y-6">
      {/* Standardized Clean Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
              Portal Karyawan
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
              {activeEmployee?.name} • {activeEmployee?.role}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Status shift hari ini, presensi GPS, dan ringkasan slip penghasilan Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick()
              navigate('/attendance')
            }}
            className="py-1.5 px-3 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ClipboardCheck className="w-3.5 h-3.5" /> Presensi GPS
          </button>
          <button
            onClick={() => {
              sound.playClick()
              navigate('/approval')
            }}
            className="py-1.5 px-3 rounded-lg bg-surface-low hover:bg-surface-high text-on-surface border border-outline text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-accent-primary" /> Bursa Shift
          </button>
        </div>
      </div>

      {/* Shift Countdown Alert Card */}
      <Tooltip
        title="Status Shift Hari Ini"
        badge="Presensi GPS Kedai"
        description="Waktu operasional shift Anda hari ini. Batas keterlambatan maksimal 10 menit setelah jam shift resmi dimulai."
      >
        <div className="p-3.5 rounded-xl border border-outline bg-surface-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-help w-full">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${personalShiftStatus.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : personalShiftStatus.status === 'upcoming' ? 'bg-sky-500/10 text-sky-500' : 'bg-surface text-on-surface-variant'}`}>
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">{personalShiftStatus.text}</p>
              <p className="text-[11px] text-on-surface-variant">{personalShiftStatus.subtext}</p>
            </div>
          </div>
          {myTodayAttendance && myTodayAttendance.timeIn !== '--:--' && (
            <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Check-In: {myTodayAttendance.timeIn} WIB
            </span>
          )}
        </div>
      </Tooltip>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Weekly Shifts */}
        <div className="surface-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-accent-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" /> Shift Saya Minggu Ini
              </span>
              <Tooltip content="Jadwal shift yang telah ditetapkan untuk akun Anda selama 7 hari berjalan">
                <CalendarCheck className="text-accent-primary w-5 h-5 cursor-help" />
              </Tooltip>
            </div>
            <div className="space-y-2 text-xs max-h-[170px] overflow-y-auto pr-1">
              {myWorkDays.length > 0 ? myWorkDays.map((workDay, idx) => (
                <Tooltip key={idx} content={SHIFT_TIMES[workDay.shift] ? `Shift ${workDay.shift}: ${SHIFT_TIMES[workDay.shift].range} WIB` : 'Libur'}>
                  <div 
                    className={`flex justify-between p-2.5 rounded-xl border font-semibold transition-colors cursor-help w-full ${workDay.isToday ? 'bg-accent-primary/10 border-accent-primary/40 text-accent-primary' : 'bg-surface-container-low border-outline'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      {workDay.isToday && <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />}
                      {workDay.day} {workDay.isToday ? '(Hari Ini)' : ''}:
                    </span>
                    <span className="font-mono font-bold">
                      {workDay.shift} {SHIFT_TIMES[workDay.shift] ? `(${SHIFT_TIMES[workDay.shift].range})` : ''}
                    </span>
                  </div>
                </Tooltip>
              )) : (
                <EmptyState
                  icon={CalendarCheck}
                  title="Belum Ada Jadwal Shift"
                  description="Jadwal minggu ini belum dirilis oleh manajer."
                  className="py-4 border-0 bg-transparent"
                />
              )}
            </div>
          </div>
        </div>

        {/* Net Take-Home Pay with TER Breakdown */}
        <div className="surface-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-on-surface-variant text-xs">Take-Home Pay Bersih</span>
                <InfoTooltip
                  title="Estimasi Penghasilan Bersih"
                  badge="PMK 168/2023"
                  description="Gaji bersih yang Anda terima setelah pemotongan PPh 21 tarif efektif rata-rata (TER), ditambah akumulasi uang lembur dan insentif closing shift."
                />
              </div>
              <TrendingUp className="text-emerald-500 w-4 h-4" />
            </div>
            <h3 className="text-2xl font-bold text-on-surface font-mono">
              Rp {Math.round(payrollCalculations.net).toLocaleString('id-ID')}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 font-medium">
              Gaji bersih setelah potongan PPh 21 TER ({payrollCalculations.terRate}%) dari bruto Rp {payrollCalculations.gross.toLocaleString('id-ID')}.
            </p>

            {/* Toggle Breakdown Button */}
            <button
              onClick={() => {
                sound.playClick()
                setShowPayrollBreakdown(!showPayrollBreakdown)
              }}
              className="mt-3 text-[11px] font-bold text-accent-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{showPayrollBreakdown ? 'Sembunyikan Rincian' : 'Lihat Rincian Potongan Gaji'}</span>
              {showPayrollBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Animated Breakdown Panel */}
            {showPayrollBreakdown && (
              <div className="mt-3 p-3 rounded-xl bg-surface-low border border-outline space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Gaji Pokok:</span>
                  <span className="text-on-surface font-semibold">Rp {activeEmployee?.baseSalary.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Lembur ({activeEmployee?.overtimeHours || 0}j):</span>
                  <span className="text-on-surface font-semibold">+Rp {Math.round(payrollCalculations.overtimePay).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Insentif Malam ({activeEmployee?.nightShiftsMonth || 0}x):</span>
                  <span className="text-on-surface font-semibold">+Rp {payrollCalculations.nightPay.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-rose-500 border-t border-outline pt-1 font-semibold">
                  <span>PPh 21 TER (KAT {activeEmployee?.kat} - {payrollCalculations.terRate}%):</span>
                  <span>-Rp {Math.round(payrollCalculations.tax).toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}
          </div>
          <Tooltip
            title="Akses Gaji Lebih Awal (EWA)"
            badge="Bebas Bunga"
            description="Fasilitas penarikan gaji proporsional atas jam kerja yang telah Anda selesaikan bulan ini tanpa bunga pinjaman."
          >
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 cursor-help w-full">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Tersedia Kasbon Early Wage: Rp 1.500.000</p>
            </div>
          </Tooltip>
        </div>

        {/* Leave & Announcements */}
        <div className="space-y-4">
          <div className="surface-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-on-surface-variant font-medium">Sisa Cuti Tahunan</p>
                  <InfoTooltip
                    title="Hak Cuti Tahunan Resmi"
                    badge="12 Hari / Tahun"
                    description="Sisa saldo hak cuti resmi tahun berjalan yang dapat Anda ajukan melalui manajer operasional."
                  />
                </div>
                <p className="text-xl font-bold text-on-surface font-mono mt-0.5">8 Hari Kerja</p>
              </div>
            </div>
          </div>

          <div className="surface-card p-4 border border-outline bg-surface-low">
            <div className="flex gap-3">
              <BellRing className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-on-surface">Briefing Wajib Jumat</h4>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Seluruh tim shift pagi & sore harap kumpul jam 14.30 untuk evaluasi kalibrasi espresso baru.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="surface-card p-5 border border-outline rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-on-surface text-base font-display">Aktivitas Saya Terkini</h3>
          <Tooltip content="Buka slip gaji digital resmi dengan format PMK 168/2023">
            <button onClick={() => navigate('/payroll')} className="text-xs text-accent-primary font-bold hover:underline cursor-pointer">
              Lihat Slip Gaji
            </button>
          </Tooltip>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low border border-outline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-psy-safe-bg border border-psy-safe/30 flex items-center justify-center text-psy-safe shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">Presensi Masuk Tepat Waktu</p>
                <p className="text-[11px] text-on-surface-variant">
                  {myTodayAttendance?.timeIn !== '--:--' ? `${myTodayAttendance?.timeIn} WIB` : '07:42 WIB'} • Kedai Senopati HQ (Inside 45m)
                </p>
              </div>
            </div>
            <Tooltip content="Posisi check-in berada di dalam radius 100m Kedai Senopati HQ">
              <span className="text-[10px] font-mono text-psy-safe-text font-bold cursor-help">Valid GPS</span>
            </Tooltip>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low border border-outline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">Pembaruan Jadwal Shift Roster</p>
                <p className="text-[11px] text-on-surface-variant">Jadwal 7 hari telah diverifikasi sistem anti-fatigue</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-on-surface-variant">Hari Ini</span>
          </div>
        </div>
      </div>
    </div>
  )
}
