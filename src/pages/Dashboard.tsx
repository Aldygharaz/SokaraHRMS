import { useHRStore } from '@/store/useHRStore'
import { ManagerDashboard } from './dashboard/ManagerDashboard'
import { EmployeeDashboard } from './dashboard/EmployeeDashboard'
import { Sparkles } from 'lucide-react'

export function Dashboard() {
  const activeRole = useHRStore(state => state.activeRole)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Framing Section */}
      <div className="glass-panel spotlight-card p-6 md:p-8 rounded-3xl border-semantic-neutral/30 bg-gradient-to-r from-gradient-start to-surface dark:from-surface-container-low dark:to-surface-container">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary/20 border border-semantic-neutral/30 text-accent-primary text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span> <Sparkles className="w-3.5 h-3.5" /> Portfolio Demo Concept
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface font-display leading-tight">
            "Bayangkan kamu owner kedai kopi dengan 15 karyawan, dan setiap minggu pusing atur siapa shift kapan..."
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed font-medium">
            Sistem ini bantu kamu mengatur jadwal dan memantau operasional dalam hitungan detik — dan dibangun dengan metodologi <strong className="text-accent-primary font-bold">AI Orchestration</strong> dalam hitungan jam.
          </p>
        </div>
      </div>

      {activeRole === 'manager' ? <ManagerDashboard /> : <EmployeeDashboard />}
    </div>
  )
}
