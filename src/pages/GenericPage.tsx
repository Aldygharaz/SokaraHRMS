
import { TiltCard } from '@/components/motion/TiltCard'

export function GenericPage({ title, description, icon: Icon }: { title: string, description: string, icon: any }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="glass-panel spotlight-card p-6 md:p-8 rounded-3xl border-semantic-neutral/30 bg-gradient-to-r from-gradient-start to-surface dark:from-surface-container-low dark:to-surface-container flex items-center gap-6">
        <div className="p-4 bg-accent-primary/20 rounded-2xl border border-semantic-neutral/30 text-accent-primary shrink-0">
          <Icon className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface font-display">{title}</h2>
          <p className="text-sm text-on-surface-variant font-medium mt-1">{description}</p>
        </div>
      </div>

      <TiltCard className="glass-panel rounded-2xl flex-1 border border-outline flex flex-col items-center justify-center min-h-[400px] text-center p-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-2">
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-on-surface">Modul {title}</h3>
        <p className="text-on-surface-variant text-sm max-w-md mx-auto">
          Modul ini sedang dalam tahap pengembangan iterasi berikutnya dalam pipeline CI/CD Sokara HR. 
          Semua data akan terintegrasi langsung dengan sistem ERP inti.
        </p>
        <button className="mt-4 bg-surface-container-high text-on-surface hover:text-accent-primary border border-surface-container-highest text-xs font-bold py-2.5 px-6 rounded-xl transition-all">
          Kembali ke Dashboard
        </button>
      </TiltCard>
    </div>
  )
}
