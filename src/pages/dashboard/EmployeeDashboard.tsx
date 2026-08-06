import { useHRStore } from '@/store/useHRStore'
import { CalendarCheck, TrendingUp, Coffee, BellRing, CheckCircle2, CalendarClock, CalendarX2 } from 'lucide-react'
import { TiltCard } from '@/components/motion/TiltCard'
import { useMemo } from 'react'

export function EmployeeDashboard() {
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  const employees = useHRStore(state => state.employees)
  const shifts = useHRStore(state => state.shifts)

  const activeEmployee = useMemo(() => employees.find(e => e.id === activeEmployeeId), [employees, activeEmployeeId])

  const myWorkDays = useMemo(() => {
    const myShifts = shifts[activeEmployeeId] || []
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
    return myShifts.map((shift, idx) => ({ day: days[idx], shift })).filter(s => s.shift !== 'OFF' && s.shift !== 'Kosong')
  }, [shifts, activeEmployeeId])

  const estimatedPayroll = useMemo(() => {
    const base = activeEmployee?.baseSalary || 0
    const overtime = (activeEmployee?.overtimeHours || 0) * (activeEmployee?.rate || 0)
    return base + overtime
  }, [activeEmployee])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TiltCard className="glass-panel rounded-2xl p-6 border border-outline flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-accent-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span> Shift Saya Minggu Ini
              </span>
              <CalendarCheck className="text-accent-primary w-5 h-5" />
            </div>
            <div className="space-y-2 text-xs h-[140px] overflow-y-auto pr-1 custom-scrollbar">
              {myWorkDays.length > 0 ? myWorkDays.map((workDay, idx) => (
                <div key={idx} className="flex justify-between p-2 rounded-lg bg-surface-container-low font-semibold">
                  <span>{workDay.day}:</span>
                  <span className="text-accent-primary">{workDay.shift} {workDay.shift === 'Pagi' ? '(07:00-15:00)' : '(15:00-23:00)'}</span>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant bg-surface-container-low/30 rounded-xl border border-dashed border-outline/50">
                  <CalendarX2 className="w-8 h-8 mb-2 opacity-20" />
                  <span className="text-xs font-semibold">Belum Ada Jadwal Shift</span>
                  <span className="text-[10px] opacity-70">Jadwal minggu ini belum dirilis</span>
                </div>
              )}
            </div>
          </div>
        </TiltCard>

        <TiltCard className="glass-panel rounded-2xl p-6 border border-outline flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-on-surface-variant text-xs uppercase tracking-wider">Estimasi Payroll</span>
              <TrendingUp className="text-psy-safe w-5 h-5" />
            </div>
            <h3 className="text-3xl font-bold text-on-surface font-mono">
              Rp {estimatedPayroll.toLocaleString('id-ID')}
            </h3>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">Proyeksi THP bulan ini berdasarkan gaji pokok dan lembur {activeEmployee?.overtimeHours || 0} jam.</p>
          </div>
          <div className="p-3 bg-psy-safe/10 border border-psy-safe/20 rounded-xl">
            <p className="text-xs text-psy-safe-text font-bold">✨ Tersedia untuk ditarik: Rp 1.500.000 (Kasbon Early Wage)</p>
          </div>
        </TiltCard>

        <div className="space-y-6">
          <TiltCard className="glass-panel rounded-2xl p-5 border border-outline flex items-center gap-4">
            <div className="p-3 bg-tertiary/20 text-tertiary rounded-xl">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Sisa Cuti Tahunan</p>
              <p className="text-2xl font-bold text-on-surface font-mono mt-1">8 Hari</p>
            </div>
          </TiltCard>

          <TiltCard className="glass-panel rounded-2xl p-5 border border-outline bg-gradient-to-r from-accent-primary/10 to-transparent">
            <div className="flex gap-3">
              <BellRing className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-on-surface">Briefing Wajib Jumat</h4>
                <p className="text-[11px] text-on-surface-variant mt-1 font-medium">Seluruh tim shift pagi & sore harap kumpul jam 14.30 untuk bahas SOP baru.</p>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>

      <div className="glass-panel p-6 border border-outline rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-on-surface text-lg font-display">Aktivitas Saya</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-psy-safe/20 flex items-center justify-center text-psy-safe shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Check-In Presensi (Tepat Waktu)</p>
                <p className="text-[11px] text-on-surface-variant font-medium">Kedai Senopati (HQ)</p>
              </div>
            </div>
            <span className="text-[10px] text-on-surface-variant font-mono bg-surface-container px-2 py-1 rounded-md shrink-0">Hari ini, 07:45</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary shrink-0">
                <CalendarClock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Jadwal Shift Terbit</p>
                <p className="text-[11px] text-on-surface-variant font-medium">Minggu ke-4</p>
              </div>
            </div>
            <span className="text-[10px] text-on-surface-variant font-mono bg-surface-container px-2 py-1 rounded-md shrink-0">Kemarin</span>
          </div>
        </div>
      </div>
    </>
  )
}
