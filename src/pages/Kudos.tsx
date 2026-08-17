import { useHRStore } from '@/store/useHRStore'
import { Heart, MessageSquare, Award, ThumbsUp, Send } from 'lucide-react'
import { TiltCard } from '@/components/motion/TiltCard'
import { toast } from 'sonner'
import { useState } from 'react'
import { sound } from '@/lib/sound'
import { EmptyState } from '@/components/ui/EmptyState'

export function Kudos() {
  const employees = useHRStore(state => state.employees)
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  const kudosList = useHRStore(state => state.kudosList)
  const addKudos = useHRStore(state => state.addKudos)
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  
  const handleSendKudos = () => {
    if (!recipient || !message) {
      sound.playWarning()
      toast.error('Pilih rekan dan isi pesan terlebih dahulu!')
      return
    }
    
    sound.playSuccess()
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
              <TiltCard key={kudo.id} className="glass-panel p-5 rounded-3xl border border-outline hover:border-accent-primary/50 transition-colors">
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
              </TiltCard>
            )
          })}
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-outline bg-gradient-to-br from-surface to-surface-container-low">
            <h3 className="font-bold text-on-surface font-display mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-tertiary" /> Kirim Apresiasi Baru
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-on-surface-variant block mb-1">Kepada Rekan:</label>
                <select 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-surface-container border border-outline rounded-xl px-3 py-2.5 text-on-surface outline-none focus:border-accent-primary font-medium"
                >
                  <option value="">Pilih rekan kerja...</option>
                  {employees.filter(e => e.id !== activeEmployeeId).map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-on-surface-variant block">Pesan Apresiasi:</label>
                  <span className="text-[10px] font-mono text-on-surface-variant">{message.length}/180</span>
                </div>
                <textarea 
                  value={message}
                  maxLength={180}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3} 
                  className="w-full bg-surface-container border border-outline rounded-xl p-3 text-on-surface outline-none focus:border-accent-primary resize-none font-medium"
                  placeholder="Tulis pujian atau ucapan terima kasih atas kontribusi rekanmu..."
                />
              </div>
              <button 
                onClick={handleSendKudos}
                className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer font-display"
              >
                <Send className="w-3.5 h-3.5" /> Kirim Kudos
              </button>
            </div>
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
