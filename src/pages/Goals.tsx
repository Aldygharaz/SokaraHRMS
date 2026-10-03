import { useHRStore } from '@/store/useHRStore'
import { Target, Trophy, TrendingUp, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tooltip, InfoTooltip } from '@/components/ui/Tooltip'

export function Goals() {
  const employees = useHRStore(state => state.employees)
  const okrGoals = useHRStore(state => state.okrGoals)
  const activeRole = useHRStore(state => state.activeRole)
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  
  const displayGoals = useMemo(() => {
    return activeRole === 'manager' 
      ? okrGoals 
      : okrGoals.filter(g => g.employeeId === activeEmployeeId)
  }, [activeRole, okrGoals, activeEmployeeId])

  const employeeMap = useMemo(() => {
    return new Map(employees.map(e => [e.id, e]))
  }, [employees])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Standardized Clean Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
              Target & OKR Kinerja
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-on-surface-variant text-[10px] font-semibold border border-outline font-mono">
              {displayGoals.length} Target Aktif
            </span>
            <InfoTooltip 
              title="Metodologi OKR & Sasaran Kerja" 
              badge="OKR System" 
              description="Objective & Key Results kuartalan untuk mengukur capaian target operasional, kecepatan pelayanan, akurasi kasir, dan higienitas gerai." 
            />
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Pantau progres Objective & Key Results (OKR) {activeRole === 'manager' ? "seluruh staf tim secara berkala." : "pribadi Anda bulan ini."}
          </p>
        </div>
      </div>

      {displayGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Belum Ada Target OKR"
          description={activeRole === 'manager' ? "Belum ada Key Result yang ditetapkan untuk tim." : "Belum ada target kinerja khusus yang ditugaskan ke akun Anda."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayGoals.map(goal => {
          const emp = employeeMap.get(goal.employeeId)
          const percentage = goal.target === 0 
            ? (goal.current === 0 ? 100 : 0) 
            : Math.min(Math.round((goal.current / goal.target) * 100), 100)
          
          let colorClass = "bg-accent-primary"
          let textColorClass = "text-accent-primary"
          let bgContainerClass = "bg-accent-primary/10 border-accent-primary/20"
          
          if (percentage >= 100) {
            colorClass = "bg-emerald-500"
            textColorClass = "text-emerald-600 dark:text-emerald-400"
            bgContainerClass = "bg-emerald-500/10 border-emerald-500/20"
          } else if (percentage < 30) {
            colorClass = "bg-rose-500"
            textColorClass = "text-rose-600 dark:text-rose-400"
            bgContainerClass = "bg-rose-500/10 border-rose-500/20"
          } else if (percentage < 60) {
            colorClass = "bg-amber-500"
            textColorClass = "text-amber-600 dark:text-amber-400"
            bgContainerClass = "bg-amber-500/10 border-amber-500/20"
          }

          return (
            <div key={goal.id} className="surface-card rounded-2xl p-5 border border-outline flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  {activeRole === 'manager' && emp ? (
                    <Tooltip content={`Penanggung jawab target: ${emp.name} (${emp.role})`}>
                      <div className="flex items-center gap-2 cursor-help">
                        <img src={emp.avatar} alt={emp.name} className="w-5 h-5 rounded-full object-cover ring-1 ring-outline" />
                        <span className="text-xs font-semibold text-on-surface">{emp.name}</span>
                      </div>
                    </Tooltip>
                  ) : (
                    <span className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-accent-primary" /> KPI Pribadi
                    </span>
                  )}
                  {percentage >= 100 ? (
                    <Tooltip content="Target telah tercapai 100%">
                      <CheckCircle2 className={cn("w-4 h-4 cursor-help", textColorClass)} />
                    </Tooltip>
                  ) : (
                    <Tooltip content={`Tren kemajuan target: ${percentage}% tercapai`}>
                      <TrendingUp className={cn("w-4 h-4 cursor-help", textColorClass)} />
                    </Tooltip>
                  )}
                </div>
                
                <h3 className="font-semibold text-on-surface text-sm leading-snug mb-3">{goal.title}</h3>
                
                <Tooltip content={`Pencapaian: ${goal.current} dari kuota ${goal.target} ${goal.unit} (${percentage}%)`}>
                  <div className="space-y-1.5 cursor-help">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-on-surface-variant">Progress</span>
                      <span className={cn("font-bold font-mono", textColorClass)}>{percentage}%</span>
                    </div>
                    <div className="w-full bg-surface-low h-1.5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-700", colorClass)} style={{ width: `${percentage}%` }}></div>
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-mono mt-1">
                      {goal.current} / {goal.target} {goal.unit}
                    </p>
                  </div>
                </Tooltip>
              </div>
              
              <Tooltip content={`Batas waktu penyelesaian sasaran kerja: ${goal.dueDate}`}>
                <div className={cn("p-2.5 rounded-xl border flex items-center gap-2 cursor-help", bgContainerClass)}>
                  <Trophy className={cn("w-3.5 h-3.5", textColorClass)} />
                  <span className={cn("text-[11px] font-medium", textColorClass)}>Deadline: {goal.dueDate}</span>
                </div>
              </Tooltip>
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}
