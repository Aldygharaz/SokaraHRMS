import { useHRStore } from '@/store/useHRStore'
import { Users, CalendarClock, BrainCircuit, AlertCircle, ChevronRight, AlertTriangle, Wallet, Activity } from 'lucide-react'
import { TiltCard } from '@/components/motion/TiltCard'
import { toast } from 'sonner'
import { useMemo } from 'react'

export function ManagerDashboard() {
  const employees = useHRStore(state => state.employees)
  const auditLogs = useHRStore(state => state.auditLogs)
  const autoBalanceShifts = useHRStore(state => state.autoBalanceShifts)
  const autoFillShifts = useHRStore(state => state.autoFillShifts)
  const addAuditLog = useHRStore(state => state.addAuditLog)
  const headcount = employees.length

  const highRiskEmployees = useMemo(() => {
    return employees.filter(e => (e.attritionRisk || 0) > 40)
  }, [employees])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <TiltCard className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-outline hover:border-accent-primary/50 transition-colors shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Total Headcount Tim</p>
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
              <span>Kapasitas Kedai</span>
              <span className="text-accent-primary font-bold">75%</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-accent-primary to-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '75%' }}></div>
            </div>
          </div>
        </TiltCard>

        <TiltCard className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-outline hover:border-tertiary/50 transition-colors shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Shift Terisi Minggu Ini</p>
              <h3 className="text-4xl font-bold text-on-surface mt-1 font-display">
                42 <span className="text-base text-on-surface-variant font-semibold">/ 75</span>
              </h3>
            </div>
            <div className="p-3.5 bg-tertiary/10 rounded-2xl text-tertiary">
              <CalendarClock className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-on-surface-variant font-semibold mb-2">
              <span>Status Pemenuhan Jadwal</span>
              <span className="text-tertiary font-bold">Optimum (85%)</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex gap-0.5">
              <div className="bg-gradient-to-r from-tertiary to-tertiary-container h-full rounded-l-full transition-all duration-1000 ease-out" style={{ width: '85%' }}></div>
              <div className="bg-error/80 h-full rounded-r-full transition-all duration-1000 ease-out" style={{ width: '15%' }}></div>
            </div>
          </div>
        </TiltCard>

        <TiltCard className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-error/20 bg-error/5 hover:border-error/40 transition-colors shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-error font-bold uppercase tracking-wider mb-1">Attrition Risk</p>
              <h3 className="text-4xl font-bold text-error mt-1 font-display">
                {highRiskEmployees.length} <span className="text-base text-error/70 font-semibold">Staf</span>
              </h3>
            </div>
            <div className="p-3.5 bg-error/10 rounded-2xl text-error">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant mb-2">Risiko Tinggi Berhenti:</p>
            <div className="space-y-2">
              {highRiskEmployees.slice(0, 2).map(e => (
                <div key={e.id} className="flex items-center gap-3 p-2 bg-surface rounded-xl border border-error/10 shadow-sm">
                  <img src={e.avatar} alt={e.name} className="w-8 h-8 rounded-full object-cover border border-error/20" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-on-surface truncate">{e.name}</p>
                    <p className="text-[10px] text-error truncate">{e.attritionFactors?.[0]}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-error bg-error/10 px-2 py-1 rounded-lg">{e.attritionRisk}%</span>
                </div>
              ))}
              {highRiskEmployees.length === 0 && (
                <div className="text-center py-2 text-xs text-on-surface-variant italic">Semua staf aman.</div>
              )}
            </div>
          </div>
        </TiltCard>

        <TiltCard className="glass-panel rounded-3xl p-6 border-2 border-accent-primary/20 bg-gradient-to-br from-accent-primary/5 to-surface-container flex flex-col justify-between hover:border-accent-primary/40 transition-all shadow-[0_4px_20px_rgba(27,95,174,0.05)]">
          <div>
            <div className="flex items-center gap-2 mb-4 bg-surface w-fit px-3 py-1.5 rounded-full text-[11px] text-accent-primary font-bold shadow-sm border border-accent-primary/10">
              <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
              <BrainCircuit className="w-4 h-4" />
              <span>AI Anomaly Insight</span>
            </div>
            <p className="text-[13px] text-on-surface leading-relaxed mb-4 font-medium">
              "Biaya lembur naik <strong className="text-semantic-warning font-bold">23%</strong> minggu ini. Analisis: 4 dari 6 lembur terkonsentrasi pada tim shift malam Sabtu akibat penumpukan pesanan."
            </p>
            <div className="p-3 rounded-2xl bg-surface border border-accent-primary/20 text-[11px] text-on-surface-variant shadow-sm mb-4">
              <p className="leading-relaxed">✨ <strong>Rekomendasi AI:</strong> Dialihkan ke Dimas Prasetyo & Budi Santoso untuk menghemat estimasi <strong>Rp 975.000 / minggu</strong>.</p>
            </div>
          </div>
          <button
            onClick={() => {
              autoBalanceShifts()
              addAuditLog({ user: 'System AI', action: 'Shift Auto-Balance', detail: 'Mengalihkan shift lembur untuk staf risiko tinggi' })
              toast.success("Shift berhasil diseimbangkan secara otomatis!", {
                description: "Estimasi penghematan: Rp 975.000",
                icon: '✨',
                action: { label: 'Lihat Kalender', onClick: () => window.location.hash = '#/calendar' }
              })
            }}
            className="w-full py-3 px-4 rounded-xl bg-accent-primary text-white hover:bg-accent-primary/90 hover:shadow-lg hover:shadow-accent-primary/20 font-bold text-xs transition-all font-display active:scale-[0.98]"
          >
            Auto-Balance Shift Lembur
          </button>
        </TiltCard>
      </div>

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
                <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant bg-surface-container-low/50 rounded-xl border border-dashed border-outline">
                  <Activity className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm font-semibold">Belum Ada Aktivitas Terkini</p>
                  <p className="text-[11px] mt-1 opacity-70">Aktivitas sistem dan tim akan muncul di sini.</p>
                </div>
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
    </>
  )
}
