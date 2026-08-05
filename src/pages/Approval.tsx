import { useHRStore } from '@/store/useHRStore'
import { TiltCard } from '@/components/motion/TiltCard'
import { CheckCircle2, XCircle, User, Clock, AlertTriangle, Wand2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

export function Approval() {
  const swapRequests = useHRStore(state => state.swapRequests)
  const employees = useHRStore(state => state.employees)
  const activeRole = useHRStore(state => state.activeRole)
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  const updateSwapRequestStatus = useHRStore(state => state.updateSwapRequestStatus)
  const addAuditLog = useHRStore(state => state.addAuditLog)
  const [conflictModalId, setConflictModalId] = useState<number | null>(null)

  const activeEmployee = employees.find(e => e.id === activeEmployeeId)
  const displayRequests = activeRole === 'manager' 
    ? swapRequests 
    : swapRequests.filter(req => req.requester === activeEmployee?.name)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-panel spotlight-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface font-display">{activeRole === 'manager' ? 'Approval Swap' : 'My Requests'}</h2>
            <span className="px-3 py-1 rounded-full bg-psy-warning-bg text-psy-warning-text text-xs font-bold uppercase tracking-wider border border-psy-warning/20">
              {displayRequests.filter(r => r.status === 'Pending' || r.status === 'Menunggu Approval').length} Pending
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Manajemen persetujuan tukar shift dan pengajuan lembur tim.
          </p>
        </div>
        {activeRole === 'manager' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={() => {
                const pendingValid = swapRequests.filter(r => r.status.includes('Menunggu') && !r.isConflict)
                if (pendingValid.length === 0) {
                  toast.info("Tidak ada request valid (tanpa konflik) yang bisa di-approve masal.")
                  return
                }
                pendingValid.forEach(req => updateSwapRequestStatus(req.id, 'Disetujui'))
                addAuditLog({ user: 'Manager', action: 'Batch Approval', detail: `Menyetujui ${pendingValid.length} swap shift otomatis` })
                toast.success(`${pendingValid.length} request disetujui secara masal.`)
              }}
              className="bg-psy-safe-bg text-psy-safe-text hover:bg-psy-safe hover:text-white border border-psy-safe/20 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve All Valid Requests
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {displayRequests.length === 0 && activeRole === 'karyawan' && (
          <div className="col-span-full p-8 text-center border border-dashed border-outline rounded-2xl bg-surface-container-lowest">
            <p className="text-on-surface-variant text-sm">Belum ada pengajuan cuti atau tukar shift yang Anda buat atau melibatkan Anda.</p>
          </div>
        )}
        {displayRequests.map((req) => (
          <TiltCard key={req.id} className="glass-panel p-5 rounded-2xl border border-outline hover:border-accent-primary/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-on-surface" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface mb-1">
                  <span className="text-accent-primary">{req.requester}</span> mengajukan tukar shift
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant font-medium">
                  <span className="flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5" /> {req.targetSlot}
                  </span>
                  <span>Alasan: {req.reason}</span>
                </div>
                {req.isConflict && (
                  <p className="text-xs font-bold text-psy-danger flex items-center gap-1 mt-2">
                    <span className="w-1.5 h-1.5 bg-psy-danger rounded-full animate-pulse"></span> Peringatan: Memicu lembur/kelelahan
                  </p>
                )}
              </div>
            </div>

            {activeRole === 'manager' && req.status.includes('Menunggu') && (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button 
                  onClick={() => {
                    if (req.isConflict) {
                      setConflictModalId(req.id)
                    } else {
                      updateSwapRequestStatus(req.id, 'Disetujui')
                      addAuditLog({ user: 'Manager', action: 'Approval Swap', detail: `Menyetujui swap shift ${req.requester}` })
                      toast.success("Swap shift berhasil disetujui")
                    }
                  }}
                  className="flex-1 md:flex-none py-2 px-4 rounded-xl bg-psy-safe-bg text-psy-safe-text hover:bg-psy-safe hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-psy-safe/20"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button 
                  onClick={() => {
                    updateSwapRequestStatus(req.id, 'Ditolak')
                    addAuditLog({ user: 'Manager', action: 'Reject Swap', detail: `Menolak swap shift ${req.requester}` })
                    toast.error("Swap shift ditolak")
                  }}
                  className="flex-1 md:flex-none py-2 px-4 rounded-xl bg-psy-danger-bg text-psy-danger-text hover:bg-psy-danger hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-psy-danger/20"
                >
                  <XCircle className="w-4 h-4" /> Tolak
                </button>
              </div>
            )}
            {activeRole === 'manager' && !req.status.includes('Menunggu') && (
               <div className="flex items-center gap-2 w-full md:w-auto px-4 py-2 bg-surface-container-high rounded-xl text-xs font-bold text-on-surface-variant">
                 Status: {req.status}
               </div>
            )}
            
            {activeRole === 'karyawan' && (
              <div className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant font-bold text-xs">
                {req.status}
              </div>
            )}
          </TiltCard>
        ))}
        {swapRequests.length === 0 && (
          <div className="text-center py-10 text-on-surface-variant text-sm font-medium">
            Tidak ada pengajuan pending.
          </div>
        )}
      </div>

      {/* Poka-Yoke Defensive UX Modal */}
      {conflictModalId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-outline w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-psy-danger/20 bg-psy-danger-bg flex justify-between items-center">
              <h3 className="font-bold text-psy-danger font-display text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Peringatan Risiko Kelelahan
              </h3>
              <button onClick={() => setConflictModalId(null)} className="p-2 text-psy-danger hover:bg-psy-danger/10 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-on-surface leading-relaxed">
                Menyetujui permintaan ini akan menyebabkan karyawan bekerja dengan <strong>jeda istirahat kurang dari 8 jam</strong>. Hal ini melanggar batas aman operasional.
              </p>
              
              <div className="flex flex-col gap-2 mt-6">
                <button 
                  onClick={() => {
                    updateSwapRequestStatus(conflictModalId, 'Disetujui')
                    addAuditLog({ user: 'System AI', action: 'Auto-Fix Swap', detail: `Auto-fix konflik swap shift ID ${conflictModalId}` })
                    toast.success("Sistem otomatis memindahkan shift untuk menjaga jeda istirahat 8 jam. Swap disetujui.", { icon: '✨' })
                    setConflictModalId(null)
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-primary to-primary text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  <Wand2 className="w-4 h-4" /> ✨ Auto-Fix & Approve
                </button>
                <button 
                  onClick={() => {
                    updateSwapRequestStatus(conflictModalId, 'Disetujui')
                    addAuditLog({ user: 'Manager', action: 'Force Approve', detail: `Force approve konflik swap shift ID ${conflictModalId}` })
                    toast.warning("Force approve dilakukan. Risiko burnout meningkat.")
                    setConflictModalId(null)
                  }}
                  className="w-full py-3 rounded-xl bg-transparent border border-psy-danger/30 text-psy-danger hover:bg-psy-danger/10 font-bold flex items-center justify-center transition-colors"
                >
                  Tetap Setujui (Abaikan Peringatan)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
