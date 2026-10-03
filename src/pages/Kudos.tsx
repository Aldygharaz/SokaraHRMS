import { useHRStore } from '@/store/useHRStore'
import { Heart, MessageSquare, Award, ThumbsUp, Send } from 'lucide-react'
import { toast } from 'sonner'
import { sound } from '@/lib/sound'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tooltip, InfoTooltip } from '@/components/ui/Tooltip'

export function Kudos() {
  const employees = useHRStore(state => state.employees)
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  const kudosList = useHRStore(state => state.kudosList)
  
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Standardized Clean Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
              Peer Recognition Wall
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-on-surface-variant text-[10px] font-semibold border border-outline font-mono">
              {kudosList.length} Apresiasi
            </span>
            <InfoTooltip 
              title="Peer Recognition Wall" 
              badge="Budaya Kerja" 
              description="Sistem apresiasi rekan kerja lintas divisi untuk menumbuhkan budaya saling menghargai, kolaborasi shift, dan menurunkan turnover kru." 
            />
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Budaya apresiasi antar rekan kerja untuk meningkatkan motivasi dan kolaborasi tim.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip title="Kirim Apresiasi" description="Tulis pesan penghargaan khusus untuk rekan kerja yang telah membantu operasional hari ini.">
            <button
              onClick={() => {
                sound.playClick()
                window.dispatchEvent(new CustomEvent('open-slideover', { detail: { type: 'kudos' } }))
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Kirim Apresiasi
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
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
              <div key={kudo.id} className="surface-card p-4 rounded-xl border border-outline hover:border-accent-primary/40 transition-colors">
                <div className="flex gap-3">
                  <div className="shrink-0 relative">
                    <img src={sender.avatar} alt={sender.name} className="w-10 h-10 rounded-lg object-cover border border-outline shadow-xs" />
                    <img src={receiver.avatar} alt={receiver.name} className="w-5 h-5 rounded-md object-cover border border-surface absolute -bottom-1 -right-1 shadow-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-on-surface truncate">
                        {sender.name} <span className="text-on-surface-variant font-normal">mengapresiasi</span> {receiver.name}
                      </p>
                      <span className="text-[10px] font-mono text-on-surface-variant shrink-0">{kudo.date}</span>
                    </div>
                    
                    <div className="mt-2.5 p-3 bg-surface-container-low rounded-lg border border-outline text-xs text-on-surface-variant leading-relaxed">
                      "{kudo.text}"
                    </div>
                    
                    <div className="mt-3 flex items-center gap-4">
                      <Tooltip content="Beri tanda suka pada kartu apresiasi ini">
                        <button 
                          onClick={() => {
                            sound.playClick()
                            toast.success("Kudos disukai")
                          }} 
                          className="flex items-center gap-1.5 text-[11px] font-medium text-on-surface-variant hover:text-psy-safe transition-colors cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> <span>Suka</span>
                        </button>
                      </Tooltip>
                      <Tooltip content="Fitur diskusi & balasan thread apresiasi">
                        <button 
                          onClick={() => {
                            sound.playClick()
                            toast.info("Fitur balasan thread akan segera hadir")
                          }} 
                          className="flex items-center gap-1.5 text-[11px] font-medium text-on-surface-variant hover:text-accent-primary transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> <span>Balas</span>
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="space-y-4">
          <div className="surface-card p-5 rounded-xl border border-outline">
            <h3 className="font-semibold text-on-surface text-sm mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-accent-primary" /> Kirim Apresiasi Baru
            </h3>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Beri pengakuan kepada rekan kerja yang berdedikasi atau membantu operasional shift hari ini.
            </p>
            <Tooltip content="Buka formulir untuk memilih rekan kerja dan mengirim kartu ucapan">
              <button 
                onClick={() => {
                  sound.playClick()
                  window.dispatchEvent(new CustomEvent('open-slideover', { detail: { type: 'kudos' } }))
                }}
                className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-medium py-2 rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Buka Formulir Kudos
              </button>
            </Tooltip>
          </div>

          <div className="surface-card p-5 rounded-xl border border-outline">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-on-surface text-sm">Statistik Apresiasi Saya</h3>
              <InfoTooltip 
                title="Metrik Rekognisi Pribadi" 
                badge="Peer Impact" 
                description="Perbandingan jumlah apresiasi yang Anda terima dari rekan kerja versus yang telah Anda berikan kepada tim." 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Tooltip content="Total pengakuan kerja baik yang Anda terima dari anggota tim">
                <div className="p-3 bg-surface-container-low border border-outline rounded-lg flex flex-col items-center justify-center cursor-help">
                  <span className="text-xl font-bold text-on-surface font-mono">
                    {kudosList.filter(k => k.to === activeEmployeeId).length}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-medium uppercase mt-0.5">Diterima</span>
                </div>
              </Tooltip>
              <Tooltip content="Total apresiasi yang telah Anda berikan kepada rekan kerja">
                <div className="p-3 bg-surface-container-low border border-outline rounded-lg flex flex-col items-center justify-center cursor-help">
                  <span className="text-xl font-bold text-on-surface font-mono">
                    {kudosList.filter(k => k.from === activeEmployeeId).length}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-medium uppercase mt-0.5">Diberikan</span>
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
