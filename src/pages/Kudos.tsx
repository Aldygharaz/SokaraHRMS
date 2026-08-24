import { useHRStore } from '@/store/useHRStore'
import { Heart, MessageSquare, Award, ThumbsUp, Send } from 'lucide-react'
import { toast } from 'sonner'
import { sound } from '@/lib/sound'
import { EmptyState } from '@/components/ui/EmptyState'

export function Kudos() {
  const employees = useHRStore(state => state.employees)
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  const kudosList = useHRStore(state => state.kudosList)
  
  return (
    <div className="space-y-6">
      <div className="glass-panel spotlight-card p-6 md:p-8 rounded-3xl border border-outline bg-gradient-to-r from-surface to-surface-container">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-psy-safe/20 border border-psy-safe/30 text-psy-safe text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4" /> Employee Engagement & Culture
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface font-display leading-tight">
            Peer Recognition Wall
          </h2>
          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed font-medium">
            Apresiasi kecil membawa dampak motivasi besar. Berikan pujian langsung untuk rekan satu tim kerjamu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {kudosList.length === 0 && (
            <EmptyState
              icon={Heart}
              title="Belum Ada Apresiasi"
              description="Jadilah yang pertama mengirimkan apresiasi untuk rekan kerjamu hari ini."
            />
          )}
          {kudosList.map(kudo => {
            const sender = employees.find(e => e.id === kudo.from)
            const receiver = employees.find(e => e.id === kudo.to)
            
            if (!sender || !receiver) return null

            return (
              <div key={kudo.id} className="glass-panel p-5 rounded-3xl border border-outline hover:border-accent-primary/50 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200">
                <div className="flex gap-4">
                  <div className="shrink-0 relative">
                    <img src={sender.avatar} alt={sender.name} className="w-10 h-10 rounded-2xl object-cover border-2 border-surface shadow-sm" />
                    <img src={receiver.avatar} alt={receiver.name} className="w-6 h-6 rounded-xl object-cover border-2 border-surface absolute -bottom-1 -right-1 shadow-sm" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-on-surface">
                        {sender.name} <span className="text-on-surface-variant font-medium mx-1">mengapresiasi</span> {receiver.name}
                      </p>
                      <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">{kudo.date}</span>
                    </div>
                    
                    <div className="mt-3 p-4 bg-surface-container-low rounded-2xl border border-outline text-xs text-on-surface-variant leading-relaxed">
                      "{kudo.text}"
                    </div>
                    
                    <div className="mt-3 flex items-center gap-4">
                      <button 
                        onClick={() => {
                          sound.playClick()
                          toast.success("Kudos disukai!")
                        }} 
                        className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-psy-safe transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-4 h-4" /> <span>Like</span>
                      </button>
                      <button 
                        onClick={() => {
                          sound.playClick()
                          toast.info("Fitur balasan thread akan segera hadir.")
                        }} 
                        className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-accent-primary transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" /> <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-outline bg-gradient-to-br from-surface to-surface-container-low">
            <h3 className="font-bold text-on-surface font-display mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-tertiary" /> Kirim Apresiasi Baru
            </h3>
            <p className="text-xs text-on-surface-variant mb-4 font-medium">Buka panel komprehensif untuk mengirimkan apresiasi kepada rekan kerjamu dengan mudah tanpa berpindah halaman.</p>
            <button 
                onClick={() => {
                  sound.playClick()
                  window.dispatchEvent(new CustomEvent('open-slideover', { detail: { type: 'kudos' } }))
                }}
                className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer font-display shadow-md"
              >
                <Send className="w-4 h-4" /> Buka Panel Kudos
              </button>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-outline">
            <h3 className="font-bold text-on-surface font-display mb-4 text-sm">Statistik Apresiasi Saya</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-psy-safe-bg border border-psy-safe/30 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-psy-safe-text font-mono">
                  {kudosList.filter(k => k.to === activeEmployeeId).length}
                </span>
                <span className="text-[10px] text-on-surface-variant font-bold uppercase mt-1">Diterima</span>
              </div>
              <div className="p-3.5 bg-accent-primary/10 border border-accent-primary/30 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-accent-primary font-mono">
                  {kudosList.filter(k => k.from === activeEmployeeId).length}
                </span>
                <span className="text-[10px] text-on-surface-variant font-bold uppercase mt-1">Diberikan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
