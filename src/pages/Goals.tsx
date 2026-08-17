import { useHRStore } from '@/store/useHRStore'
import { Target, Trophy, TrendingUp, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TiltCard } from '@/components/motion/TiltCard'
import { useMemo } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'

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
    <div className="space-y-6">
      <div className="glass-panel spotlight-card p-6 md:p-8 rounded-3xl border-semantic-neutral/30 bg-gradient-to-r from-gradient-start to-surface dark:from-surface-container-low dark:to-surface-container">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary/20 border border-semantic-neutral/30 text-accent-primary text-xs font-bold uppercase tracking-wider">
            <Target className="w-4 h-4" /> Performance & OKR
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface font-display leading-tight">
            Target & Pencapaian Kinerja
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed font-medium">
            Pantau progress Objective & Key Results (OKR) secara real-time. {activeRole === 'manager' ? "Monitor performa seluruh tim." : "Raih target untuk meningkatkan peluang promosi."}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayGoals.map(goal => {
          const emp = employeeMap.get(goal.employeeId)
          const percentage = goal.target === 0 
            ? (goal.current === 0 ? 100 : 0) 
            : Math.min(Math.round((goal.current / goal.target) * 100), 100)
          
          let colorClass = "bg-accent-primary"
          let textColorClass = "text-accent-primary"
          let bgContainerClass = "bg-accent-primary/10"
          
          if (percentage >= 100) {
            colorClass = "bg-psy-safe"
            textColorClass = "text-psy-safe"
            bgContainerClass = "bg-psy-safe/10"
          } else if (percentage < 30) {
            colorClass = "bg-error"
            textColorClass = "text-error"
            bgContainerClass = "bg-error/10"
          } else if (percentage < 60) {
            colorClass = "bg-psy-warning"
            textColorClass = "text-psy-warning"
            bgContainerClass = "bg-psy-warning/10"
          }

          return (
            <TiltCard key={goal.id} className="glass-panel rounded-2xl p-6 border border-outline flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  {activeRole === 'manager' && emp ? (
                    <div className="flex items-center gap-2">
                      <img src={emp.avatar} alt={emp.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-xs font-bold text-on-surface">{emp.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> KPI Pribadi
                    </span>
                  )}
                  {percentage >= 100 ? (
                    <CheckCircle2 className={cn("w-5 h-5", textColorClass)} />
                  ) : (
                    <TrendingUp className={cn("w-5 h-5", textColorClass)} />
                  )}
                </div>
                
                <h3 className="font-bold text-on-surface text-lg leading-tight mb-4">{goal.title}</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-on-surface-variant">Progress</span>
                    <span className={textColorClass}>{percentage}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", colorClass)} style={{ width: `${percentage}%` }}></div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-medium mt-1">
                    {goal.current} / {goal.target} {goal.unit}
                  </p>
                </div>
              </div>
              
              <div className={cn("p-3 rounded-xl border flex items-center gap-2", bgContainerClass, `border-${colorClass}/20`)}>
                <Trophy className={cn("w-4 h-4", textColorClass)} />
                <span className={cn("text-[10px] font-bold", textColorClass)}>Deadline: {goal.dueDate}</span>
              </div>
            </TiltCard>
          )
        })}
      </div>
      )}
    </div>
  )
}
