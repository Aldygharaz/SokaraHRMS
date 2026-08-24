import { useState, useEffect } from 'react'
import { SlideOver } from './SlideOver'
import { useHRStore } from '@/store/useHRStore'
import { Send, Download, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { sound } from '@/lib/sound'

export function GlobalActionDrawers() {
  const [activeDrawer, setActiveDrawer] = useState<'kudos' | 'export' | null>(null)
  
  // Kudos State
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  
  const employees = useHRStore(state => state.employees)
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  const addKudos = useHRStore(state => state.addKudos)
  
  useEffect(() => {
    const handleOpenDrawer = (e: CustomEvent) => {
      setActiveDrawer(e.detail.type)
    }
    window.addEventListener('open-slideover' as any, handleOpenDrawer)
    return () => window.removeEventListener('open-slideover' as any, handleOpenDrawer)
  }, [])

  const close = () => setActiveDrawer(null)

  const handleSendKudos = () => {
    if (!recipient || !message) {
      sound.playWarning()
      toast.error('Pilih rekan dan isi pesan terlebih dahulu!')
      return
    }
    sound.playSuccess()
    addKudos({ from: activeEmployeeId, to: Number(recipient), text: message, type: 'teamwork' })
    toast.success("Apresiasi berhasil dikirim!")
    setRecipient(''); setMessage(''); close()
  }

  return (
    <>
      {/* Kudos Slide-over */}
      <SlideOver isOpen={activeDrawer === 'kudos'} onClose={close} title="Kirim Apresiasi (Kudos)">
        <div className="space-y-6 text-sm">
          <p className="text-on-surface-variant font-medium leading-relaxed">
            Berikan apresiasi kepada rekan kerja yang telah membantu atau menunjukkan performa luar biasa.
          </p>
          <div>
            <label className="font-bold text-on-surface block mb-2">Kepada Rekan:</label>
            <select 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface outline-none focus:border-accent-primary font-medium shadow-sm"
            >
              <option value="">Pilih rekan kerja...</option>
              {employees.filter(e => e.id !== activeEmployeeId).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-on-surface block">Pesan Apresiasi:</label>
              <span className="text-[10px] font-mono text-on-surface-variant">{message.length}/180</span>
            </div>
            <textarea 
              value={message}
              maxLength={180}
              onChange={(e) => setMessage(e.target.value)}
              rows={5} 
              className="w-full bg-surface border border-outline rounded-xl p-4 text-on-surface outline-none focus:border-accent-primary resize-none font-medium shadow-sm"
              placeholder="Tulis pujian atau ucapan terima kasih..."
            />
          </div>
          <button 
            onClick={handleSendKudos}
            className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_0_rgba(9,132,227,0.39)]"
          >
            <Send className="w-4 h-4" /> Kirim Kudos
          </button>
        </div>
      </SlideOver>

      {/* Export Payroll Slide-over */}
      <SlideOver isOpen={activeDrawer === 'export'} onClose={close} title="Export Data Payroll">
        <div className="space-y-6 text-sm flex flex-col items-center justify-center h-full pb-20 text-center">
            <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center text-accent-primary mb-2">
                <FileText className="w-8 h-8" />
            </div>
            <div>
                <h3 className="font-bold text-lg text-on-surface">Format CSV Siap Diunduh</h3>
                <p className="text-on-surface-variant max-w-[250px] mx-auto mt-2">Pilih format sesuai bank tujuan untuk proses mass transfer otomatis.</p>
            </div>
            <div className="w-full space-y-3 mt-4">
                <button onClick={() => { toast.success("BCA Corporate CSV Diunduh"); close(); sound.playSuccess() }} className="w-full px-4 py-3 bg-surface border border-outline hover:border-accent-primary rounded-xl font-bold flex justify-between items-center cursor-pointer">
                    <span>BCA Corporate</span> <Download className="w-4 h-4 text-accent-primary" />
                </button>
                <button onClick={() => { toast.success("Mandiri MCM CSV Diunduh"); close(); sound.playSuccess() }} className="w-full px-4 py-3 bg-surface border border-outline hover:border-accent-primary rounded-xl font-bold flex justify-between items-center cursor-pointer">
                    <span>Mandiri MCM</span> <Download className="w-4 h-4 text-accent-primary" />
                </button>
                <button onClick={() => { toast.success("Sokara Ledger CSV Diunduh"); close(); sound.playSuccess() }} className="w-full px-4 py-3 bg-surface border border-outline hover:border-accent-primary rounded-xl font-bold flex justify-between items-center cursor-pointer">
                    <span>Sokara Full Ledger</span> <Download className="w-4 h-4 text-accent-primary" />
                </button>
            </div>
        </div>
      </SlideOver>
    </>
  )
}
