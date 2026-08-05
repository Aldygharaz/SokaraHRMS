
import { useHRStore } from '@/store/useHRStore'
import { Users, CalendarClock, BrainCircuit, CalendarCheck, Wallet, Coffee, AlertCircle, TrendingUp, BellRing, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react'
import { TiltCard } from '@/components/motion/TiltCard'
import { toast } from 'sonner'
import { useMemo } from 'react'

export function Dashboard() {
  const activeRole = useHRStore(state => state.activeRole)
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  const employees = useHRStore(state => state.employees)
  const shifts = useHRStore(state => state.shifts)
  const auditLogs = useHRStore(state => state.auditLogs)
  const autoBalanceShifts = useHRStore(state => state.autoBalanceShifts)
  const autoFillShifts = useHRStore(state => state.autoFillShifts)
  const addAuditLog = useHRStore(state => state.addAuditLog)
  const headcount = employees.length

  const highRiskEmployees = useMemo(() => {
    return employees.filter(e => (e.attritionRisk || 0) > 40)
  }, [employees])

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Framing Section */}
      <div className="glass-panel spotlight-card p-6 md:p-8 rounded-3xl border-semantic-neutral/30 bg-gradient-to-r from-gradient-start to-surface dark:from-surface-container-low dark:to-surface-container">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary/20 border border-semantic-neutral/30 text-accent-primary text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span> ✨ Portfolio Demo Concept
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface font-display leading-tight">
            "Bayangkan kamu owner kedai kopi dengan 15 karyawan, dan setiap minggu pusing atur siapa shift kapan..."
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed font-medium">
            Sistem ini bantu kamu mengatur jadwal dan memantau operasional dalam hitungan detik — dan dibangun dengan metodologi <strong className="text-accent-primary font-bold">AI Orchestration</strong> dalam hitungan jam.
          </p>
        </div>
      </div>

      {activeRole === 'manager' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <TiltCard className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-outline">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Total Headcount Tim</p>
                <h3 className="text-4xl font-bold text-on-surface mt-2 font-display">
                  {headcount} <span className="text-base text-on-surface-variant font-semibold">/ 20 Target</span>
                </h3>
              </div>
              <div className="p-3 bg-accent-primary/20 rounded-xl border border-semantic-neutral/30 text-accent-primary">
                <Users className="w-8 h-8" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-on-surface-variant font-semibold mb-2">
                <span>Kapasitas Operasional Kedai</span>
                <span className="text-accent-primary font-bold">75%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div className="bg-accent-primary h-full rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
              </div>
            </div>
          </TiltCard>

          <TiltCard className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-outline">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Shift Terisi Minggu Ini</p>
                <h3 className="text-4xl font-bold text-on-surface mt-2 font-display">
                  42 <span className="text-base text-on-surface-variant font-semibold">/ 75 Slot</span>
                </h3>
              </div>
              <div className="p-3 bg-tertiary/20 rounded-xl border border-tertiary/40 text-tertiary">
                <CalendarClock className="w-8 h-8" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-on-surface-variant font-semibold mb-2">
                <span>Status Pemenuhan Jadwal</span>
                <span className="text-accent-primary font-bold">Optimum (85%)</span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden flex gap-1">
                <div className="bg-accent-primary h-full rounded-l-full transition-all duration-1000" style={{ width: '85%' }}></div>
                <div className="bg-error h-full rounded-r-full transition-all duration-1000" style={{ width: '15%' }}></div>
              </div>
            </div>
          </TiltCard>

          <TiltCard className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-error/30 bg-error/5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider text-error">Attrition Risk</p>
                <h3 className="text-4xl font-bold text-on-surface mt-2 font-display">
                  {highRiskEmployees.length} <span className="text-base text-on-surface-variant font-semibold">Staf</span>
                </h3>
              </div>
              <div className="p-3 bg-error/20 rounded-xl border border-error/30 text-error">
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface mb-2">Risiko Tinggi Berhenti:</p>
              <div className="space-y-2">
                {highRiskEmployees.slice(0, 2).map(e => (
                  <div key={e.id} className="flex items-center gap-2 p-2 bg-surface-container-low rounded-lg border border-error/20">
                    <img src={e.avatar} alt={e.name} className="w-6 h-6 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-on-surface line-clamp-1">{e.name}</p>
                      <p className="text-[9px] text-error line-clamp-1">{e.attritionFactors?.[0]}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-error bg-error/10 px-1.5 py-0.5 rounded">{e.attritionRisk}%</span>
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>

          <TiltCard className="glass-panel rounded-2xl p-6 border-l-[3px] border-accent-primary border-y-0 border-r-0 bg-accent-primary/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 bg-white/50 dark:bg-black/20 w-fit px-3 py-1 rounded-full text-xs text-accent-primary font-bold">
                <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
                <BrainCircuit className="w-4 h-4" />
                <span>AI Anomaly Insight</span>
              </div>
              <p className="text-xs text-on-surface leading-relaxed mb-3 font-medium">
                "Biaya lembur naik <strong className="text-semantic-warning font-bold">23%</strong> minggu ini. Analisis: 4 dari 6 lembur terkonsentrasi pada tim shift malam Sabtu akibat penumpukan pesanan."
              </p>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-accent-primary/30 text-[11px] text-on-surface-variant space-y-1 mb-3">
                <p>✨ <strong>Rekomendasi AI:</strong> Dialihkan ke Dimas Prasetyo & Budi Santoso untuk menghemat estimasi <strong>Rp 975.000 / minggu</strong>.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                autoBalanceShifts()
                addAuditLog({ user: 'System AI', action: 'Shift Auto-Balance', detail: 'Mengalihkan shift lembur untuk staf risiko tinggi' })
                toast.success("Shift berhasil diseimbangkan secara otomatis", { description: "Estimasi penghematan: Rp 975.000" })
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-accent-primary/50 text-accent-primary hover:bg-accent-primary hover:text-white font-bold text-xs transition-all font-display"
            >
              ✨ Auto-Balance Shift Lembur
            </button>
          </TiltCard>
        </div>
      )}

      {activeRole === 'manager' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 border border-outline rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-on-surface text-lg font-display">Aktivitas Terkini</h3>
                <button onClick={() => window.location.hash = '#/calendar'} className="text-xs text-accent-primary font-bold hover:underline">Lihat Semua</button>
              </div>
              <div className="space-y-3">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-transparent hover:border-outline">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary shrink-0">
                        <BrainCircuit className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{log.action}</p>
                        <p className="text-[11px] text-on-surface-variant font-medium">{log.detail} • <span className="font-semibold text-accent-primary">{log.user}</span></p>
                      </div>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-mono bg-surface-container px-2 py-1 rounded-md shrink-0">{log.timestamp}</span>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <div className="text-center py-6 text-on-surface-variant text-sm">Belum ada aktivitas.</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 border border-outline rounded-2xl bg-gradient-to-b from-surface to-surface-container-lowest">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-psy-warning w-5 h-5" />
                <h3 className="font-bold text-on-surface font-display">Pending Actions</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline flex justify-between items-center group cursor-pointer hover:border-accent-primary/50 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-on-surface">3 Request Swap Shift</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Menunggu approval Anda</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-accent-primary transition-colors" />
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline flex justify-between items-center group cursor-pointer hover:border-accent-primary/50 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-on-surface">1 Pengajuan Cuti (Dimas)</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Tumpang tindih jadwal</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-accent-primary transition-colors" />
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 border border-outline rounded-2xl">
              <h3 className="font-bold text-on-surface font-display mb-4">Quick Shortcuts</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => {
                  autoFillShifts()
                  toast.success("Roster Mingguan berhasil di-generate AI!")
                }} className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline flex flex-col items-center justify-center gap-2 transition-colors">
                  <CalendarClock className="w-5 h-5 text-accent-primary" />
                  <span className="text-[10px] font-bold text-on-surface text-center">Buat Roster<br/>Mingguan</span>
                </button>
                <button onClick={() => {
                  window.location.hash = '#/payroll'
                }} className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline flex flex-col items-center justify-center gap-2 transition-colors">
                  <Wallet className="w-5 h-5 text-psy-safe" />
                  <span className="text-[10px] font-bold text-on-surface text-center">Generate<br/>Payroll</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeRole === 'karyawan' && (
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
                  <div className="flex items-center justify-center h-full text-on-surface-variant italic">Belum ada jadwal shift</div>
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
      )}

      {activeRole === 'karyawan' && (
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
      )}
    </div>
  )
}
