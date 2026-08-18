import { useHRStore } from '@/store/useHRStore'
import { TiltCard } from '@/components/motion/TiltCard'
import { MapPin, Clock, Download, CheckCircle2, AlertCircle, Camera, Navigation, Radio, Check, X, Compass, Coffee, Zap, BatteryLow, MessageSquarePlus, Send, AlertTriangle, Play, Pause, Activity, Copy, ClipboardCheck, CheckSquare, Square, ShieldCheck, FileCheck2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useState, useEffect, useMemo } from 'react'
import { sound } from '@/lib/sound'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tooltip } from '@/components/ui/Tooltip'
import { BRANCH_PROFILES } from '@/lib/branches'

const MOOD_DESCRIPTIONS: Record<string, string> = {
  'ready': 'Siap Tempur: Energi optimal 100%, siap menghadapi rush hour.',
  'good': 'Bugar & Fokus: Kondisi stabil dan konsentrasi prima.',
  'tired': 'Butuh Kopi: Sedikit lelah, butuh asupan kafein sebelum lantai sibuk.',
  'stressed': 'Kelelahan: Risiko fatigue tinggi, manajer akan memantau rotasi shift.'
}

export function Attendance() {
  const employees = useHRStore(state => state.employees)
  const activeRole = useHRStore(state => state.activeRole)
  const activeEmployeeId = useHRStore(state => state.activeEmployeeId)
  const activeBranch = useHRStore(state => state.activeBranch)
  const attendances = useHRStore(state => state.attendances)
  const recordAttendance = useHRStore(state => state.recordAttendance)
  const handoverNotes = useHRStore(state => state.handoverNotes)
  const addHandoverNote = useHRStore(state => state.addHandoverNote)
  const employeeMoods = useHRStore(state => state.employeeMoods)
  const setEmployeeMood = useHRStore(state => state.setEmployeeMood)
  const sopTasks = useHRStore(state => state.sopTasks)
  const toggleSopTask = useHRStore(state => state.toggleSopTask)
  const addAttestationRecord = useHRStore(state => state.addAttestationRecord)
  const addAuditLog = useHRStore(state => state.addAuditLog)

  const currentBranch = BRANCH_PROFILES[activeBranch] || BRANCH_PROFILES['Senopati (HQ)']

  const [currentTime, setCurrentTime] = useState(new Date())
  const [gpsModal, setGpsModal] = useState<{ name: string, coords: string, geofence: string } | null>(null)
  const [mockDistance, setMockDistance] = useState(25) // meters from HQ

  // Active Attestation Clock-Out State
  const [showAttestationModal, setShowAttestationModal] = useState(false)
  const [attestationForm, setAttestationForm] = useState({
    hadBreak: true,
    isFit: true,
    notes: ''
  })

  // SOP Checklist State
  const [activeSopTab, setActiveSopTab] = useState<'Pagi' | 'Closing'>('Pagi')

  // Break Timer State
  const [breakActive, setBreakActive] = useState(false)
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(30 * 60) // 30 minutes

  // Handover Note State
  const [newNote, setNewNote] = useState('')
  const [notePriority, setNotePriority] = useState<'normal' | 'urgent'>('normal')

  // Selected Readiness
  const [selectedMood, setSelectedMood] = useState<'ready' | 'good' | 'tired' | 'stressed'>('ready')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Break Timer countdown
  useEffect(() => {
    let interval: any = null
    if (breakActive) {
      interval = setInterval(() => {
        setBreakSecondsLeft(prev => {
          if (prev <= 1) {
            sound.playWarning()
            toast.info("Waktu istirahat 30 menit telah berakhir. Selamat kembali bertugas!")
            setBreakActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [breakActive])

  const activeEmployee = employees.find(e => e.id === activeEmployeeId)
  const myAttendance = attendances.find(a => a.employeeId === activeEmployeeId && a.date === 'Hari Ini')

  const displayAttendances = activeRole === 'manager' 
    ? attendances 
    : attendances.filter(a => a.employeeId === activeEmployeeId)

  const handleClockIn = () => {
    sound.playSuccess()
    const geofenceText = mockDistance <= 100 
      ? `Inside Radius (${currentBranch.name} ${mockDistance}m)` 
      : `Outside Radius (${(mockDistance / 1000).toFixed(1)} km)`

    const moodLabels = {
      ready: 'Siap Tempur',
      good: 'Bugar & Fokus',
      tired: 'Butuh Kopi',
      stressed: 'Kelelahan'
    }

    recordAttendance(activeEmployeeId, 'in', geofenceText)
    setEmployeeMood(activeEmployeeId, selectedMood, moodLabels[selectedMood])

    toast.success("Clock-in Berhasil Dicatat!", {
      description: `Kesiapan: ${moodLabels[selectedMood]} • ${geofenceText} • ${currentTime.toLocaleTimeString('id-ID')}`
    })
  }

  const handleClockOut = () => {
    sound.playClick()
    setShowAttestationModal(true)
  }

  const handleConfirmAttestationClockOut = () => {
    if (!activeEmployee) return
    sound.playSuccess()

    addAttestationRecord({
      employeeId: activeEmployeeId,
      employeeName: activeEmployee.name,
      date: 'Hari Ini',
      hadBreak: attestationForm.hadBreak,
      isFit: attestationForm.isFit,
      shiftConfirmed: true,
      notes: attestationForm.notes
    })

    addAuditLog({
      user: activeEmployee.name,
      action: 'Clock-Out Attestation',
      detail: `Attestation Selesai: Break ${attestationForm.hadBreak ? 'Ya' : 'Tidak'}, K3 Fit ${attestationForm.isFit ? 'Ya' : 'Tidak'}`
    })

    recordAttendance(activeEmployeeId, 'out')
    setShowAttestationModal(false)

    toast.success("Clock-out Berhasil & Attestation Tercatat!", {
      description: `Waktu Pulang: ${currentTime.toLocaleTimeString('id-ID')} • Compliance Verified`
    })
  }

  const handleAddHandover = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    sound.playSuccess()
    addHandoverNote(newNote.trim(), activeEmployee?.name || 'Staff', 'Shift Berjalan', notePriority)
    toast.success("Catatan serah terima berhasil ditambahkan ke logbook!")
    setNewNote('')
  }

  const formatBreakTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Manager Attendance Analytics Calculations
  const attendanceMetrics = useMemo(() => {
    const total = attendances.length || 1
    const tepatWaktu = attendances.filter(a => a.status === 'Tepat Waktu').length
    const terlambat = attendances.filter(a => a.status === 'Terlambat').length
    const izin = attendances.filter(a => a.status === 'Izin').length
    const insideGeofence = attendances.filter(a => a.geofence.startsWith('Inside')).length
    const punctualityRate = Math.round((tepatWaktu / total) * 100)
    const geofenceComplianceRate = Math.round((insideGeofence / total) * 100)

    return { total, tepatWaktu, terlambat, izin, insideGeofence, punctualityRate, geofenceComplianceRate }
  }, [attendances])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Panel */}
      <div className="glass-panel spotlight-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface font-display">Presensi & Shift Operations</h2>
            <Tooltip content={activeRole === 'manager' ? 'Mode manajer untuk memonitor kehadiran seluruh staf secara live.' : 'Portal mandiri karyawan untuk check-in dan serah terima shift.'}>
              <span className="px-3 py-1 rounded-full bg-surface-container-high text-semantic-neutral text-xs font-bold uppercase tracking-wider border border-semantic-neutral/30 font-mono cursor-help">
                {activeRole === 'manager' ? 'Manager Command Center' : 'Employee Self-Service'}
              </span>
            </Tooltip>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Verifikasi kehadiran real-time berbasis GPS Geofencing radius 100m {currentBranch.name} dan digital shift handover.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeRole === 'manager' && (
            <Tooltip content="Ekspor rekapitulasi presensi seluruh staf ke file Excel/CSV">
              <button 
                onClick={() => {
                  sound.playClick()
                  toast.success("Laporan kehadiran berhasil di-export ke Excel (XLSX).")
                }}
                className="bg-surface-container-high text-on-surface hover:text-accent-primary border border-surface-container-highest text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-accent-primary" /> Export Rekap CSV/XLSX
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Employee Quick Clock-In Widget */}
      {activeRole === 'karyawan' && activeEmployee && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-outline relative overflow-hidden bg-gradient-to-br from-surface to-surface-container">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <img src={activeEmployee.avatar} alt={activeEmployee.name} className="w-12 h-12 rounded-2xl object-cover border border-outline" />
                <div>
                  <h3 className="text-lg font-bold text-on-surface font-display">{activeEmployee.name}</h3>
                  <p className="text-xs text-on-surface-variant">{activeEmployee.role} • {activeEmployee.dept}</p>
                </div>
              </div>

              {/* Digital Clock */}
              <Tooltip content="Waktu server tersinkronisasi presisi detik WIB">
                <div className="bg-surface-container-lowest border border-outline px-4 py-2 rounded-2xl flex items-center gap-2 font-mono shadow-sm cursor-help">
                  <Clock className="w-4 h-4 text-accent-primary animate-pulse" />
                  <span className="text-xl font-bold text-on-surface tracking-wider">
                    {currentTime.toLocaleTimeString('id-ID')}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-sans font-semibold">WIB</span>
                </div>
              </Tooltip>
            </div>

            {/* Pre-Shift Readiness Barometer */}
            {(!myAttendance || myAttendance.timeIn === '--:--') && (
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline mb-5">
                <label className="text-xs font-bold text-on-surface block mb-2">
                  Bagaimana tingkat energimu sebelum mulai shift?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ready', label: 'Siap Tempur', icon: Zap },
                    { id: 'good', label: 'Bugar & Fokus', icon: CheckCircle2 },
                    { id: 'tired', label: 'Butuh Kopi', icon: Coffee },
                    { id: 'stressed', label: 'Kelelahan', icon: BatteryLow }
                  ].map((m) => (
                    <Tooltip key={m.id} content={MOOD_DESCRIPTIONS[m.id]}>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick()
                          setSelectedMood(m.id as any)
                        }}
                        className={cn(
                          "p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full",
                          selectedMood === m.id 
                            ? "bg-accent-primary/10 border-accent-primary text-accent-primary shadow-sm" 
                            : "bg-surface-container-low text-on-surface-variant border-outline hover:border-accent-primary/40"
                        )}
                      >
                        <m.icon className="w-3.5 h-3.5" /> {m.label}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}

            {/* Geofence Status Bar */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-accent-primary" /> Status GPS Geofencing
                </span>
                <Tooltip content={mockDistance <= 100 ? 'Posisi Anda valid berada di dalam batas toleransi radius 100m Kedai Senopati.' : 'Peringatan: Posisi Anda di luar batas 100m dari kedai! Clock-in akan ditandai diluar area.'}>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-help",
                    mockDistance <= 100 ? "bg-psy-safe-bg text-psy-safe-text" : "bg-psy-danger-bg text-psy-danger-text"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full animate-ping", mockDistance <= 100 ? "bg-psy-safe" : "bg-psy-danger")} />
                    {mockDistance <= 100 ? `Dalam Radius HQ (${mockDistance}m)` : `Di Luar Radius (${mockDistance}m)`}
                  </span>
                </Tooltip>
              </div>

              <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <span>Titik: Kedai Senopati HQ (-6.2289, 106.8021)</span>
                  <Tooltip content="Salin koordinat GPS Senopati HQ">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSuccess()
                        navigator.clipboard.writeText("-6.2289, 106.8021")
                        toast.success("Koordinat GPS disalin!")
                      }}
                      className="p-1 rounded hover:bg-surface-container text-accent-primary cursor-pointer transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </Tooltip>
                </div>
                <Tooltip content="Ubah simulasi jarak GPS untuk menguji respon validasi geofence">
                  <button 
                    onClick={() => {
                      sound.playClick()
                      setMockDistance(prev => prev <= 50 ? 1500 : 25)
                    }}
                    className="text-accent-primary hover:underline font-semibold cursor-pointer"
                  >
                    Simulasi Jarak: {mockDistance <= 50 ? 'Jauhkan (1.5km)' : 'Dekatkan (25m)'}
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Clock-In / Out & Break Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!myAttendance || myAttendance.timeIn === '--:--' ? (
                <Tooltip content="Lakukan presensi masuk shift dan rekam koordinat GPS saat ini">
                  <button
                    onClick={handleClockIn}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-accent-primary to-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_24px_rgba(27,95,174,0.4)] transition-all active:scale-95 cursor-pointer font-display w-full"
                  >
                    <Camera className="w-4 h-4" /> Masuk Shift (Clock-In)
                  </button>
                </Tooltip>
              ) : (
                <div className="flex-1 p-3 rounded-2xl bg-psy-safe-bg border border-psy-safe/30 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-psy-safe shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-psy-safe-text">Sudah Masuk ({myAttendance.timeIn} WIB)</p>
                    <p className="text-[10px] text-on-surface-variant">{myAttendance.geofence}</p>
                  </div>
                </div>
              )}

              {/* Break Timer Button */}
              {myAttendance && myAttendance.timeIn !== '--:--' && myAttendance.timeOut === '--:--' && (
                <Tooltip content={breakActive ? 'Jeda penghitungan waktu istirahat' : 'Mulai istirahat kerja 30 menit sesuai regulasi ketenagakerjaan'}>
                  <button
                    onClick={() => {
                      sound.playClick()
                      setBreakActive(!breakActive)
                      toast.info(breakActive ? "Waktu istirahat dijeda." : "Waktu istirahat 30 menit dimulai!")
                    }}
                    className={cn(
                      "flex-1 py-3.5 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-display",
                      breakActive 
                        ? "bg-psy-warning-bg border-psy-warning/40 text-psy-warning-text animate-pulse" 
                        : "bg-surface-container-high border-outline hover:bg-surface-container text-on-surface"
                    )}
                  >
                    {breakActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-accent-primary" />}
                    <span>{breakActive ? `Sedang Istirahat (${formatBreakTimer(breakSecondsLeft)})` : 'Mulai Istirahat (30m)'}</span>
                  </button>
                </Tooltip>
              )}

              {myAttendance && myAttendance.timeOut === '--:--' && (
                <Tooltip content="Selesaikan shift kerja hari ini dan catat jam kepulangan resmi">
                  <button
                    onClick={handleClockOut}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-surface-container-high border border-outline hover:bg-surface-container text-on-surface font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer font-display"
                  >
                    <Clock className="w-4 h-4 text-accent-primary" /> Pulang Shift (Clock-Out)
                  </button>
                </Tooltip>
              )}

              {myAttendance && myAttendance.timeOut !== '--:--' && (
                <div className="flex-1 p-3 rounded-2xl bg-surface-container-lowest border border-outline flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent-primary" />
                  <div>
                    <p className="text-xs font-bold text-on-surface">Shift Selesai Hari Ini</p>
                    <p className="text-[10px] text-on-surface-variant">Keluar: {myAttendance.timeOut} WIB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Summary Card */}
          <TiltCard className="glass-panel p-6 rounded-3xl border border-outline flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-accent-primary uppercase tracking-wider mb-3">
                <Compass className="w-4 h-4" /> Rangkuman Kinerja Saya
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Total Kehadiran</span>
                  <span className="font-bold text-on-surface font-mono">22 Hari</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Tingkat Ketepatan Waktu</span>
                  <span className="font-bold text-psy-safe font-mono">98.5%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Sisa Hak Cuti</span>
                  <span className="font-bold text-accent-primary font-mono">8 Hari</span>
                </div>
                {employeeMoods[activeEmployeeId] && (
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-outline">
                    <span className="text-on-surface-variant font-medium">Mood Hari Ini</span>
                    <span className="font-bold text-accent-primary font-mono">{employeeMoods[activeEmployeeId].label}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline text-[11px] text-on-surface-variant mt-4">
              <p className="font-medium">Standar Kedai: Maksimal batas toleransi keterlambatan 10 menit dari jadwal pembukaan shift.</p>
            </div>
          </TiltCard>
        </div>
      )}

      {/* Manager Visual Overview & SVG Ring Charts */}
      {activeRole === 'manager' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SVG Punctuality Gauge */}
          <TiltCard className="glass-panel rounded-3xl p-6 border border-outline flex items-center gap-5">
            <Tooltip content={`Persentase staf yang hadir tepat waktu hari ini (${attendanceMetrics.tepatWaktu} dari ${attendanceMetrics.total} staf).`}>
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0 cursor-help">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-psy-safe transition-all duration-1000 ease-out"
                    strokeDasharray={`${attendanceMetrics.punctualityRate}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-bold font-mono text-on-surface">{attendanceMetrics.punctualityRate}%</span>
                  <span className="text-[9px] text-on-surface-variant font-medium uppercase">On-Time</span>
                </div>
              </div>
            </Tooltip>
            <div>
              <h4 className="font-bold text-sm text-on-surface font-display">Tingkat Ketepatan Waktu</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {attendanceMetrics.tepatWaktu} dari {attendanceMetrics.total} staf hadir sesuai jadwal hari ini.
              </p>
            </div>
          </TiltCard>

          {/* SVG Geofence Gauge */}
          <TiltCard className="glass-panel rounded-3xl p-6 border border-outline flex items-center gap-5">
            <Tooltip content={`Tingkat kepatuhan presensi di dalam radius 100m ${currentBranch.name} (${attendanceMetrics.insideGeofence} dari ${attendanceMetrics.total} staf).`}>
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0 cursor-help">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-accent-primary transition-all duration-1000 ease-out"
                    strokeDasharray={`${attendanceMetrics.geofenceComplianceRate}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-bold font-mono text-on-surface">{attendanceMetrics.geofenceComplianceRate}%</span>
                  <span className="text-[9px] text-on-surface-variant font-medium uppercase">HQ Valid</span>
                </div>
              </div>
            </Tooltip>
            <div>
              <h4 className="font-bold text-sm text-on-surface font-display">Kepatuhan Geofence</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Verifikasi posisi GPS radius 100m Kedai Senopati.
              </p>
            </div>
          </TiltCard>

          {/* Live Floor Activity Snapshot */}
          <TiltCard className="glass-panel rounded-3xl p-6 border border-outline flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status Kehadiran Hari Ini</span>
              <Activity className="w-4 h-4 text-accent-primary" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <Tooltip content="Staf yang check-in sebelum atau tepat pada jam shift dimulai">
                <div className="p-2 rounded-xl bg-psy-safe-bg border border-psy-safe/20 cursor-help w-full">
                  <p className="text-lg font-bold font-mono text-psy-safe-text">{attendanceMetrics.tepatWaktu}</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">Tepat</p>
                </div>
              </Tooltip>
              <Tooltip content="Staf yang check-in lebih dari batas toleransi 10 menit">
                <div className="p-2 rounded-xl bg-psy-warning-bg border border-psy-warning/20 cursor-help w-full">
                  <p className="text-lg font-bold font-mono text-psy-warning-text">{attendanceMetrics.terlambat}</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">Terlambat</p>
                </div>
              </Tooltip>
              <Tooltip content="Staf yang mengajukan izin resmi atau cuti tahunan">
                <div className="p-2 rounded-xl bg-surface-container-high border border-outline cursor-help w-full">
                  <p className="text-lg font-bold font-mono text-on-surface">{attendanceMetrics.izin}</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">Izin</p>
                </div>
              </Tooltip>
            </div>
          </TiltCard>
        </div>
      )}

      {/* Shift SOP & Operational Checklist (Deputy & 7shifts standard) */}
      <div className="glass-panel p-6 rounded-3xl border border-outline">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-on-surface font-display">Shift SOP & Operational Checklist</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-accent-primary font-mono text-[10px] font-bold border border-outline">
                  {sopTasks.filter(t => t.shiftType === activeSopTab && t.completed).length}/{sopTasks.filter(t => t.shiftType === activeSopTab).length} Selesai
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">Checklist kepatuhan pembukaan kedai dan serah terima closing berstandar Deputy</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-2xl border border-outline">
            <button
              onClick={() => { sound.playClick(); setActiveSopTab('Pagi') }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeSopTab === 'Pagi' ? "bg-accent-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Opening (Pagi)
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveSopTab('Closing') }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeSopTab === 'Closing' ? "bg-accent-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Closing (Malam)
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-on-surface-variant">
            <span>Kepatuhan SOP Shift {activeSopTab}:</span>
            <span className="font-mono text-accent-primary">
              {Math.round((sopTasks.filter(t => t.shiftType === activeSopTab && t.completed).length / (sopTasks.filter(t => t.shiftType === activeSopTab).length || 1)) * 100)}% Selesai
            </span>
          </div>
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden border border-outline">
            <div 
              className="h-full bg-gradient-to-r from-accent-primary to-psy-safe transition-all duration-500 rounded-full"
              style={{ width: `${Math.round((sopTasks.filter(t => t.shiftType === activeSopTab && t.completed).length / (sopTasks.filter(t => t.shiftType === activeSopTab).length || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Checklist Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sopTasks.filter(t => t.shiftType === activeSopTab).map((task) => (
            <div
              key={task.id}
              onClick={() => {
                const activeEmp = employees.find(e => e.id === activeEmployeeId)
                if (!task.completed) {
                  sound.playSuccess()
                  toast.success(`SOP Selesai: ${task.title}`)
                } else {
                  sound.playClick()
                }
                toggleSopTask(task.id, activeEmp?.name || 'Staff')
              }}
              className={cn(
                "p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none",
                task.completed 
                  ? "bg-psy-safe-bg/30 border-psy-safe/30 text-on-surface" 
                  : "bg-surface-container-lowest border-outline hover:border-accent-primary/40 text-on-surface"
              )}
            >
              <div className="mt-0.5 shrink-0">
                {task.completed ? (
                  <CheckSquare className="w-4 h-4 text-psy-safe" />
                ) : (
                  <Square className="w-4 h-4 text-on-surface-variant" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className={cn("text-xs font-bold leading-snug", task.completed && "line-through text-on-surface-variant")}>
                  {task.title}
                </p>
                {task.completed && task.completedBy && (
                  <p className="text-[10px] font-mono text-psy-safe-text">
                    ✓ Dicek oleh {task.completedBy} • {task.completedAt}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Shift Handover Logbook (Deputy / 7shifts standard) */}
      <div className="glass-panel p-6 rounded-3xl border border-outline">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface font-display">Digital Shift Handover Logbook</h3>
              <p className="text-xs text-on-surface-variant">Catatan serah terima inventaris, kalibrasi, dan catatan operasional antar kru</p>
            </div>
          </div>
        </div>

        {/* Note List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
          {handoverNotes.map((note) => (
            <div 
              key={note.id} 
              className={cn(
                "p-4 rounded-2xl border text-xs space-y-2",
                note.priority === 'urgent' 
                  ? "bg-psy-warning-bg/40 border-psy-warning/30" 
                  : "bg-surface-container-lowest border-outline"
              )}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  {note.author} <span className="text-[10px] text-on-surface-variant font-normal">({note.shift})</span>
                </span>
                <span className="font-mono text-[10px] text-on-surface-variant">{note.time}</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed">{note.note}</p>
              {note.priority === 'urgent' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-psy-warning-text uppercase tracking-wider">
                  <AlertTriangle className="w-3 h-3" /> Perlu Tindakan Segera
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddHandover} className="flex flex-col sm:flex-row gap-2.5">
          <input 
            type="text" 
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Tambah catatan serah terima (misal: kalibrasi espresso, stok sirup, laporan mesin)..."
            className="flex-1 bg-surface-container-low border border-outline rounded-xl px-4 py-2.5 text-xs text-on-surface outline-none focus:border-accent-primary font-medium"
          />
          <div className="flex items-center gap-2">
            <select 
              value={notePriority}
              onChange={(e) => setNotePriority(e.target.value as any)}
              className="bg-surface-container-low border border-outline rounded-xl px-3 py-2.5 text-xs text-on-surface font-medium outline-none"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
            <button 
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-accent-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:shadow-md transition-all cursor-pointer font-display shrink-0"
            >
              <Send className="w-3.5 h-3.5" /> Kirim Catatan
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="glass-panel spotlight-card rounded-3xl overflow-hidden overflow-x-auto border border-outline p-0">
        <div className="p-4 border-b border-outline flex items-center justify-between bg-surface-container-lowest">
          <h3 className="font-bold text-sm text-on-surface font-display uppercase tracking-wider">
            {activeRole === 'manager' ? 'Log Presensi Tim (Real-Time)' : 'Riwayat Presensi Saya'}
          </h3>
          <span className="text-xs text-on-surface-variant font-mono">{displayAttendances.length} Catatan</span>
        </div>

        {displayAttendances.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Clock}
              title="Belum Ada Catatan Presensi"
              description="Belum ada riwayat check-in yang tercatat untuk periode ini."
            />
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container-high text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                <th className="p-4">Karyawan</th>
                <th className="p-4">Jam Masuk</th>
                <th className="p-4">Jam Keluar</th>
                <th className="p-4">Status Geofence</th>
                <th className="p-4">Status Kehadiran</th>
                <th className="p-4">Kesiapan / Mood</th>
                <th className="p-4">Verifikasi GPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-xs">
              {displayAttendances.map(record => (
                <tr key={record.id} className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={record.avatar} alt={record.name} className="w-8 h-8 rounded-full object-cover border border-outline" />
                      <div>
                        <p className="font-bold text-on-surface">{record.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{record.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 font-mono font-medium text-on-surface">
                      <Clock className="w-3.5 h-3.5 text-accent-primary" /> {record.timeIn}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 font-mono font-medium text-on-surface-variant">
                      <Clock className="w-3.5 h-3.5" /> {record.timeOut}
                    </div>
                  </td>
                  <td className="p-4">
                    <Tooltip content={`Status verifikasi lokasi GPS saat check-in: ${record.geofence}`}>
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-max cursor-help",
                        record.geofence.includes('Outside') 
                          ? "bg-psy-danger-bg text-psy-danger-text border border-psy-danger/20" 
                          : "bg-psy-safe-bg text-psy-safe-text border border-psy-safe/20"
                      )}>
                        <MapPin className="w-3 h-3" /> {record.geofence}
                      </span>
                    </Tooltip>
                  </td>
                  <td className="p-4">
                    <Tooltip content={record.status === 'Tepat Waktu' ? 'Staf hadir sebelum shift operasional dimulai.' : 'Staf tiba melewati jadwal pembukaan shift.'}>
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-max cursor-help",
                        record.status === 'Tepat Waktu' 
                          ? "bg-psy-safe-bg text-psy-safe-text border border-psy-safe/20" 
                          : "bg-psy-warning-bg text-psy-warning-text border border-psy-warning/20"
                      )}>
                        {record.status === 'Tepat Waktu' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {record.status}
                      </span>
                    </Tooltip>
                  </td>
                  <td className="p-4">
                    {employeeMoods[record.employeeId] ? (
                      <Tooltip content={`Kondisi kesiapan kerja sebelum shift: ${employeeMoods[record.employeeId].label}`}>
                        <span className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline text-[10px] font-bold text-on-surface font-mono cursor-help">
                          {employeeMoods[record.employeeId].label}
                        </span>
                      </Tooltip>
                    ) : (
                      <span className="text-[10px] text-on-surface-variant font-mono">Normal</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Tooltip content="Lihat koordinat presensi pada radar simulator radius GPS Kedai Senopati">
                      <button 
                        onClick={() => {
                          sound.playClick()
                          setGpsModal({
                            name: record.name,
                            coords: record.coordinates || '-6.2289, 106.8021',
                            geofence: record.geofence
                          })
                        }}
                        className="text-accent-primary font-bold hover:underline text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5" /> Radar GPS
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* GPS Radar Modal */}
      {gpsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm animate-in fade-in" onClick={() => setGpsModal(null)} />
          <div className="relative glass-panel bg-surface rounded-3xl shadow-2xl border border-outline w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-accent-primary" />
                <h3 className="font-bold font-display text-lg text-on-surface">Radar Lokasi GPS</h3>
              </div>
              <button onClick={() => setGpsModal(null)} className="p-2 hover:bg-surface-container-high rounded-full cursor-pointer">
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            {/* Radar Simulation Visual */}
            <div className="h-48 rounded-2xl bg-surface-container-lowest border border-outline relative overflow-hidden flex items-center justify-center mb-4">
              <div className="absolute w-40 h-40 rounded-full border border-accent-primary/20 animate-ping" />
              <div className="absolute w-28 h-28 rounded-full border border-accent-primary/40" />
              <div className="absolute w-16 h-16 rounded-full bg-accent-primary/10 border border-accent-primary/60 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-accent-primary" />
              </div>
              <span className="absolute bottom-2 left-3 text-[10px] font-mono text-on-surface-variant">Kedai Senopati HQ (Center)</span>
            </div>

            <div className="space-y-2 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Karyawan</span>
                <span className="font-bold text-on-surface">{gpsModal.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Koordinat GPS</span>
                <span className="font-bold text-on-surface font-mono">{gpsModal.coords}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Status Geofence</span>
                <span className="font-bold text-psy-safe-text">{gpsModal.geofence}</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick()
                window.open(`https://maps.google.com/?q=${gpsModal.coords}`, '_blank')
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-accent-primary text-white font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer font-display"
            >
              Buka di Google Maps
            </button>
          </div>
        </div>
      )}

      {/* Active Attestation Clock-Out Modal (Deputy Standard) */}
      {showAttestationModal && activeEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowAttestationModal(false)} />
          <div className="relative glass-panel bg-surface rounded-3xl shadow-2xl border border-outline w-full max-w-lg p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-outline pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-psy-safe-bg text-psy-safe-text rounded-2xl border border-psy-safe/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-lg text-on-surface">Active Attestation & Clock-Out</h3>
                  <p className="text-xs text-on-surface-variant">Konfirmasi regulasi ketenagakerjaan & K3 sebelum mengakhiri shift</p>
                </div>
              </div>
              <button onClick={() => setShowAttestationModal(false)} className="p-2 hover:bg-surface-container-high rounded-full cursor-pointer">
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Question 1: Break Time */}
              <div 
                onClick={() => {
                  sound.playClick()
                  setAttestationForm(prev => ({ ...prev, hadBreak: !prev.hadBreak }))
                }}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3",
                  attestationForm.hadBreak 
                    ? "bg-psy-safe-bg/60 border-psy-safe/40 text-on-surface" 
                    : "bg-surface-container-lowest border-outline text-on-surface-variant"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 shrink-0 transition-colors",
                  attestationForm.hadBreak ? "bg-psy-safe text-white border-psy-safe" : "border-outline bg-surface"
                )}>
                  {attestationForm.hadBreak && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">1. Hak Waktu Istirahat (Break Compliance)</p>
                  <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                    Saya menyatakan telah mengambil hak waktu istirahat minimal 30–60 menit tanpa gangguan operasional kerja selama shift berlangsung.
                  </p>
                </div>
              </div>

              {/* Question 2: Health & Safety */}
              <div 
                onClick={() => {
                  sound.playClick()
                  setAttestationForm(prev => ({ ...prev, isFit: !prev.isFit }))
                }}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3",
                  attestationForm.isFit 
                    ? "bg-psy-safe-bg/60 border-psy-safe/40 text-on-surface" 
                    : "bg-surface-container-lowest border-outline text-on-surface-variant"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 shrink-0 transition-colors",
                  attestationForm.isFit ? "bg-psy-safe text-white border-psy-safe" : "border-outline bg-surface"
                )}>
                  {attestationForm.isFit && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">2. Kondisi Fisik & Keselamatan Kerja (K3)</p>
                  <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                    Saya mengakhiri shift dalam kondisi fisik sehat dan tidak mengalami insiden/kecelakaan kerja di area operasional kedai.
                  </p>
                </div>
              </div>

              {/* Shift Notes / Handover feedback */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-on-surface block">
                  3. Catatan Akhir Shift / Handover (Opsional)
                </label>
                <textarea
                  value={attestationForm.notes}
                  onChange={(e) => setAttestationForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Contoh: Stok susu aman, mesin espresso sudah dibackflush dan disanitasi..."
                  className="w-full p-3 rounded-2xl bg-surface-container-lowest border border-outline text-xs text-on-surface focus:outline-none focus:border-accent-primary min-h-[70px] resize-none"
                />
              </div>

              {/* Compliance Legal Footer */}
              <div className="p-3 bg-surface-container-low rounded-2xl border border-outline text-[10px] text-on-surface-variant flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-accent-primary shrink-0" />
                <span>Pernyataan ini tersimpan di sistem audit HRMS sebagai bukti kepatuhan regulasi ketenagakerjaan resmi.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAttestationModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container border border-outline text-on-surface font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAttestationClockOut}
                className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-primary text-white font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer font-display"
              >
                <ShieldCheck className="w-4 h-4" /> Tanda Tangan & Selesaikan Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
