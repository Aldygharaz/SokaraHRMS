import { useHRStore } from '@/store/useHRStore'
import { Heart, MessageSquare, Award, ThumbsUp } from 'lucide-react'
import { TiltCard } from '@/components/motion/TiltCard'
import { toast } from 'sonner'
import { useState } from 'react'

export function Kudos() {
  const employees = useHRStore(state => state.employees)
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  const kudosList = useHRStore(state => state.kudosList)
  const addKudos = useHRStore(state => state.addKudos)
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  
  const handleSendKudos = () => {
    if (!recipient || !message) {
      toast.error('Pilih rekan dan isi pesan terlebih dahulu!')
      return
    }
    
    addKudos({
      from: activeEmployeeId,
      to: Number(recipient),
      text: message,
      type: 'teamwork'
    })
    
    toast.success("Apresiasi berhasil dikirim!")
    setRecipient('')
    setMessage('')
  }


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-panel spotlight-card p-6 md:p-8 rounded-3xl border-semantic-neutral/30 bg-gradient-to-r from-gradient-start to-surface dark:from-surface-container-low dark:to-surface-container">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-psy-safe/20 border border-psy-safe/30 text-psy-safe text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4" /> Employee Engagement
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface font-display leading-tight">
            Recognition Wall
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed font-medium">
            Apresiasi kecil membawa dampak besar. Berikan pujian untuk rekan setimmu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {kudosList.map(kudo => {
            const sender = employees.find(e => e.id === kudo.from)
            const receiver = employees.find(e => e.id === kudo.to)
            
            if (!sender || !receiver) return null;

            return (
              <TiltCard key={kudo.id} className="glass-panel p-5 rounded-2xl border border-outline hover:border-accent-primary/50 transition-colors">
                <div className="flex gap-4">
                  <div className="shrink-0 relative">
                    <img src={sender.avatar} alt={sender.name} className="w-10 h-10 rounded-full object-cover border-2 border-surface" />
                    <img src={receiver.avatar} alt={receiver.name} className="w-6 h-6 rounded-full object-cover border-2 border-surface absolute -bottom-1 -right-1" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-on-surface">
                        {sender.name} <span className="text-on-surface-variant font-medium mx-1">mengapresiasi</span> {receiver.name}
                      </p>
                      <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">{kudo.date}</span>
                    </div>
                    
                    <div className="mt-3 p-4 bg-surface-container-low rounded-xl border border-transparent text-sm text-on-surface-variant italic">
                      "{kudo.text}"
                    </div>
                    
                    <div className="mt-3 flex items-center gap-4">
                      <button onClick={() => toast.success("Kudos disukai!")} className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-psy-safe transition-colors">
                        <ThumbsUp className="w-4 h-4" /> <span>Like</span>
                      </button>
                      <button onClick={() => toast.info("Fitur balasan akan segera hadir")} className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-accent-primary transition-colors">
                        <MessageSquare className="w-4 h-4" /> <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              </TiltCard>
            )
          })}
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-outline bg-gradient-to-br from-surface to-surface-container-low">
            <h3 className="font-bold text-on-surface font-display mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-tertiary" /> Kirim Apresiasi Baru
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">Kepada:</label>
                <select 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-accent-primary"
                >
                  <option value="">Pilih rekan kerja...</option>
                  {employees.filter(e => e.id !== activeEmployeeId).map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">Pesan (Kudos):</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3} 
                  className="w-full bg-surface-container-high border border-outline rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-accent-primary resize-none"
                  placeholder="Tulis pujian atau ucapan terima kasih..."
                ></textarea>
              </div>
              <button 
                onClick={handleSendKudos}
                className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
              >
                Kirim Kudos
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-outline">
            <h3 className="font-bold text-on-surface font-display mb-4">Statistik Saya</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-psy-safe/10 border border-psy-safe/20 rounded-xl flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-psy-safe font-mono">
                  {kudosList.filter(k => k.to === activeEmployeeId).length}
                </span>
                <span className="text-[10px] text-on-surface-variant font-bold uppercase mt-1">Diterima</span>
              </div>
              <div className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-xl flex flex-col items-center justify-center">
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
