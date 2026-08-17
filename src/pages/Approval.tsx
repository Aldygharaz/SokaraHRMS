import { useHRStore } from '@/store/useHRStore'
import { TiltCard } from '@/components/motion/TiltCard'
import { CheckCircle2, XCircle, User, Clock, AlertTriangle, X, Plus, Sparkles, Send, Store, UserCheck, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tooltip } from '@/components/ui/Tooltip'

export function Approval() {
  const swapRequests = useHRStore(state => state.swapRequests)
  const openShifts = useHRStore(state => state.openShifts)
  const employees = useHRStore(state => state.employees)
  const activeRole = useHRStore(state => state.activeRole)
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  const updateSwapRequestStatus = useHRStore(state => state.updateSwapRequestStatus)
  const restoreSnapshot = useHRStore(state => state.restoreSnapshot)
  const addSwapRequest = useHRStore(state => state.addSwapRequest)
  const postOpenShift = useHRStore(state => state.postOpenShift)
  const claimOpenShift = useHRStore(state => state.claimOpenShift)
  const addAuditLog = useHRStore(state => state.addAuditLog)

  const [activeTab, setActiveTab] = useState<'requests' | 'marketplace'>('requests')
  const [conflictModalId, setConflictModalId] = useState<number | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showPostOpenModal, setShowPostOpenModal] = useState(false)

  // Submit Form State
  const [targetSlot, setTargetSlot] = useState('Sabtu (29 Agu) - Shift Pagi (08:00 - 17:00)')
  const [targetCoworker, setTargetCoworker] = useState('Budi Santoso')
  const [reason, setReason] = useState('')
  const [isSimulatingConflict, setIsSimulatingConflict] = useState(false)

  // Open Shift Form State
  const [openSlotDay, setOpenSlotDay] = useState(4) // Friday
  const [openShiftType, setOpenShiftType] = useState('Sore')
  const [openReason, setOpenReason] = useState('')

  const activeEmployee = employees.find(e => e.id === activeEmployeeId)
  const displayRequests = activeRole === 'manager' 
    ? swapRequests 
    : swapRequests.filter(req => req.requester === activeEmployee?.name)

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      toast.error("Mohon isi alasan pengajuan tukar shift.")
      sound.playWarning()
      return
    }

    sound.playSuccess()
    addSwapRequest({
      requester: activeEmployee?.name || 'Karyawan',
      targetSlot: `${targetSlot} (dg ${targetCoworker})`,
      dayIdx: 5,
      reason: reason.trim(),
      status: 'Menunggu Approval',
      stepperStep: 2,
      isConflict: isSimulatingConflict
    })

    toast.success("Pengajuan tukar shift berhasil dikirim ke Manajer!")
    setShowSubmitModal(false)
    setReason('')
  }

  const handlePostOpenShift = (e: React.FormEvent) => {
    e.preventDefault()
    if (!openReason.trim()) return

    sound.playSuccess()
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
    const slotLabel = `${dayNames[openSlotDay]} (Tgl ${20 + openSlotDay}) - Shift ${openShiftType}`

    postOpenShift(slotLabel, openSlotDay, openShiftType, openReason.trim())
    toast.success("Shift berhasil dilempar ke Bursa Terbuka!")
    setShowPostOpenModal(false)
    setOpenReason('')
  }

  const handleClaim = (shiftId: number, slot: string) => {
    sound.playSuccess()
    claimOpenShift(shiftId, activeEmployeeId)
    toast.success(`Berhasil mengklaim ${slot}!`, {
      description: "Jadwal kalender Anda telah otomatis diperbarui."
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="glass-panel spotlight-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface font-display">Approval & Shift Trade Marketplace</h2>
            <Tooltip content="Jumlah total permohonan swap shift yang menunggu persetujuan manajer">
              <span className="px-3 py-1 rounded-full bg-psy-warning-bg text-psy-warning-text text-xs font-bold uppercase tracking-wider border border-psy-warning/20 font-mono cursor-help">
                {displayRequests.filter(r => r.status.includes('Menunggu') || r.status === 'Pending').length} Menunggu
              </span>
            </Tooltip>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Alur pertukaran shift mandiri antar kru berstandar When I Work dan persetujuan manajer dengan validasi pencegahan kelelahan otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeRole === 'manager' && (
            <Tooltip content="Menyetujui semua permintaan swap shift yang lolos uji validasi AI (bebas dari konflik kelelahan)">
              <button 
                onClick={() => {
                  const pendingValid = swapRequests.filter(r => r.status.includes('Menunggu') && !r.isConflict)
                  if (pendingValid.length === 0) {
                    sound.playWarning()
                    toast.info("Tidak ada request valid (tanpa konflik) yang bisa di-approve masal.")
                    return
                  }
                  sound.playSuccess()
                  pendingValid.forEach(req => updateSwapRequestStatus(req.id, 'Disetujui'))
                  addAuditLog({ user: 'Manager', action: 'Batch Approval', detail: `Menyetujui ${pendingValid.length} swap shift otomatis` })
                  toast.success(`${pendingValid.length} request disetujui secara masal.`)
                }}
                className="bg-psy-safe-bg text-psy-safe-text hover:bg-psy-safe hover:text-white border border-psy-safe/20 text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Semua yang Aman
              </button>
            </Tooltip>
          )}

          {activeRole === 'karyawan' && (
            <>
              <Tooltip content="Lepaskan jadwal shift Anda ke bursa publik agar dapat diambil oleh rekan yang libur">
                <button 
                  onClick={() => {
                    sound.playClick()
                    setShowPostOpenModal(true)
                  }}
                  className="bg-surface-container-high hover:bg-surface-container text-on-surface text-xs font-bold py-2 px-3.5 rounded-xl border border-outline flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Store className="w-4 h-4 text-accent-primary" /> Lempar Shift ke Bursa
                </button>
              </Tooltip>

              <Tooltip content="Ajukan pertukaran jadwal shift dengan rekan kerja spesifik">
                <button 
                  onClick={() => {
                    sound.playClick()
                    setShowSubmitModal(true)
                  }}
                  className="bg-gradient-to-r from-accent-primary to-primary text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 hover:shadow-[0_0_18px_rgba(27,95,174,0.4)] transition-all cursor-pointer font-display"
                >
                  <Plus className="w-4 h-4" /> Ajukan Swap Shift
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline pb-2">
        <button
          onClick={() => {
            sound.playClick()
            setActiveTab('requests')
          }}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
            activeTab === 'requests' 
              ? "bg-accent-primary text-white shadow-sm" 
              : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <Layers className="w-4 h-4" /> Permintaan Swap ({displayRequests.length})
        </button>
        <button
          onClick={() => {
            sound.playClick()
            setActiveTab('marketplace')
          }}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
            activeTab === 'marketplace' 
              ? "bg-accent-primary text-white shadow-sm" 
              : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <Store className="w-4 h-4" /> Bursa Shift Terbuka ({openShifts.filter(s => s.status === 'open').length} Tersedia)
        </button>
      </div>

      {/* Tab Content: Requests */}
      {activeTab === 'requests' && (
        <div className="grid gap-4">
          {displayRequests.length === 0 && (
            <EmptyState
              icon={Layers}
              title={activeRole === 'karyawan' ? 'Belum Ada Pengajuan Swap' : 'Tidak Ada Antrean Approval'}
              description={activeRole === 'karyawan' ? 'Anda belum memiliki riwayat pengajuan tukar shift.' : 'Semua pengajuan tukar shift dari kru telah diproses.'}
              actionLabel={activeRole === 'karyawan' ? 'Buat Pengajuan Baru' : undefined}
              onAction={activeRole === 'karyawan' ? () => { sound.playClick(); setShowSubmitModal(true) } : undefined}
            />
          )}

          {displayRequests.map((req) => (
            <TiltCard key={req.id} className="glass-panel p-5 rounded-3xl border border-outline hover:border-accent-primary/30 transition-all flex flex-col justify-between gap-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center shrink-0 border border-outline">
                    <User className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-on-surface">
                      <span className="text-accent-primary">{req.requester}</span> mengajukan tukar shift
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant font-medium">
                      <span className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-lg border border-outline font-mono">
                        <Clock className="w-3.5 h-3.5 text-accent-primary" /> {req.targetSlot}
                      </span>
                      <span>Alasan: {req.reason}</span>
                    </div>
                  </div>
                </div>

                {/* Manager Actions */}
                {activeRole === 'manager' && req.status.includes('Menunggu') && (
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Tooltip content={req.isConflict ? 'Permintaan ini memiliki potensi konflik kelelahan, klik untuk melihat evaluasi AI' : 'Setujui permohonan pertukaran shift ini'}>
                      <button 
                        onClick={() => {
                          if (req.isConflict) {
                            sound.playWarning()
                            setConflictModalId(req.id)
                          } else {
                            const prevRequests = [...swapRequests]
                            sound.playSuccess()
                            updateSwapRequestStatus(req.id, 'Disetujui')
                            addAuditLog({ user: 'Manager', action: 'Approval Swap', detail: `Menyetujui swap shift ${req.requester}` })
                            toast.success(`Swap shift ${req.requester} disetujui.`, {
                              duration: 5000,
                              action: {
                                label: 'Undo',
                                onClick: () => {
                                  sound.playClick()
                                  restoreSnapshot({ swapRequests: prevRequests })
                                  toast.info(`Persetujuan swap ${req.requester} dibatalkan.`)
                                }
                              }
                            })
                          }
                        }}
                        className="flex-1 md:flex-none py-2 px-4 rounded-xl bg-psy-safe-bg text-psy-safe-text hover:bg-psy-safe hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-psy-safe/20 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                    </Tooltip>
                    <Tooltip content="Tolak permohonan pertukaran shift ini">
                      <button 
                        onClick={() => {
                          const prevRequests = [...swapRequests]
                          sound.playClick()
                          updateSwapRequestStatus(req.id, 'Ditolak')
                          addAuditLog({ user: 'Manager', action: 'Reject Swap', detail: `Menolak swap shift ${req.requester}` })
                          toast.error(`Swap shift ${req.requester} ditolak.`, {
                            duration: 5000,
                            action: {
                              label: 'Undo',
                              onClick: () => {
                                sound.playClick()
                                restoreSnapshot({ swapRequests: prevRequests })
                                toast.info(`Penolakan swap ${req.requester} dibatalkan.`)
                              }
                            }
                          })
                        }}
                        className="flex-1 md:flex-none py-2 px-4 rounded-xl bg-psy-danger-bg text-psy-danger-text hover:bg-psy-danger hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-psy-danger/20 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> Tolak
                      </button>
                    </Tooltip>
                  </div>
                )}

                {/* Read-only status tags */}
                {(!req.status.includes('Menunggu') || activeRole === 'karyawan') && (
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider",
                      req.status === 'Disetujui' ? "bg-psy-safe-bg text-psy-safe-text border border-psy-safe/30" :
                      req.status === 'Ditolak' ? "bg-psy-danger-bg text-psy-danger-text border border-psy-danger/30" :
                      "bg-psy-warning-bg text-psy-warning-text border border-psy-warning/30"
                    )}>
                      {req.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Enhanced Visual Stepper Timeline with Tooltips */}
              <div className="pt-3 border-t border-outline/70 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <Tooltip content="Langkah 1: Pengajuan telah dikirimkan oleh pemohon ke sistem">
                  <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline flex items-center gap-2 cursor-help w-full">
                    <span className="w-5 h-5 rounded-full bg-psy-safe-bg text-psy-safe flex items-center justify-center text-[10px] font-bold">1</span>
                    <div>
                      <p className="font-bold text-[11px] text-on-surface">Diajukan</p>
                      <p className="text-[10px] text-on-surface-variant font-mono">{req.requester}</p>
                    </div>
                  </div>
                </Tooltip>

                <Tooltip content={req.isConflict ? 'Peringatan: Pola shift berurutan menyebabkan jeda istirahat kurang dari 8 jam.' : 'Pemeriksaan AI: Jadwal tidak menimbulkan beban kerja berlebih.'}>
                  <div className={cn("p-2.5 rounded-xl border flex items-center gap-2 cursor-help w-full", req.isConflict ? "bg-psy-danger-bg/50 border-psy-danger/30" : "bg-surface-container-low border-outline")}>
                    <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold", req.isConflict ? "bg-psy-danger/20 text-psy-danger" : "bg-accent-primary/20 text-accent-primary")}>2</span>
                    <div>
                      <p className={cn("font-bold text-[11px]", req.isConflict ? "text-psy-danger" : "text-on-surface")}>
                        {req.isConflict ? 'Konflik Kelelahan' : 'Validasi AI'}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        {req.isConflict ? 'Jeda istirahat < 8 jam' : 'Jadwal aman & sesuai'}
                      </p>
                    </div>
                  </div>
                </Tooltip>

                <Tooltip content={`Status persetujuan akhir oleh Manajer: ${req.status}`}>
                  <div className={cn("p-2.5 rounded-xl border flex items-center gap-2 cursor-help w-full", req.status === 'Disetujui' ? "bg-psy-safe-bg/50 border-psy-safe/30" : req.status === 'Ditolak' ? "bg-psy-danger-bg/50 border-psy-danger/30" : "bg-surface-container-low border-outline")}>
                    <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold", req.status === 'Disetujui' ? "bg-psy-safe/20 text-psy-safe" : req.status === 'Ditolak' ? "bg-psy-danger/20 text-psy-danger" : "bg-psy-warning/20 text-psy-warning")}>3</span>
                    <div>
                      <p className="font-bold text-[11px] text-on-surface">Keputusan Manajer</p>
                      <p className={cn("text-[10px] font-bold font-mono", req.status === 'Disetujui' ? "text-psy-safe-text" : req.status === 'Ditolak' ? "text-psy-danger" : "text-psy-warning-text")}>
                        {req.status}
                      </p>
                    </div>
                  </div>
                </Tooltip>
              </div>
            </TiltCard>
          ))}
        </div>
      )}

      {/* Tab Content: Open Shift Marketplace (When I Work Standard) */}
      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {openShifts.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={Store}
                title="Bursa Shift Masih Kosong"
                description="Belum ada staf yang melempar shift ke bursa publik."
                actionLabel={activeRole === 'karyawan' ? 'Lempar Shift Anda' : undefined}
                onAction={activeRole === 'karyawan' ? () => { sound.playClick(); setShowPostOpenModal(true) } : undefined}
              />
            </div>
          )}

          {openShifts.map((shift) => (
            <TiltCard 
              key={shift.id} 
              className={cn(
                "glass-panel p-5 rounded-3xl border flex flex-col justify-between space-y-4",
                shift.status === 'claimed' ? "opacity-60 border-outline" : "border-accent-primary/40 hover:border-accent-primary"
              )}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Tooltip content={`Skill yang dibutuhkan untuk mengambil shift ini: ${shift.role}`}>
                      <span className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary font-bold text-xs cursor-help">
                        {shift.role}
                      </span>
                    </Tooltip>
                    <span className="text-xs font-bold text-on-surface">{shift.originalOwner}</span>
                  </div>
                  <Tooltip content={shift.status === 'open' ? 'Shift ini bebas diambil oleh staf yang libur di hari tersebut' : `Shift telah berhasil diambil alih oleh ${shift.claimedBy}`}>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono cursor-help",
                      shift.status === 'open' ? "bg-psy-safe-bg text-psy-safe-text border border-psy-safe/30" : "bg-surface-container text-on-surface-variant"
                    )}>
                      {shift.status === 'open' ? 'Tersedia untuk Diklaim' : `Diklaim oleh ${shift.claimedBy}`}
                    </span>
                  </Tooltip>
                </div>

                <h4 className="font-bold text-base text-on-surface font-display mt-2">{shift.slot}</h4>
                <p className="text-xs text-on-surface-variant mt-1">Alasan dilepas: {shift.reason}</p>
              </div>

              <div className="pt-2 border-t border-outline flex justify-between items-center">
                <span className="text-[11px] text-on-surface-variant font-medium">Bursa Shift Peer-to-Peer</span>
                {shift.status === 'open' && (
                  <Tooltip content="Klaim shift ini dan tambahkan langsung ke jadwal kalender Anda">
                    <button
                      onClick={() => handleClaim(shift.id, shift.slot)}
                      className="py-2 px-4 rounded-xl bg-accent-primary text-white text-xs font-bold flex items-center gap-1.5 hover:shadow-md transition-all cursor-pointer font-display"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Ambil Shift Ini
                    </button>
                  </Tooltip>
                )}
              </div>
            </TiltCard>
          ))}
        </div>
      )}

      {/* Form Modal Ajukan Swap Shift */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowSubmitModal(false)} />
          <div className="relative glass-panel bg-surface rounded-3xl shadow-2xl border border-outline w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold font-display text-lg text-on-surface">Ajukan Tukar Shift</h3>
                <p className="text-xs text-on-surface-variant">Pilih jadwal dan rekan yang ingin diajak bertukar</p>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="p-2 hover:bg-surface-container-high rounded-full cursor-pointer">
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-on-surface-variant block mb-1.5">Jadwal Shift Target</label>
                <select 
                  value={targetSlot} 
                  onChange={(e) => setTargetSlot(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline rounded-xl p-3 text-on-surface font-medium outline-none focus:border-accent-primary"
                >
                  <option value="Sabtu (29 Agu) - Shift Pagi (08:00 - 17:00)">Sabtu (29 Agu) - Shift Pagi (08:00 - 17:00)</option>
                  <option value="Minggu (30 Agu) - Shift Sore (14:00 - 23:00)">Minggu (30 Agu) - Shift Sore (14:00 - 23:00)</option>
                  <option value="Senin (31 Agu) - Shift Pagi (08:00 - 17:00)">Senin (31 Agu) - Shift Pagi (08:00 - 17:00)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-on-surface-variant block mb-1.5">Tukar Dengan Rekan</label>
                <select 
                  value={targetCoworker} 
                  onChange={(e) => setTargetCoworker(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline rounded-xl p-3 text-on-surface font-medium outline-none focus:border-accent-primary"
                >
                  {employees.filter(emp => emp.id !== activeEmployeeId).map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-on-surface-variant block">Alasan Penukaran</label>
                  <span className={cn("text-[10px] font-mono", reason.length > 130 ? "text-psy-warning-text font-bold" : "text-on-surface-variant")}>
                    {reason.length}/150
                  </span>
                </div>
                <textarea 
                  rows={3}
                  maxLength={150}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: Ada acara keluarga penting di kampung / urusan medis..."
                  className="w-full bg-surface-container-low border border-outline rounded-xl p-3 text-on-surface font-medium outline-none focus:border-accent-primary resize-none"
                  required
                />
              </div>

              <div className="p-3 bg-surface-container-lowest border border-outline rounded-xl flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant font-medium">Uji Simulasi Konflik Kelelahan (Fatigue Risk):</span>
                <input 
                  type="checkbox" 
                  checked={isSimulatingConflict} 
                  onChange={(e) => setIsSimulatingConflict(e.target.checked)}
                  className="w-4 h-4 accent-accent-primary cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-outline hover:bg-surface-container text-on-surface-variant font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-primary text-white font-bold flex items-center justify-center gap-1.5 hover:shadow-lg transition-all cursor-pointer font-display"
                >
                  <Send className="w-3.5 h-3.5" /> Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lempar Shift ke Bursa */}
      {showPostOpenModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowPostOpenModal(false)} />
          <div className="relative glass-panel bg-surface rounded-3xl shadow-2xl border border-outline w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold font-display text-lg text-on-surface">Lempar Shift ke Bursa</h3>
                <p className="text-xs text-on-surface-variant">Izinkan rekan kerja lain yang sedang libur untuk mengambil shiftmu</p>
              </div>
              <button onClick={() => setShowPostOpenModal(false)} className="p-2 hover:bg-surface-container-high rounded-full cursor-pointer">
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            <form onSubmit={handlePostOpenShift} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-on-surface-variant block mb-1.5">Hari Shift Yang Dilepas</label>
                <select 
                  value={openSlotDay}
                  onChange={(e) => setOpenSlotDay(Number(e.target.value))}
                  className="w-full bg-surface-container-low border border-outline rounded-xl p-3 text-on-surface font-medium outline-none focus:border-accent-primary"
                >
                  <option value={4}>Jumat (24 Agu)</option>
                  <option value={5}>Sabtu (25 Agu)</option>
                  <option value={6}>Minggu (26 Agu)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-on-surface-variant block mb-1.5">Jenis Shift</label>
                <select 
                  value={openShiftType}
                  onChange={(e) => setOpenShiftType(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline rounded-xl p-3 text-on-surface font-medium outline-none focus:border-accent-primary"
                >
                  <option value="Pagi">Pagi (08:00 - 17:00)</option>
                  <option value="Sore">Sore (14:00 - 23:00)</option>
                  <option value="Closing">Closing (16:00 - 01:00)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-on-surface-variant block mb-1.5">Alasan Dilepas ke Bursa</label>
                <textarea 
                  rows={3}
                  value={openReason}
                  onChange={(e) => setOpenReason(e.target.value)}
                  placeholder="Misal: Ada jadwal praktikum / ingin ambil hari libur ekstra..."
                  className="w-full bg-surface-container-low border border-outline rounded-xl p-3 text-on-surface font-medium outline-none focus:border-accent-primary resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowPostOpenModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-outline hover:bg-surface-container text-on-surface-variant font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-accent-primary text-white font-bold flex items-center justify-center gap-1.5 hover:shadow-lg transition-all cursor-pointer font-display"
                >
                  <Store className="w-3.5 h-3.5" /> Posting ke Bursa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Conflict Auto-Resolver Modal */}
      {conflictModalId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-outline w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-psy-danger/20 bg-psy-danger-bg flex justify-between items-center">
              <div>
                <h3 className="font-bold text-psy-danger font-display text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Deteksi Risiko Kelelahan & Solusi AI
                </h3>
                <p className="text-[11px] text-psy-danger-text mt-0.5 font-medium">Validasi standar istirahat minimum 8 jam (Deputy & When I Work standard)</p>
              </div>
              <button onClick={() => setConflictModalId(null)} className="p-2 text-psy-danger hover:bg-psy-danger/10 rounded-xl transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-psy-danger-bg/40 border border-psy-danger/30 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-psy-danger-text">Konflik Jadwal:</span>
                  <p className="font-bold text-on-surface">Jeda Istirahat: 5 Jam</p>
                  <p className="text-[10px] text-on-surface-variant">Closing (01:00) ➔ Pagi (06:00)</p>
                  <span className="inline-block px-2 py-0.5 rounded bg-psy-danger text-white font-mono text-[9px] font-bold">
                    ⚠️ Risiko Fatigue Tinggi
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-psy-safe-bg/60 border border-psy-safe/40 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-psy-safe-text">Rekomendasi AI:</span>
                  <p className="font-bold text-on-surface">Jeda Istirahat: 13 Jam</p>
                  <p className="text-[10px] text-on-surface-variant">Geser ke Shift Sore (14:00 - 23:00)</p>
                  <span className="inline-block px-2 py-0.5 rounded bg-psy-safe text-white font-mono text-[9px] font-bold">
                    ✓ 100% Aman & Terverifikasi
                  </span>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl border border-outline text-on-surface-variant text-[11px] leading-relaxed">
                <strong className="text-on-surface">Mekanisme Auto-Resolver:</strong> AI akan menyetujui swap dengan otomatis memindahkan alokasi ke shift sore tanpa mengurangi jam kerja atau headcount kedai.
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={() => {
                    const prevRequests = [...swapRequests]
                    sound.playSuccess()
                    updateSwapRequestStatus(conflictModalId, 'Disetujui')
                    addAuditLog({ user: 'System AI', action: 'Auto-Fix Swap', detail: `Auto-fix konflik swap shift ID ${conflictModalId} ke Shift Sore` })
                    toast.success("Rekomendasi AI berhasil diterapkan. Shift dialihkan ke Sore dan disetujui.", {
                      duration: 5000,
                      action: {
                        label: 'Undo',
                        onClick: () => {
                          sound.playClick()
                          restoreSnapshot({ swapRequests: prevRequests })
                          toast.info("Auto-fix swap shift dibatalkan.")
                        }
                      }
                    })
                    setConflictModalId(null)
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-primary to-primary text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer font-display text-xs"
                >
                  <Sparkles className="w-4 h-4" /> Terapkan Rekomendasi AI & Setujui
                </button>

                <button 
                  onClick={() => {
                    const prevRequests = [...swapRequests]
                    sound.playWarning()
                    updateSwapRequestStatus(conflictModalId, 'Disetujui')
                    addAuditLog({ user: 'Manager', action: 'Force Approve', detail: `Force approve konflik swap shift ID ${conflictModalId}` })
                    toast.warning("Force approve dilakukan tanpa penyesuaian shift.", {
                      duration: 5000,
                      action: {
                        label: 'Undo',
                        onClick: () => {
                          sound.playClick()
                          restoreSnapshot({ swapRequests: prevRequests })
                          toast.info("Persetujuan swap dibatalkan.")
                        }
                      }
                    })
                    setConflictModalId(null)
                  }}
                  className="w-full py-2.5 rounded-xl bg-transparent border border-outline hover:bg-surface-container text-on-surface-variant font-bold flex items-center justify-center transition-colors cursor-pointer text-xs"
                >
                  Tetap Setujui Manual (Abaikan Peringatan)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
