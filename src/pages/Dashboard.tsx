import { useHRStore } from '@/store/useHRStore'
import { ManagerDashboard } from './dashboard/ManagerDashboard'
import { EmployeeDashboard } from './dashboard/EmployeeDashboard'
import { Sparkles, ArrowRight } from 'lucide-react'
import { GradientMesh } from '@/components/motion/GradientMesh'
import { MagneticButton } from '@/components/motion/MagneticButton'

export function Dashboard() {
  const activeRole = useHRStore(state => state.activeRole)

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      {/* 10x Immersive Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] border border-outline bg-[#1E1F22] dark:bg-[#1E1F22] p-8 md:p-12 shadow-2xl">
        <GradientMesh />
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span> 
            <Sparkles className="w-3.5 h-3.5" /> 
            Sokara OS — Enterprise Edition
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white font-display leading-[1.1] tracking-tight">
            Orkestrasi operasional <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0984E3] to-[#7DD3FC]">tanpa gesekan.</span>
          </h2>
          
          <p className="text-base md:text-lg text-[#B5BAC1] leading-relaxed font-medium max-w-2xl">
            Sistem cerdas yang menyeimbangkan efisiensi biaya labor dan kesiapan tim di seluruh cabang secara real-time. Dibangun dengan standar <strong className="text-white">Apple HIG & WebGL 60fps</strong>.
          </p>

          <div className="pt-4 flex gap-4">
            <MagneticButton intensity={0.2} className="px-6 py-3 rounded-xl bg-[#0984E3] text-white font-bold text-sm flex items-center gap-2 hover:bg-[#0097E6] shadow-[0_4px_14px_0_rgba(9,132,227,0.39)] cursor-pointer">
              Eksplorasi Fitur <ArrowRight className="w-4 h-4" />
            </MagneticButton>
            <MagneticButton intensity={0.1} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-md">
              Lihat Laporan KPI
            </MagneticButton>
          </div>
        </div>
      </div>

      {activeRole === 'manager' ? <ManagerDashboard /> : <EmployeeDashboard />}
    </div>
  )
}
